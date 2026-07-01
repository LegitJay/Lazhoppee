const router = require("express").Router();
const CartItem = require("../models/CartItem");
const { requireAuth } = require("../middleware/auth.middleware");

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    res.json(await CartItem.find({ userId: req.user.id }));
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("POST /cart body:", req.body);
    console.log("POST /cart user:", req.user);

    const { _id, __v, ...productData } = req.body;

    const existing = await CartItem.findOne({ userId: req.user.id, id: productData.id });
    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.json(existing);
    }
    const created = await CartItem.create({ ...productData, userId: req.user.id, quantity: 1 });
    res.json(created);
  } catch (err) {
    console.error("POST /cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const item = await CartItem.findOne({ userId: req.user.id, id: req.params.id });
    if (!item) return res.status(404).json({ error: "Not found" });
    item.quantity = req.body.quantity;
    if (item.quantity <= 0) {
      await item.deleteOne();
      return res.status(204).end();
    }
    await item.save();
    res.json(item);
  } catch (err) {
    console.error("PATCH /cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await CartItem.deleteOne({ userId: req.user.id, id: req.params.id });
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /cart/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;