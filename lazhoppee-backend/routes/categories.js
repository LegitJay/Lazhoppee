const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', [requireAuth, admin], async (req, res) => {
  const { name } = req.body;
  try {
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    category = new Category({ name });
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', [requireAuth, admin], async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;