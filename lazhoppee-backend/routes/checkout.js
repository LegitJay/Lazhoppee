const router = require("express").Router();
const CartItem = require("../models/CartItem");

router.post("/", async (req, res) => {
  try {
    // req.body is the array of products from CartService.checkout()
    await CartItem.deleteMany({});
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
