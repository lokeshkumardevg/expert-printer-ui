const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAgentStats,
  getMyLeads,
  updateLeadStatus,
  getAgentChats,
  acceptChat,
  resolveChat,
} = require('../controllers/agentController');

const agentOnly = [protect, authorize('agent')];

router.get('/stats', agentOnly, getAgentStats);
router.get('/leads', agentOnly, getMyLeads);
router.patch('/leads/:id/status', agentOnly, updateLeadStatus);
router.get('/chats', agentOnly, getAgentChats);
router.post('/chats/:id/accept', agentOnly, acceptChat);
router.post('/chats/:id/resolve', agentOnly, resolveChat);

module.exports = router;
