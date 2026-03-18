const User = require('../models/User');
const Lead = require('../models/Lead');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const WebsiteContent = require('../models/WebsiteContent');
const Blog = require('../models/Blog');
const socketService = require('../services/socketService');

const getStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({});
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const waitingChats = await Chat.countDocuments({ status: 'waiting' });
    const offlineChats = await Chat.countDocuments({ status: 'offline' });
    const resolved = await Lead.countDocuments({ status: 'Resolved' });
    const agents = await User.countDocuments({ role: 'agent' });

    res.json({
      total_leads: totalLeads,
      active_chats: activeChats,
      waiting_chats: waitingChats,
      offline_chats: offlineChats,
      resolved: resolved,
      total_agents: agents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ created_at: -1 });
    res.json({ leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignLead = async (req, res) => {
  try {
    const agent_id = req.body.agent_id;
    await Lead.findByIdAndUpdate(req.params.id, {
      assigned_to: agent_id,
      status: 'In Progress',
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).sort({ created_at: -1 }).select('-password');
    res.json({ agents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({ name, email, password, role: 'agent', phone });
    await newUser.save();
    res.json({ id: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const updateData = req.body;
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAgent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ created_at: -1 });
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat_id: req.params.id }).sort({ created_at: 1 });
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resolveChat = async (req, res) => {
  try {
    const chat_id = req.params.id;
    const now = new Date().toISOString();
    
    const chatDoc = await Chat.findByIdAndUpdate(chat_id, {
      status: 'resolved',
      resolved_at: now,
    });

    if (chatDoc && chatDoc.lead_id) {
      await Lead.findByIdAndUpdate(chatDoc.lead_id, {
        status: 'Resolved',
        resolved_at: now,
      });
    }

    socketService.broadcast(`chat_${chat_id}`, {
      event: 'chat_resolved',
      chat_id,
      resolved_at: now,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignChat = async (req, res) => {
  try {
    const agent_id = req.body.agent_id;
    await Chat.findByIdAndUpdate(req.params.id, {
      agent_id,
      status: 'active',
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getWebsiteContent = async (req, res) => {
  try {
    let contents = await WebsiteContent.find().sort({ category: 1 });
    
    // Seed defaults if totally empty
    if (contents.length === 0) {
      const defaults = [
        { key: 'HERO_TITLE', label: 'Hero Title', value: 'Instant Printer Support & Expert Setup Assistance', category: 'Banner' },
        { key: 'HERO_SUB', label: 'Hero Subtitle', value: 'Struggling with printer setup? Our certified technicians provide 24/7 remote diagnostics, driver installation, and troubleshooting for all major brands.', category: 'Banner' },
        { key: 'SUPPORT_PHONE', label: 'Support Phone', value: '+1-844-PRINTER-HELP', category: 'Contact' },
        { key: 'SEO_DESC', label: 'SEO Description', value: 'Get fast, reliable printer tech support for HP, Canon, Epson, and Brother printers. Expert assistance for offline issues, driver updates, and wireless setup.', category: 'SEO' },
      ];
      await WebsiteContent.insertMany(defaults);
      contents = await WebsiteContent.find().sort({ category: 1 });
    }
    
    res.json({ contents });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateWebsiteContent = async (req, res) => {
  try {
    const { key, value } = req.body;
    await WebsiteContent.findOneAndUpdate({ key }, { value, updated_at: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ created_at: -1 });
    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addBlog = async (req, res) => {
  try {
    const { title, content, image, category } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const newBlog = new Blog({ title, slug, content, image, category });
    await newBlog.save();
    res.json({ id: newBlog._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
  deleteBlog
};
