const express = require("express");
const router = express.Router();
const User = require("../models/User");
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
  }
);

module.exports = router;