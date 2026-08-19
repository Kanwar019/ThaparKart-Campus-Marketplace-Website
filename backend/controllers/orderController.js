// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Listing from "../models/Listing.js";

export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user?._id || req.user?.id;
    const { listingId } = req.body;

    if (!buyerId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!listingId) {
      return res.status(400).json({ message: "listingId is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (String(listing.user) === String(buyerId)) {
      return res
        .status(400)
        .json({ message: "You cannot reserve your own listing." });
    }

    const existing = await Order.findOne({
      buyer: buyerId,
      listing: listingId,
      status: { $ne: "Cancelled" },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already reserved this item." });
    }

    const order = await Order.create({
      buyer: buyerId,
      listing: listingId,
      status: "Reserved",
    });

    const populated = await order.populate({
      path: "listing",
      select: "title description price imageUrls user",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    return res.status(201).json(populated);
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user?._id || req.user?.id;
    if (!buyerId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orders = await Order.find({ buyer: buyerId })
      .populate({
        path: "listing",
        select: "title description price imageUrls user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
