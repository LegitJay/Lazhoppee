const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// POST /orders — create a new order
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, shipping } = req.body;
    const buyer = req.user.id;

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

    const order = new Order({ buyer, items, total, shipping });
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

// GET /orders — buyer's own orders
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate({
      path: 'items.product',
      model: 'Product'
    }).populate({
      path: 'items.seller',
      model: 'User',
      select: 'storeDetails.storeName'
    }).populate({
      path: 'courierId',
      model: 'User',
      select: 'username'
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /orders/courier — courier sees their assigned orders
router.get("/courier", requireAuth, requireRole("courier"), async (req, res) => {
  try {
    const orders = await Order.find({
      courierId: req.user.id,
      status: { $in: ['processing', 'in_transit', 'shipped', 'confirmed'] }
    }).populate('buyer', 'username');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /orders/:id/status — courier updates delivery status
router.patch("/:id/status", requireAuth, requireRole("courier"), async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['in_transit', 'delivered', 'unsuccessful'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'in_transit', 'delivered', or 'unsuccessful'." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (!order.courierId || order.courierId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not assigned to this order." });
    }

    order.trackingHistory.push({ status, note: note || '', updatedAt: new Date() });

    if (status === 'delivered') {
      order.status = 'shipped';
    } else if (status === 'unsuccessful') {
      order.status = 'unsuccessful';
    } else if (status === 'completed') {
      order.status = 'completed';
    } else {
      order.status = 'in_transit';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;