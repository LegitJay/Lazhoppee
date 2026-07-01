const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'Uncategorized' },
  stock: { type: Number, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema, "products");