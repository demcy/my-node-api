// routes/chat.js
const express = require('express');
const Message = require('../models/message');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/send', auth, async (req, res) => {
  const { message } = req.body;
  try {
    const m = new Message(
      {
        message: message,
        user: req.session.userId
      });
    await m.save();
    res.status(201).json({ message: 'Message save successful' });
  } catch(err) {
    console.error('Message Save Error:', err);
      res.status(500).json({ message: 'Error processing message send request', error: err.message });
  }
});

module.exports = router;
