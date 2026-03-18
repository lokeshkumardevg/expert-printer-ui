const Lead = require('../models/Lead');
const Chat = require('../models/Chat');
const socketService = require('../services/socketService');

const getAgentStats = async (req, res) => {
  try {
    const user_id = req.user._id;
    const myLeads = await Lead.countDocuments({ assigned_to: user_id });
    const activeChats = await Chat.countDocuments({ agent_id: user_id, status: 'active' });
    const resolved = await Lead.countDocuments({ assigned_to: user_id, status: 'Resolved' });
    const waitingCount = await Chat.countDocuments({ status: 'waiting' });

    res.json([
      {
        label: 'My Leads',
        value: String(myLeads),
        change: '+5 today',
        positive: true,
        icon: 'list',
        accent: 'bg-blue-50 text-blue-500',
      },
      {
        label: 'Active Chats',
        value: String(activeChats),
        change: '2 pending reply',
        positive: false,
        icon: 'chat',
        accent: 'bg-orange-50 text-orange-500',
      },
      {
        label: 'Resolved Today',
        value: String(resolved),
        change: '+3 vs yesterday',
        positive: true,
        icon: 'checkCircle',
        accent: 'bg-emerald-50 text-emerald-500',
      },
      {
        label: 'Waiting Chats',
        value: String(waitingCount),
        change: 'Unassigned requests',
        positive: waitingCount === 0,
        icon: 'clock',
        accent: 'bg-amber-50 text-amber-500',
      },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ assigned_to: req.user._id }).sort({ created_at: -1 });
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

const getAgentChats = async (req, res) => {
  try {
    const waiting = await Chat.find({ status: 'waiting' }).sort({ created_at: -1 });
    const mine = await Chat.find({ agent_id: req.user._id }).sort({ created_at: -1 });

    const seen = new Set();
    const merged = [];
    [...waiting, ...mine].forEach(chat => {
      const idStr = chat._id.toString();
      if (!seen.has(idStr)) {
        seen.add(idStr);
        merged.push(chat);
      }
    });

    const statusOrder = { waiting: 0, active: 1, resolved: 2 };
    merged.sort((a, b) => (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3));

    res.json({ chats: merged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const acceptChat = async (req, res) => {
  try {
    const chat_id = req.params.id;
    const chatDoc = await Chat.findById(chat_id);
    if (!chatDoc) return res.status(404).json({ message: 'Chat not found' });
    if (chatDoc.status !== 'waiting' && chatDoc.status !== 'active') {
       return res.status(400).json({ message: `Chat is already ${chatDoc.status}` });
    }

    const agent_id = req.user._id;
    const agent_name = req.user.name || 'Agent';

    await Chat.findByIdAndUpdate(chat_id, {
      status: 'active',
      agent_id,
      agent_name,
      accepted_at: new Date().toISOString(),
    });

    if (chatDoc.lead_id) {
       await Lead.findByIdAndUpdate(chatDoc.lead_id, {
         assigned_to: agent_id,
         status: 'In Progress',
       });
    }

    socketService.broadcast(`chat_${chat_id}`, {
      event: 'chat_accepted',
      chat_id,
      agent_id,
      agent_name,
    });

    res.json({ ok: true, chat_id, agent_id, agent_name });
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

    res.json({ ok: true, chat_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAgentStats,
  getMyLeads,
  updateLeadStatus,
  getAgentChats,
  acceptChat,
  resolveChat,
};
