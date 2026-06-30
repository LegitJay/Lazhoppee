const mongoose = require('mongoose');

const sellerApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    storeDescription: { type: String },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerApplication', sellerApplicationSchema);