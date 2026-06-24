const router = require("express").Router();
const CartItem = require("../models/CartItem");

router.get("/", async (req, res) => {
  try {
    res.json(await CartItem.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const existing = await CartItem.findOne({ id: req.body.id });
    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.json(existing);
    }
    res.json(await CartItem.create({ ...req.body, quantity: 1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const item = await CartItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: "Not found" });
    item.quantity = req.body.quantity;
    if (item.quantity <= 0) {
      await item.deleteOne();
      return res.status(204).end();
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await CartItem.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
