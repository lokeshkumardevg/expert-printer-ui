const { Server } = require('socket.io');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

class SocketService {
  constructor() {
    this.io = null;
    this.agentCounts = new Map(); // userId -> number of open sockets (agent status)
    this.roomStaff   = new Map(); // chat_id -> Set(userId) (live room presence)
    this.roomCustomers = new Map(); // chat_id -> Set(socketId) (customer presence)
  }

  init(server) {
    this.io = new Server(server, {
      maxHttpBufferSize: 1e7, // 10MB to support high-res screenshots
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', async (socket) => {
      const { chat_id, user_id, role, notify } = socket.handshake.query;
      
      if (role === 'agent' || role === 'admin') {
        const count = this.agentCounts.get(user_id) || 0;
        this.agentCounts.set(user_id, count + 1);
        this.broadcastSystemStatus();
      }

      if (chat_id) {
        socket.join(`chat_${chat_id}`);
        this.sendQueuePosition(socket, chat_id);
      }

      if (notify === 'true' || role === 'agent' || role === 'admin') {
        socket.join('agent_notifications');
        this.sendPendingChats(socket);
      }

      if (chat_id) {
        const room = `chat_${chat_id}`;
        try {
          this.sendHistory(socket, chat_id);
          
          if (role === 'agent' || role === 'admin') {
            this.handleStaffJoin(chat_id, user_id, role);
          } else {
            this.handleCustomerJoin(chat_id, socket.id);
          }

          socket.on('message', async (data) => {
            if (!data?.text && data?.type !== 'image') return;
            await this.handleMessage(room, chat_id, role, data);
          });

          socket.on('typing', (data) => {
            socket.to(room).emit('typing', { sender_role: role });
          });

          socket.on('stop_typing', (data) => {
            socket.to(room).emit('stop_typing', { sender_role: role });
          });
        } catch (err) {
          console.error(`Error for chat ${chat_id}:`, err);
        }
      }

      socket.on('disconnect', () => {
        if (role === 'agent' || role === 'admin') {
          const count = this.agentCounts.get(user_id) || 0;
          if (count <= 1) this.agentCounts.delete(user_id);
          else this.agentCounts.set(user_id, count - 1);
          this.broadcastSystemStatus();
          
          if (chat_id) {
            this.handleStaffLeave(chat_id, user_id);
          }
        } else if (chat_id) {
          this.handleCustomerLeave(chat_id, socket.id);
        }
      });
    });

    // Clean up stale 'Waiting' statuses on startup. 
    Chat.updateMany({ status: { $in: ['waiting', 'active'] } }, { status: 'offline' })
      .then(() => console.log('Stale chats cleared to Inactive status.'))
      .catch(err => console.error('Stale cleanup failed:', err));
  }

  async broadcastSystemStatus() {
    if (!this.io) return;
    this.io.emit('system_status', {
      online_agents: this.agentCounts.size,
      timestamp: new Date().toISOString()
    });
  }

  async sendQueuePosition(socket, chat_id) {
    try {
      const chat = await Chat.findById(chat_id);
      if (chat && chat.status === 'waiting') {
        const waitingBefore = await Chat.countDocuments({
          status: 'waiting',
          created_at: { $lt: chat.created_at }
        });
        socket.emit('queue_update', {
          position: waitingBefore + 1,
          online_agents: this.onlineAgents.size
        });
      }
    } catch (err) {
      console.error('Queue Error:', err);
    }
  }

  async sendHistory(socket, chat_id) {
    try {
      const messages = await Message.find({ chat_id }).sort({ created_at: 1 });
      socket.emit('history', { 
        event: 'history', 
        messages: messages.map(m => ({
          id: m._id,
          chat_id: m.chat_id,
          sender: m.sender,
          text: m.text,
          type: m.type || 'text',
          created_at: m.created_at
        })) 
      });
    } catch (err) {
      console.error('History Error:', err);
    }
  }

  async handleCustomerJoin(chat_id, socket_id) {
    try {
      if (!this.roomCustomers.has(chat_id)) this.roomCustomers.set(chat_id, new Set());
      this.roomCustomers.get(chat_id).add(socket_id);

      const chat = await Chat.findById(chat_id);
      if (chat && chat.status !== 'resolved') {
        const staffSet = this.roomStaff.get(chat_id);
        const newStatus = (staffSet && staffSet.size > 0) ? 'active' : 'waiting';
        
        if (chat.status !== newStatus) {
            chat.status = newStatus;
            await chat.save();
        }

        this.io.to('agent_notifications').emit('chat_status_update', {
          chat_id,
          status: newStatus,
          online: true
        });
      }
    } catch (err) {
      console.warn('Cust Join Error:', err);
    }
  }

  async handleCustomerLeave(chat_id, socket_id) {
    try {
      const custSet = this.roomCustomers.get(chat_id);
      if (custSet) {
        custSet.delete(socket_id);
        if (custSet.size === 0) {
            this.roomCustomers.delete(chat_id);
            
            // Persist 'offline' status in DB so refresh shows Inactive
            const chat = await Chat.findById(chat_id);
            if (chat && chat.status !== 'resolved') {
               chat.status = 'offline';
               await chat.save();
            }

            // Notify staff that customer left (Offline)
            this.io.to('agent_notifications').emit('chat_status_update', {
                chat_id,
                status: 'offline',
                online: false
            });
        }
      }
    } catch (err) { console.warn('Cust Leave Error:', err); }
  }

  async handleStaffJoin(chat_id, user_id, role) {
    try {
      if (!this.roomStaff.has(chat_id)) this.roomStaff.set(chat_id, new Set());
      this.roomStaff.get(chat_id).add(user_id);

      const chat = await Chat.findById(chat_id);
      if (chat && chat.status !== 'resolved') {
        // Only flip to active if customer is actually online
        const customerIsOnline = this.roomCustomers.has(chat_id) && this.roomCustomers.get(chat_id).size > 0;
        
        let newStatus = chat.status;
        if (customerIsOnline) {
            newStatus = 'active';
            if (chat.status !== 'active') {
                chat.status = 'active';
                if (role === 'agent') chat.agent_id = user_id;
                await chat.save();
            }
        }

        this.io.to('agent_notifications').emit('chat_status_update', {
          chat_id,
          status: newStatus,
          online: customerIsOnline,
          agent_name: role === 'admin' ? 'Admin' : (chat.agent_id?.name || 'Agent')
        });

        this.io.to(`chat_${chat_id}`).emit('chat_accepted', { chat_id, agent_id: user_id });
      }
    } catch (err) {
      console.error('Staff Join Error:', err);
    }
  }

  async handleStaffLeave(chat_id, user_id) {
    try {
      const staffSet = this.roomStaff.get(chat_id);
      if (staffSet) {
        staffSet.delete(user_id);
        if (staffSet.size === 0) {
          this.roomStaff.delete(chat_id);
          
          const chat = await Chat.findById(chat_id);
          if (chat && (chat.status === 'active' || chat.status === 'waiting')) {
            const customerIsOnline = this.roomCustomers.has(chat_id) && this.roomCustomers.get(chat_id).size > 0;
            const newStatus = customerIsOnline ? 'waiting' : 'offline';
            
            chat.status = newStatus;
            await chat.save();

            this.io.to('agent_notifications').emit('chat_status_update', {
              chat_id,
              status: newStatus,
              online: customerIsOnline,
              agent_name: null
            });
            
            this.io.to(`chat_${chat_id}`).emit('chat_transferred', { chat_id });
          }
        }
      }
    } catch (err) {
      console.warn('Staff Leave Error:', err);
    }
  }

  async handleMessage(room, chat_id, role, data) {
    try {
      const type = data.type || 'text';
      const newMessage = new Message({
        chat_id,
        sender: role,
        text: data.text,
        type,
      });
      await newMessage.save();

      this.io.to(room).emit('message', {
        event: 'message',
        id: newMessage._id,
        sender: role,
        sender_name: data.sender_name || '',
        text: data.text,
        type,
        chat_id,
        created_at: newMessage.created_at,
      });
    } catch (err) {
      console.error('Message Error:', err);
    }
  }

  async handleTransfer(room, chat_id, user_id, data) {
    try {
      await Chat.findByIdAndUpdate(chat_id, { status: 'waiting', agent_id: null });
      const chat = await Chat.findById(chat_id);
      
      this.io.to('agent_notifications').emit('transfer_request', {
        event: 'transfer_request',
        chat_id,
        customer: data.customer || chat?.customer || '',
        from_agent: user_id,
        chat: {
          id: chat_id,
          customer: data.customer || chat?.customer || '',
          status: 'waiting',
        },
      });
      this.io.to(room).emit('chat_transferred', { event: 'chat_transferred', chat_id });
    } catch (err) {
      console.error('Transfer Error:', err);
    }
  }

  async sendPendingChats(socket) {
    try {
      const waitingCount = await Chat.countDocuments({ status: 'waiting' });
      const waitingChats = await Chat.find({ status: 'waiting' }).sort({ created_at: -1 });
      socket.emit('pending_chats', {
        event: 'pending_chats',
        count: waitingCount,
        chats: waitingChats,
      });
    } catch (err) {
      console.error('Pending Chats Error:', err);
    }
  }

  broadcast(room, data) {
    if (this.io) {
      this.io.to(room).emit(data.event || 'broadcast', data);
    }
  }

  notifyAgents(data) {
    if (this.io) {
      this.io.to('agent_notifications').emit(data.event || 'notification', data);
    }
  }
}

module.exports = new SocketService();
