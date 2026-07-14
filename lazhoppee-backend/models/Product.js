const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, },
    size: { type: String, required: true, },
    description: { type: String, default: "", },
    brand: { type: String, default: "", },
    price: { type: Number, required: true, }, imageUrl: { type: String, default: "", },
    category: { type: String, default: "Other", },
    stock: { type: Number, default: 0, },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    storeName: { type: String, required: true, },
    isActive: { type: Boolean, default: true, },
  },
{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema, "products");