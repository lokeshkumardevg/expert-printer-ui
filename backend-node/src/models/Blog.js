const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  image: { type: String },
  author: { type: String, default: 'Admin' },
  category: { type: String, default: 'Technical Support' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', blogSchema);
