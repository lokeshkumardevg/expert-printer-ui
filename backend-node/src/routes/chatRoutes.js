const express = require('express');
const router = express.Router();
const { chat, resetSession, createChat, getMessages, getChat } = require('../controllers/chatController');

router.post('/chat', chat);
router.post('/reset-session', resetSession);
router.post('/new', createChat);
router.get('/:id/messages', getMessages);
router.get('/:id', getChat);

module.exports = router;
