const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth.middleware');

// POST /reviews - Create a new review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { product, order: orderId, rating, comment } = req.body;
    const user = req.user.id;

    const review = new Review({
      product,
      order: orderId,
      user,
      rating,
      comment
    });

    await review.save();

    // Update the order status to 'completed'
    await Order.findByIdAndUpdate(orderId, { status: 'completed' });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /reviews/seller - Get all reviews for the logged in seller
router.get('/seller', requireAuth, async (req, res) => {
  try {
    // Find products belonging to the seller
    const products = await Product.find({ seller: req.user.id }).select('_id');
    const productIds = products.map(p => p._id);

    // Find reviews for those products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('user', 'username')
      .populate('product', 'name'); // Also populating product name for context
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;