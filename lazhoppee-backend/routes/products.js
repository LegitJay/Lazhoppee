const router = require("express").Router();
const Product = require("../models/Product");

// Public — all customers and store owners can browse
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All')
      filter.category = req.query.category;
    if (req.query.q)
      filter.name = { $regex: req.query.q, $options: 'i' };
    res.json(await Product.find(filter));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;