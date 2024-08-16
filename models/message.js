// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: Date,
});

module.exports = mongoose.model('Message', messageSchema);
