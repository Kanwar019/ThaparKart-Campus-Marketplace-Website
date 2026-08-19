// backend/routes/user/userRoutes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  getMyListings,
  deleteMyListing,
  getMyOrders,
  changePassword, // ✅ ADDED IMPORT
} from "../../controllers/userController.js";
import { authRequired } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Profile
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

// ✅ ADDED: Change Password Route
router.put("/change-password", authRequired, changePassword);

// My listings (from MongoDB, tied to logged-in user)
router.get("/my-listings", authRequired, getMyListings);
router.delete("/my-listings/:id", authRequired, deleteMyListing);

// Orders (still placeholder for now)
router.get("/my-orders", authRequired, getMyOrders);

export default router;