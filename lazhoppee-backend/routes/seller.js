const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/Product");
const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access restricted to ${role} only.` });
    }
    next();
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

// POST /seller/apply — customer submits seller application
router.post("/apply", requireAuth, async (req, res) => {
  try {
    const { storeName, storeDescription, location } = req.body;

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({ message: "Store name is required." });
    }
    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number"
    ) {
      return res.status(400).json({ message: "A store location is required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Admin accounts cannot apply to become sellers." });
    }
    if (user.role === "pendingSeller" || user.role === "storeOwner") {
      return res
        .status(400)
        .json({
          message: "You already have a pending or approved application.",
        });
    }

    const application = await SellerApplication.create({
      user: user._id,
      storeName: storeName.trim(),
      storeDescription: storeDescription ? storeDescription.trim() : "",
      location,
      status: "pending",
    });

    user.role = "pendingSeller";
    await user.save();

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
      application,
    });
  } catch (err) {
    console.error("Apply error:", err);
    res
      .status(500)
      .json({
        message: "Something went wrong while submitting your application.",
      });
  }
});

  // GET /seller/apply/me — customer checks their own application status
  router.get("/apply/me", requireAuth, async (req, res) => {
    try {
      const application = await SellerApplication.findOne({
        user: req.user.id,
      }).sort({ createdAt: -1 });
      if (!application)
        return res.status(404).json({ message: "No application found." });
      res.json(application);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // GET /seller/applications — admin views all applications, filterable by ?status=
  router.get(
    "/applications",
    requireAuth,
    requireRole("admin"),
    async (req, res) => {
      try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const applications = await SellerApplication.find(filter)
          .populate("user", "email role")
          .sort({ createdAt: -1 });
        res.json(applications);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },
  );

  // PATCH /seller/applications/:id/approve — admin approves application
  router.patch(
    "/applications/:id/approve",
    requireAuth,
    requireRole("admin"),
    async (req, res) => {
      try {
        const application = await SellerApplication.findById(
          req.params.id,
        ).populate("user");
        if (!application)
          return res.status(404).json({ message: "Application not found." });

        application.status = "approved";
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        await application.save();

        application.user.role = "storeOwner";
        // Copy store details from application to user's storeDetails
        application.user.storeDetails = {
          storeName: application.storeName,
          storeDescription: application.storeDescription,
          location: application.location,
          storeAddress: "", // You can add these later if needed
          storeContact: "",
          storeEmail: application.user.email
        };
        await application.user.save();

        res.json({ message: "Application approved.", application });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },
  );

// PATCH /seller/applications/:id/reject — admin rejects application
router.patch(
  "/applications/:id/reject",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const application = await SellerApplication.findById(
        req.params.id,
      ).populate("user");
      if (!application)
        return res.status(404).json({ message: "Application not found." });

      application.status = "rejected";
      application.rejectionReason = req.body.reason || "";
      application.reviewedBy = req.user.id;
      application.reviewedAt = new Date();
      await application.save();

      // Revert role so they can reapply
      application.user.role = "customer";
      await application.user.save();

      res.json({ message: "Application rejected.", application });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// GET /seller/products — seller's own listings only
router.get(
  "/products",
  requireAuth,
  requireRole("storeOwner"),
  async (req, res) => {
    try {
      res.json(await Product.find({ sellerId: req.user.id }));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// POST /seller/products — create a new listing
router.post(
  "/products",
  requireAuth,
  requireRole("storeOwner"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, category, stock } = req.body;

      if (!name || !price) {
        return res
          .status(400)
          .json({ message: "Name and price are required." });
      }

      const sellerId = req.user.id;
      const sellerApplication = await SellerApplication.findOne({
        $or: [
          { user: sellerId },
          { userId: mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId },
        ],
        status: "approved",
      });

      if (!sellerApplication) {
        return res
          .status(400)
          .json({ message: "Approved seller profile not found." });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const product = await Product.create({
        name,
        price: Number(price),
        category,
        stock: Number(stock) || 0,
        imageUrl,
        sellerId: req.user.id,
        storeName: sellerApplication.storeName,
      });

      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// PATCH /seller/products/:id — edit own listing
// PATCH /seller/products/:id — edit own listing (with optional image upload)
router.patch(
  "/products/:id",
  requireAuth,
  requireRole("storeOwner"),
  upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        sellerId: req.user.id,
      });
      if (!product)
        return res.status(404).json({ message: "Product not found." });

      const { name, price, category, stock } = req.body;
      if (name) product.name = name;
      if (price) product.price = Number(price);
      if (category) product.category = category;
      if (stock !== undefined) product.stock = Number(stock);
      if (req.file) product.imageUrl = `/uploads/${req.file.filename}`;

      await product.save();
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// DELETE /seller/products/:id — delete own listing
router.delete(
  "/products/:id",
  requireAuth,
  requireRole("storeOwner"),
  async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        sellerId: req.user.id,
      });
      if (!product)
        return res.status(404).json({ message: "Product not found." });
      await product.deleteOne();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;