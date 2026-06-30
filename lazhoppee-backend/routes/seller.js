const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SellerApplication = require("../models/SellerApplication");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

// POST /seller/apply
// Creates a pending application and moves the user to pendingSeller.
// No instant approval anymore — an admin has to review it.
router.post("/apply", requireAuth, async (req, res) => {
  try {
    const { storeName, storeDescription, location } = req.body;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({ message: "Store name is required." });
    }
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return res.status(400).json({ message: "A store location is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin accounts cannot become sellers." });
    }

    const existingPending = await SellerApplication.findOne({ userId: user._id, status: "pending" });
    if (existingPending) {
      return res.status(409).json({ message: "You already have a pending application." });
    }

    const application = await SellerApplication.create({
      userId: user._id,
      storeName: storeName.trim(),
      storeDescription: storeDescription ? storeDescription.trim() : "",
      location: { lat: location.lat, lng: location.lng },
    });

    user.role = "pendingSeller";
    await user.save();

    // Role changed, so reissue the token — the old one still carries the stale role.
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
      application,
    });
  } catch (err) {
    console.error("Become seller error:", err);
    res.status(500).json({ message: "Something went wrong while submitting your application." });
  }
});

// GET /seller/apply/me
// Lets the logged-in user check their latest application status — drives the progress bar.
router.get("/apply/me", requireAuth, async (req, res) => {
  try {
    const application = await SellerApplication.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /seller/applications?status=pending
// Admin only — list all applications, optionally filtered by status.
router.get("/applications", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const applications = await SellerApplication.find(filter)
      .populate("userId", "email")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /seller/applications/:id/approve
// Admin only — approves the application, promotes the user to storeOwner.
router.patch("/applications/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found." });

    application.status = "approved";
    await application.save();
    await User.findByIdAndUpdate(application.userId, { role: "storeOwner" });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /seller/applications/:id/reject
// Admin only — rejects the application, reverts the user to customer so they can reapply.
router.patch("/applications/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const application = await SellerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found." });

    application.status = "rejected";
    application.rejectionReason = req.body.reason || "";
    await application.save();
    await User.findByIdAndUpdate(application.userId, { role: "customer" });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;