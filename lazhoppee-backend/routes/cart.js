const router = require("express").Router();
const CartItem = require("../models/CartItem");
const { requireAuth } = require("../middleware/auth.middleware");

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    res.json(await CartItem.find({ userId: req.user.id }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { _id, __v, id, ...rest } = req.body;
    // Use _id for seller products (ObjectId string), fall back to numeric id for seed products
    const productId = String(_id || id);

    const existing = await CartItem.findOne({ userId: req.user.id, productId });
    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.json(existing);
    }

    const created = await CartItem.create({
      userId: req.user.id,
      productId,
      name: rest.name,
      price: rest.price,
      imageUrl: rest.imageUrl || '',
      category: rest.category || '',
      sellerId: rest.sellerId || null,
      quantity: 1,
    });
    res.json(created);
  } catch (err) {
    console.error("POST /cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:productId", async (req, res) => {
  try {
    const item = await CartItem.findOne({ userId: req.user.id, productId: req.params.productId });
    if (!item) return res.status(404).json({ error: "Not found" });
    item.quantity = req.body.quantity;
    if (item.quantity <= 0) { await item.deleteOne(); return res.status(204).end(); }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    await CartItem.deleteOne({ userId: req.user.id, productId: req.params.productId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;