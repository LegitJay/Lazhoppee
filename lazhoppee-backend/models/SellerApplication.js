const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    storeName: { type: String, required: true, trim: true, },
    storeDescription: { type: String, default: "", trim: true, },
    location: {
      lat: { type: Number, required: true, },

      lng: { type: Number, required: true, }
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", },
    rejectionReason: { type: String, default: "", },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, },
    reviewedAt: { type: Date, default: null, },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SellerApplication",
  sellerApplicationSchema
);