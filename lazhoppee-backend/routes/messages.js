const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ customer: req.user.id }, { seller: req.user.id }]
    })
      .populate('customer', 'username profileImage')
      .populate('seller', 'username profileImage storeDetails')
      .populate('product', 'name imageUrl')
      .sort({ lastMessageAt: -1 });

    // Drop conversations where the other party's account no longer exists
    const validConversations = conversations.filter(c => c.customer && c.seller);

    res.json(validConversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/conversations', auth, async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    let convo = await Conversation.findOne({
      customer: req.user.id,
      seller: sellerId,
      product: productId || null
    });
    if (!convo) {
      convo = await Conversation.create({
        customer: req.user.id,
        seller: sellerId,
        product: productId || null
      });
    }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'username profileImage')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;