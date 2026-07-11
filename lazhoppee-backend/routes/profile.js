const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth.middleware");

// GET /profile/addresses — get all addresses for the logged-in user
router.get("/addresses", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /profile/addresses — add a new address
router.post("/addresses", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = req.body;

    // If this is the first address, make it the default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    } else if (newAddress.isDefault) {
      // If the new address is set as default, unset the current default
      user.addresses.forEach((address) => (address.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /profile/addresses/:id — update an existing address
router.put("/addresses/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addressId = req.params.id;
    const updatedAddress = req.body;

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If the updated address is set as default, unset the current default
    if (updatedAddress.isDefault) {
      user.addresses.forEach((address) => (address.isDefault = false));
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...updatedAddress,
    };
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /profile/addresses/:id — delete an address
router.delete("/addresses/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addressId = req.params.id;

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.splice(addressIndex, 1);

    // If the deleted address was the default, and there are other addresses, make the first one the new default
    if (
      user.addresses.length > 0 &&
      !user.addresses.some((addr) => addr.isDefault)
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;