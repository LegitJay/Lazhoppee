const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    shipping: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      region: { type: String, required: true },
      city: { type: String, required: true },
      barangay: { type: String, required: true },
      streetAddress: { type: String, required: true },
      postalCode: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "in_transit", "shipped", "completed", "cancelled", "confirmed", "unsuccessful"],
      default: "pending",
    },
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    trackingHistory: [
      {
        status: String,
        note: String,
        updatedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);