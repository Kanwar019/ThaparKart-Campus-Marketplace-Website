// backend/models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true }, // removed index:true here
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // removed index:true here
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// TTL index to auto-delete expired docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1 }); // optional index for queries by email

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
