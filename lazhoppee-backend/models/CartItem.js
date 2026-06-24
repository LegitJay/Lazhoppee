const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  imageUrl: String,
  category: String,
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("CartItem", cartItemSchema, "cart");
