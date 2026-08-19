// backend/routes/listing/listingRoutes.js
import express from "express";
import { authRequired } from "../../middleware/authMiddleware.js";
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,       // ✅
} from "../../controllers/listingController.js";

const router = express.Router();

router.get("/", getAllListings);
router.get("/mine", authRequired, getMyListings); // ✅ used in frontend
router.get("/:id", getListingById);

router.post("/", authRequired, createListing, );
router.put("/:id", authRequired, updateListing);
router.delete("/:id", authRequired, deleteListing);

export default router;
