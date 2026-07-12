const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const Order = require("../models/Order");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// GET /seller-orders - Fetch all orders for the logged-in seller
router.get("/", requireAuth, requireRole("storeOwner"), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const orders = await Order.find({ "items.product.seller": store._id }).populate("buyer", "username");
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// PATCH /seller-orders/:orderId - Update the status of an order
router.patch("/:orderId", requireAuth, requireRole("storeOwner"), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }
    const productIdsInOrder = order.items.map(item => item.product.seller.toString());
    if (!productIdsInOrder.includes(store._id.toString())) {
      return res.status(403).json({ message: "You are not authorized to update this order." });
    }

    order.status = status;

    if (status === 'confirmed') {
      const couriers = await User.find({ role: 'courier' });
      if (couriers.length > 0) {
        const randomCourier = couriers[Math.floor(Math.random() * couriers.length)];
        order.courierId = randomCourier._id;
      }
    }

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status." });
  }
});

module.exports = router;