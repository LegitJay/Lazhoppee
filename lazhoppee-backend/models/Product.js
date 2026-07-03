  const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  imageUrl: String,
  category: String,
});

module.exports = mongoose.model("Product", productSchema, "products"); // 3rd arg pins exact collection name
