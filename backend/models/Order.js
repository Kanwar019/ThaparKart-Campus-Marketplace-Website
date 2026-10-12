// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Reserved", "Pending Pickup", "Completed", "Cancelled"],
      default: "Reserved",
    },
  },
  { timestamps: true }
);

// Unique partial index: physically prevents duplicate non-cancelled orders for the same listing
orderSchema.index(
  { listing: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["Reserved", "Pending Pickup", "Completed"] },
    },
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
