// backend/models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    price: Number,
    imageUrls: [String],
    category: String,
    condition: { type: String, default: "" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError on reload
const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);

export default Listing;
