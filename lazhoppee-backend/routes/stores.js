const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// Get store by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.params.ownerId });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PUT - Update a store's details
router.put('/:storeId', requireAuth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if the logged-in user is the owner of the store
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized to update this store" });
    }

    const { storeName, storeDescription, storeAddress, storeContact, storeEmail, location } = req.body;

    // Update fields
    store.storeName = storeName || store.storeName;
    store.storeDescription = storeDescription || store.storeDescription;
    store.storeAddress = storeAddress || store.storeAddress;
    store.storeContact = storeContact || store.storeContact;
    store.storeEmail = storeEmail || store.storeEmail;
    store.location = location || store.location;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;