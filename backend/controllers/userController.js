// backend/controllers/userController.js
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";

// GET /api/profile
export const getProfile = (req, res) => {
  // authRequired already attached req.user
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const ADMIN_EMAILS = [
    "ksingh2_be23@thapar.edu",
    "ybhansali_be23@thapar.edu",
  ];
  const isAdmin =
    req.user.role === "admin" ||
    ADMIN_EMAILS.includes(req.user.email?.toLowerCase());

  return res.json({
    id: req.user._id.toString(),
    _id: req.user._id.toString(),
    name: req.user.name || "",
    email: req.user.email || "",
    role: req.user.role || (isAdmin ? "admin" : "user"),
    isAdmin,
  });
};

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select("name email");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile updated",
      profile: {
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

// GET /api/my-listings
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      user: req.user._id,
      status: { $ne: "deleted" },
    }).sort({
      createdAt: -1,
    });

    const formatted = listings.map((item) => ({
      id: item._id.toString(),
      status: item.status || "Active listing",
      total:
        typeof item.price === "number"
          ? `Listed at ₹${item.price}`
          : "Listed",
      title: item.title,
      price: item.price,
      createdAt: item.createdAt,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("Error in getMyListings:", err);
    return res.status(500).json({ message: "Server error fetching listings" });
  }
};

// DELETE /api/my-listings/:id (soft delete)
export const deleteMyListing = async (req, res) => {
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
    console.error("Error in deleteMyListing:", err);
    return res.status(500).json({ message: "Server error deleting listing" });
  }
};

// GET /api/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate({
        path: "listing",
        select: "title description price imageUrls user status",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("Error in getMyOrders:", err);
    return res.status(500).json({ message: "Server error fetching orders" });
  }
};

// ✅ ADDED: Change Password Logic
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both old and new passwords." });
    }

    // We must fetch the user explicitly to get the 'passwordHash'
    // (req.user from middleware might not have the hash depending on implementation)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update and save
    user.passwordHash = hashedPassword;
    await user.save();

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error in changePassword:", err);
    return res.status(500).json({ message: "Server error changing password." });
  }
};
