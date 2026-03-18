const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Blog = require('../models/Blog');

// Public blog list
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ created_at: -1 });
    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public single blog
router.get('/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ blog });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public lead submission
router.post('/leads', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newLead = new Lead({
      name,
      email,
      phone,
      issue: message,
      status: 'New'
    });
    await newLead.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
