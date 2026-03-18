const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getStats,
  getLeads,
  updateLeadStatus,
  assignLead,
  deleteLead,
  getAgents,
  addAgent,
  updateAgent,
  deleteAgent,
  getChats,
  getChatMessages,
  resolveChat,
  assignChat,
  getWebsiteContent,
  updateWebsiteContent,
  getBlogs,
  addBlog,
  deleteBlog,
} = require('../controllers/adminController');

const adminOnly = [protect, authorize('admin')];

router.get('/stats', adminOnly, getStats);
router.get('/leads', adminOnly, getLeads);
router.patch('/leads/:id/status', adminOnly, updateLeadStatus);
router.patch('/leads/:id/assign', adminOnly, assignLead);
router.delete('/leads/:id', adminOnly, deleteLead);

router.get('/agents', adminOnly, getAgents);
router.post('/agents', adminOnly, addAgent);
router.put('/agents/:id', adminOnly, updateAgent);
router.delete('/agents/:id', adminOnly, deleteAgent);

router.get('/chats', adminOnly, getChats);
router.get('/chats/:id/messages', adminOnly, getChatMessages);
router.post('/chats/:id/resolve', adminOnly, resolveChat);
router.patch('/chats/:id/assign', adminOnly, assignChat);

router.get('/website', adminOnly, getWebsiteContent);
router.patch('/website', adminOnly, updateWebsiteContent);

router.get('/blogs', adminOnly, getBlogs);
router.post('/blogs', adminOnly, addBlog);
router.delete('/blogs/:id', adminOnly, deleteBlog);

module.exports = router;
