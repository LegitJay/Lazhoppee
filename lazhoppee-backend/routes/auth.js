const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product"); // To delete user's products
const { requireAuth } = require("../middleware/auth.middleware");

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

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists." });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return res
        .status(409)
        .json({ message: "That username is already taken." });
    }

    const safeRole = "customer";

    const user = new User({ username, email, password, role: safeRole });
    await user.save();

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong while registering." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong while logging in." });
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// PUT /auth/update-profile
// PUT /auth/update-profile
router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const { username, email, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (username) user.username = username;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// POST /auth/upload-profile-image
router.post("/upload-profile-image", requireAuth, async (req, res) => {
  try {
    const { image } = req.body; // expects a base64 data URL string
    if (!image) return res.status(400).json({ message: "No image provided." });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.profileImage = image;
    await user.save();

    res.json({ imageUrl: user.profileImage });
  } catch (err) {
    console.error("UploadProfileImage error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// GET /auth/users/:id  — public seller/user lookup (no sensitive fields)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username email role profileImage createdAt storeDetails",
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("GetUserById error:", err);
    res.status(400).json({ message: "Invalid user ID." });
  }
});

// DELETE /auth/me — PERMANENTLY delete the authenticated user's account
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User to delete not found." });
    }

    // If the user is a store owner, first delete all their products
    if (user.role === "storeOwner") {
      await Product.deleteMany({ seller: userId });
    }

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account successfully deleted." });
  } catch (err) {
    console.error("DeleteAccount error:", err);
    res.status(500).json({ message: "Something went wrong during account deletion." });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const crypto = require('crypto');
    const nodemailer = require('nodemailer');

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.GMAIL_USER,
      subject: 'Lazhoppee Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset-password/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password has been updated.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;