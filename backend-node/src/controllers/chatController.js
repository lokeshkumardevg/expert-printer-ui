const Chat = require('../models/Chat');
const Lead = require('../models/Lead');
const Message = require('../models/Message');
const chatbotService = require('../services/chatbotService');
const socketService = require('../services/socketService');

// In-memory sessions (simulating Python's session store)
const userSessions = new Map();
const SESSION_TIMEOUT_MIN = 30;

const getOrCreateSession = (userId) => {
  cleanExpiredSessions();
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      mode: 'normal',
      contact: {},
      ai_answer_count: 0,
      support_started: false,
      last_active: new Date(),
    });
  }
  const session = userSessions.get(userId);
  session.last_active = new Date();
  return session;
};

const cleanExpiredSessions = () => {
  const now = new Date();
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.last_active > SESSION_TIMEOUT_MIN * 60 * 1000) {
      userSessions.delete(userId);
    }
  }
};

const chat = async (req, res) => {
  const { message } = req.body;
  const apiKey = req.headers['x-api-key'];
  const xUserId = req.headers['x-user-id'];
  const apiSecret = process.env.API_KEY_SECRET;

  if (apiSecret && apiKey !== apiSecret) {
    return res.status(401).json({ reply: 'Unauthorized', success: false });
  }

  const rawInput = message.trim();
  const userInput = rawInput.toLowerCase();

  if (!userInput) {
    return res.json({ reply: 'Please enter a message.', success: false });
  }

  const userId = xUserId || req.ip;
  const session = getOrCreateSession(userId);

  if (session.support_started) {
    return res.json({
      reply: '🟢 Certified printer technician connected. Please wait while they review your case.',
      success: true,
      connected: true,
    });
  }

  // Contact collection logic
  if (session.mode === 'collect_name') {
    session.contact.name = rawInput;
    session.mode = 'collect_email';
    return res.json({ reply: 'Please provide your email address.', success: true });
  }

  if (session.mode === 'collect_email') {
    if (!/[^@]+@[^@]+\.[^@]+/.test(rawInput)) {
      return res.json({ reply: 'Please enter a valid email address.', success: false });
    }
    session.contact.email = rawInput;
    session.mode = 'collect_phone';
    return res.json({ reply: 'Please provide your phone number.', success: true });
  }

  if (session.mode === 'collect_phone') {
    const digits = rawInput.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      return res.json({ reply: 'Please enter a valid phone number (7-15 digits).', success: false });
    }
    session.contact.phone = rawInput;
    session.mode = 'collect_location';
    return res.json({ reply: 'Please provide your city or country.', success: true });
  }

  if (session.mode === 'collect_location') {
    if (rawInput.trim().length < 2) {
      return res.json({ reply: 'Please enter a valid city or country name.', success: false });
    }
    session.contact.location = rawInput;
    chatbotService.saveLeadToFile(session.contact);
    session.mode = 'support_processing';
    session.support_started = true;
    return res.json({
      reply: '🟢 Thank you. A certified printer technician is now reviewing your request.',
      success: true,
      connected: true,
    });
  }

  // Explicit content check
  if (chatbotService.containsExplicit(userInput)) {
    return res.json({
      reply: "I'm sorry, I can only assist with printer-related questions.",
      success: true,
      not_printer: true,
    });
  }

  // Greetings
  for (const [key, reply] of Object.entries(chatbotService.greetings)) {
    if (userInput.split(/\s+/).includes(key)) {
      return res.json({ reply, success: true });
    }
  }

  // Negative keywords
  if (chatbotService.isNegativeKeyword(userInput)) {
    return res.json({
      reply: "Sorry, I can only assist with printer setup, connectivity, and technical issues.",
      success: true,
    });
  }

  // Printer relevance check
  if (!chatbotService.isPrinterRelated(userInput)) {
    return res.json({
      reply: "This doesn't seem related to a printer issue. Please ask a printer-related question.",
      success: true,
      not_printer: true,
    });
  }

  // Brand + issue match
  for (const [brand, link] of Object.entries(chatbotService.brand_links)) {
    if (userInput.includes(brand)) {
      for (const [issue, solution] of Object.entries(chatbotService.issues)) {
        if (userInput.includes(issue)) {
          return res.json({
            reply: `${solution} Visit ${brand.toUpperCase()} Support: ${link}`,
            success: true,
          });
        }
      }
      return res.json({
        reply: `Visit ${brand.toUpperCase()} Support: ${link}. Describe your issue.`,
        success: true,
      });
    }
  }

  // Keyword issue match
  for (const [issue, solution] of Object.entries(chatbotService.issues)) {
    if (userInput.includes(issue)) {
      return res.json({ reply: solution, success: true });
    }
  }

  // AI Fallback
  const replyText = await chatbotService.aiResponse(rawInput);
  session.ai_answer_count += 1;

  if (session.ai_answer_count >= 2) {
    session.mode = 'collect_name';
    return res.json({
      reply: 'This issue requires advanced assistance. Please provide your full name.',
      success: true,
    });
  }

  res.json({ reply: replyText, success: true });
};

const resetSession = async (req, res) => {
  const userId = req.headers['x-user-id'] || req.ip;
  userSessions.delete(userId);
  res.json({ success: true, message: 'Session reset.' });
};

const createChat = async (req, res) => {
  const data = req.body;
  const now = new Date().toISOString();

  try {
    // 1. Create lead
    const newLead = new Lead({
      customer: data.customer,
      email: data.email,
      phone: data.phone,
      location: data.location,
      printer: data.printer,
      issue: data.issue,
      status: 'New',
      created_at: now,
    });
    await newLead.save();

    // 2. Create chat session
    const newChat = new Chat({
      customer: data.customer,
      email: data.email,
      phone: data.phone,
      location: data.location,
      printer: data.printer,
      issue: data.issue,
      lead_id: newLead._id,
      status: 'waiting',
      created_at: now,
    });
    await newChat.save();

    // 3. Save chatbot conversation history
    if (data.history && data.history.length > 0) {
      const msgDocs = data.history.map(msg => ({
        chat_id: newChat._id.toString(),
        sender: msg.sender,
        text: msg.text,
        created_at: msg.created_at || now,
        is_history: true,
      }));
      await Message.insertMany(msgDocs);
    } else {
      const welcomeMsg = new Message({
        chat_id: newChat._id.toString(),
        sender: 'bot',
        text: `Customer reported: ${data.issue}. Printer: ${data.printer}. Location: ${data.location || 'not provided'}.`,
        created_at: now,
        is_history: true,
      });
      await welcomeMsg.save();
    }

    // 4. Notify all online agents
    socketService.notifyAgents({
      event: 'new_chat_request',
      chat: {
        id: newChat._id,
        customer: data.customer,
        email: data.email,
        phone: data.phone,
        location: data.location,
        printer: data.printer,
        issue: data.issue,
        status: 'waiting',
        created_at: now,
      },
    });

    res.json({ chat_id: newChat._id, lead_id: newLead._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat_id: req.params.id }).sort({ created_at: 1 });
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  chat,
  resetSession,
  createChat,
  getMessages,
  getChat,
};
