const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth.middleware");

// POST /reviews - Create a new review
router.post("/", requireAuth, async (req, res) => {
  try {
    const { product, order: orderId, rating, comment } = req.body;
    const user = req.user.id;

    const review = new Review({
      product,
      order: orderId,
      user,
      rating,
      comment,
    });

    await review.save();

    // Update the order status to 'completed'
    await Order.findByIdAndUpdate(orderId, { status: "completed" });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /reviews/product/:productId - Get all reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).populate("user", "username profileImage");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /reviews/seller - Get all reviews for the logged in seller
router.get("/seller", requireAuth, async (req, res) => {
  try {
    console.log("req.user.id:", req.user.id);

    const anyProduct = await Product.findOne().select("seller sellerId");
    console.log("sample product seller fields:", anyProduct);

    const products = await Product.find({ sellerId: req.user.id }).select('_id');
    console.log("matching products:", products.length);

    const reviews = await Review.find({
      product: { $in: products.map((p) => p._id) },
    })
      .populate("user", "username profileImage")
      .populate("product", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
