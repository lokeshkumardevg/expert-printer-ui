import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../lib/constants";

export function useAgentNotifications({ userId, enabled = true }) {
  const socket = useRef(null);
  const [pendingChats, setPendingChats] = useState([]);

  useEffect(() => {
    if (!userId || !enabled) return;

    socket.current = io(API_BASE, {
      query: { user_id: userId, role: "agent", notify: "true" },
    });

    socket.current.on("new_chat_request", (data) => {
      setPendingChats(prev => {
        const chat = data.chat;
        if (prev.find(c => (c.id || c._id) === (chat.id || chat._id))) return prev;
        return [...prev, chat];
      });
    });

    socket.current.on("transfer_request", (data) => {
      setPendingChats(prev => {
        if (prev.find(c => (c.id || c._id) === data.chat_id)) return prev;
        return [...prev, {
          id: data.chat_id,
          customer: data.customer,
          status: "waiting",
          transfer: true,
          fromAgent: data.from_agent,
        }];
      });
    });

    socket.current.on("pending_chats", (data) => {
      setPendingChats(data.chats || []);
    });

    socket.current.on("chat_status_update", (data) => {
      // Custom event to update existing chat status in listing
      setPendingChats(prev => prev.map(c => 
        (c.id || c._id) === data.chat_id ? { ...c, status: data.status, agent: data.agent_name } : c
      ));
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [userId, enabled]);

  const dismiss = (chatId) =>
    setPendingChats(prev => prev.filter(c => (c.id || c._id) !== chatId));

  const clearAll = () => setPendingChats([]);

  return { pendingChats, dismiss, clearAll };
}
