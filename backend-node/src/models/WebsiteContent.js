const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  category: { type: String, default: 'General' },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);
