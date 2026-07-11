const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth.middleware");

// Create a new order
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, shipping } = req.body;
    const buyer = req.user.id;

    // TODO: Add validation for items and shipping info

    // Calculate total price and check stock
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product with id ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      total += product.price * item.quantity;
    }

    // Create a new order
    const order = new Order({
      buyer,
      items,
      total,
      shipping,
    });

    // Save the order and deduct stock
    await order.save();
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders for the logged in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate({
      path: 'items.product',
      model: 'Product'
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;