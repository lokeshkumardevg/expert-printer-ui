const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat_id: {
    type: mongoose.Schema.Types.String,
  },
  sender: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_history: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Message', messageSchema);
