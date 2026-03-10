// src/hooks/useAgentNotifications.js
// Always-on WebSocket channel for agents — receives new chat alerts.
// Connects to: ws://localhost:8000/api/chats/ws/notify?user_id=X&role=agent

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/constants";

const WS_BASE = API_BASE.replace(/^http/, "ws");

export function useAgentNotifications({ userId, enabled = true }) {
  const ws                              = useRef(null);
  const [pendingChats, setPendingChats] = useState([]);

  useEffect(() => {
    if (!userId || !enabled) return;

    ws.current = new WebSocket(
      `${WS_BASE}/api/chats/ws/notify?user_id=${userId}&role=agent`
    );

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === "new_chat_request") {
        setPendingChats(prev => {
          // avoid duplicates
          if (prev.find(c => c.id === data.chat.id)) return prev;
          return [...prev, data.chat];
        });
      }
      if (data.event === "transfer_request") {
        setPendingChats(prev => {
          if (prev.find(c => c.id === data.chat_id)) return prev;
          return [...prev, {
            id:       data.chat_id,
            customer: data.customer,
            status:   "waiting",
            transfer: true,
            fromAgent: data.from_agent,
          }];
        });
      }
    };

    return () => ws.current?.close();
  }, [userId, enabled]);

  const dismiss = (chatId) =>
    setPendingChats(prev => prev.filter(c => c.id !== chatId));

  const clearAll = () => setPendingChats([]);

  return { pendingChats, dismiss, clearAll };
}
