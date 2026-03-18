const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  status: {
    type: String,
    default: 'New',
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Lead', leadSchema);
