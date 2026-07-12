const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// GET /admin/users?role=customer  OR  ?role=storeOwner
router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !["customer", "storeOwner"].includes(role)) {
      return res.status(400).json({
        message: "Query param 'role' must be 'customer' or 'storeOwner'.",
      });
    }

    const users = await User.find({ role })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users." });
  }
});

// PATCH /admin/users/:id/deactivate
router.patch(
  "/users/:id/deactivate",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({ message: "User deactivated.", user });
    } catch (err) {
      console.error("Error deactivating user:", err);
      res.status(500).json({ message: "Server error deactivating user." });
    }
  }
);

// PATCH /admin/users/:id/activate
router.patch(
  "/users/:id/activate",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({ message: "User activated.", user });
    } catch (err) {
      console.error("Error activating user:", err);
      res.status(500).json({ message: "Server error activating user." });
  }
});

// ADMIN: Get all courier accounts
router.get("/couriers", [requireAuth, requireRole('admin')], async (req, res) => {
  try {
    const couriers = await User.find({ role: 'courier' }).select('-password');
    res.json(couriers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Create a new courier account
router.post("/couriers", [requireAuth, requireRole('admin')], async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }
    const user = new User({ username, email, password, role: 'courier' });
    await user.save();
    res.status(201).json({ message: "Courier account created successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Assign a courier to an order
router.patch("/orders/:id/assign-courier", [requireAuth, requireRole('admin')], async (req, res) => {
  try {
    const { courierId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { courierId: courierId, status: 'shipped' },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;