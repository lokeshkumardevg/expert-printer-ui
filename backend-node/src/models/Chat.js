const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  location: {
    type: String,
  },
  printer: {
    type: String,
  },
  issue: {
    type: String,
  },
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  agent_name: {
    type: String,
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'resolved'],
    default: 'waiting',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Chat', chatSchema);
