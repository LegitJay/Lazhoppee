const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id: Number,
  name: String,
  price: Number,
  imageUrl: String,
  category: String,
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("CartItem", cartItemSchema, "cart");