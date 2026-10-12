import mongoose from "mongoose";
import Order from "../models/Order.js";
import Listing from "../models/Listing.js";
import { isValidPrice } from "../utils/listingValidation.js";

const listingDetails = {
  path: "listing",
  select: "title description price imageUrls user status",
  populate: { path: "user", select: "name email" },
};
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const userId = (req) => {
  const id = req.user?._id || req.user?.id;
  if (!id) fail(401, "Not authenticated");
  return id;
};
const validId = (id) => {
  if (typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) {
    fail(400, "A valid item ID is required.");
  }
};
const sendError = (res, error, fallback) => {
  if (error.status) return res.status(error.status).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: "This item already has a reservation." });
  console.error(fallback, error);
  return res.status(500).json({ message: fallback });
};

export const createOrder = async (req, res) => {
  try {
    const buyerId = userId(req);
    const { listingId } = req.body;
    validId(listingId);
    // Retry transient conflicts as a unit; never reopen an item with a blind rollback.
    const order = await Order.db.transaction(async (session) => {
      const listing = await Listing.findById(listingId).session(session);
      if (!listing) fail(404, "Listing not found");
      if (String(listing.user) === String(buyerId)) fail(400, "You cannot reserve your own listing.");
      const reserved = await Listing.findOneAndUpdate(
        { _id: listingId, status: "active" }, { $set: { status: "reserved" } },
        { new: true, session }
      );
      if (!reserved) fail(409, "This item is no longer available or has already been reserved.");
      if (!isValidPrice(reserved.price)) fail(409, "The seller must correct this listing's price before it can be reserved.");
      const [created] = await Order.create([
        { buyer: buyerId, listing: listingId, status: "Reserved", priceAtReservation: reserved.price },
      ], { session });
      return created.populate({ ...listingDetails, options: { session },
        populate: { ...listingDetails.populate, options: { session } } });
    });
    return res.status(201).json(order);
  } catch (error) {
    return sendError(res, error, "Failed to create reservation. Please retry.");
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: userId(req) })
      .populate(listingDetails).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return sendError(res, error, "Failed to fetch reservations.");
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    // Derive ownership on the server, including older orders without seller fields.
    const listings = await Listing.find({ user: userId(req) }).select("_id");
    const orders = await Order.find({ listing: { $in: listings.map((listing) => listing._id) } })
      .populate(listingDetails).populate("buyer", "name email").sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return sendError(res, error, "Failed to fetch reservation requests.");
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const actor = String(userId(req));
    const { id } = req.params;
    validId(id);
    const { action, expectedStatus } = req.body;
    if (!["confirm", "complete", "cancel"].includes(action) ||
        !["Reserved", "Pending Pickup", "Completed", "Cancelled"].includes(expectedStatus)) {
      fail(400, "A valid action and current reservation status are required.");
    }
    const updated = await Order.db.transaction(async (session) => {
      const order = await Order.findById(id).session(session);
      if (!order) fail(404, "Reservation not found");
      const listing = await Listing.findById(order.listing).session(session);
      if (!listing) fail(404, "Listing not found");
      const isSeller = String(listing.user) === actor;
      const isBuyer = String(order.buyer) === actor;
      if (!isSeller && !isBuyer) fail(403, "You are not a participant in this reservation.");
      if (action !== "cancel" && !isSeller) fail(403, "Only the seller can confirm or complete pickup.");
      if (order.status !== expectedStatus) fail(409, "This reservation changed. Refresh and try again.");
      const allowed = action === "confirm" ? order.status === "Reserved"
        : action === "complete" ? order.status === "Pending Pickup"
        : ["Reserved", "Pending Pickup"].includes(order.status);
      if (!allowed) fail(409, "This action is not available for the current reservation status.");
      const nextStatus = action === "confirm" ? "Pending Pickup" : action === "complete" ? "Completed" : "Cancelled";
      const result = await Order.findOneAndUpdate(
        { _id: id, status: expectedStatus }, { $set: { status: nextStatus } },
        { new: true, runValidators: true, session }
      );
      if (!result) fail(409, "This reservation changed. Refresh and try again.");
      const changedListing = await Listing.findOneAndUpdate(
        { _id: order.listing, status: "reserved" },
        { $set: { status: action === "complete" ? "sold" : action === "cancel" ? "active" : "reserved" } },
        { new: true, session }
      );
      if (!changedListing) fail(409, "The listing status conflicts with this reservation. Please refresh.");
      return result;
    });
    return res.json({ _id: updated._id, status: updated.status });
  } catch (error) {
    return sendError(res, error, "Failed to update reservation. Please refresh before retrying.");
  }
};
