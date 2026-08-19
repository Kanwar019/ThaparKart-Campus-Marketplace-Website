// backend/controllers/listingController.js
import Listing from "../models/Listing.js";

// POST /api/listings  (create new listing)
export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, imageUrls, condition } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "Price is required." });
    }

    const listing = await Listing.create({
      user: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      price: Number(price),
      category: category || "",
      condition: condition || "",
      imageUrls: Array.isArray(imageUrls)
        ? imageUrls
        : imageUrls
        ? [imageUrls]
        : [],
      status: "active",
    });

    return res.status(201).json({
      message: "Listing created",
      listing,
    });
  } catch (err) {
    console.error("createListing error:", err);
    return res.status(500).json({ message: "Failed to create listing." });
  }
};

// GET /api/listings  (public – all active listings)
export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

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
    const {
      title,
      description,
      price,
      category,
      status,
      imageUrls,
      condition,
    } = req.body;

    const listing = await Listing.findOne({ _id: id, user: req.user._id });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (title !== undefined) listing.title = title.trim();
    if (description !== undefined) listing.description = description.trim();
    if (price !== undefined) listing.price = Number(price);
    if (category !== undefined) listing.category = category;
    if (condition !== undefined) listing.condition = condition;
    if (status !== undefined) listing.status = status;
    if (imageUrls !== undefined) {
      listing.imageUrls = Array.isArray(imageUrls)
        ? imageUrls
        : imageUrls
        ? [imageUrls]
        : [];
    }

    await listing.save();

    return res.json({
      message: "Listing updated",
      listing,
    });
  } catch (err) {
    console.error("updateListing error:", err);
    return res.status(500).json({ message: "Failed to update listing." });
  }
};

// DELETE /api/listings/:id  (owner only)
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Listing.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Listing not found" });
    }

    return res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("deleteListing error:", err);
    return res.status(500).json({ message: "Failed to delete listing." });
  }
};
