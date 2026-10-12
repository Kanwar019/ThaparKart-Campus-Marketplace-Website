// backend/controllers/listingController.js
import Listing from "../models/Listing.js";
import { validateListingInput } from "../utils/listingValidation.js";

// POST /api/listings  (create new listing)
export const createListing = async (req, res) => {
  try {
    const fields = validateListingInput(req.body);
    const listing = await Listing.create({
      description: "", category: "", condition: "", imageUrls: [],
      ...fields, user: req.user._id, status: "active",
    });

    return res.status(201).json({
      message: "Listing created",
      listing,
    });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ message: err.message });
    console.error("createListing error:", err);
    return res.status(500).json({ message: "Failed to create listing." });
  }
};

// GET /api/listings  (public – active listings with optional server pagination)
export const getAllListings = async (req, res) => {
  try {
    const { page, limit = 9, category, search } = req.query;

    const filter = { status: "active" };

    if (category) {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // If client passes page query param, return paginated payload
    if (page) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 9));
      const skip = (pageNum - 1) * limitNum;

      const [listings, total] = await Promise.all([
        Listing.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate("user", "name email"),
        Listing.countDocuments(filter),
      ]);

      return res.json({
        listings,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // Backward-compatible fallback for unpaginated frontend calls
    let query = Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    if (req.query.limit) {
      const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 9));
      query = query.limit(limitNum);
    }

    const listings = await query;
    return res.json(listings);
  } catch (err) {
    console.error("getAllListings error:", err);
    return res.status(500).json({ message: "Failed to load listings." });
  }
};

// GET /api/listings/:id  (public – single listing)
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("user", "name email");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.json(listing);
  } catch (err) {
    console.error("getListingById error:", err);
    return res.status(500).json({ message: "Failed to load listing." });
  }
};

// GET /api/listings/mine  (logged-in user's listings)
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(listings);
  } catch (err) {
    console.error("getMyListings error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load your listings." });
  }
};

// PUT /api/listings/:id  (owner only)
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;

    const listing = await Listing.findOne({ _id: id, user: req.user._id });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status !== "active") {
      return res.status(409).json({ message: "Only available listings can be edited. Cancel an active reservation first." });
    }
    if (status !== undefined && status !== "active") {
      return res.status(400).json({ message: "Listing status is managed through reservations." });
    }

    const changes = validateListingInput(req.body, { partial: true });

    const updated = await Listing.findOneAndUpdate(
      { _id: id, user: req.user._id, status: "active" },
      { $set: changes },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(409).json({ message: "This listing changed or was reserved. Please refresh." });
    }

    return res.json({
      message: "Listing updated",
      listing: updated,
    });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ message: err.message });
    console.error("updateListing error:", err);
    return res.status(500).json({ message: "Failed to update listing." });
  }
};

// DELETE /api/listings/:id  (owner only - soft delete)
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Listing.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        status: { $in: ["active", "sold"] },
      },
      { status: "deleted" },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Listing not found or unavailable. Cancel an active reservation before deleting." });
    }

    return res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("deleteListing error:", err);
    return res.status(500).json({ message: "Failed to delete listing." });
  }
};
