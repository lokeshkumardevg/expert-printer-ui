// src/hooks/useChat.js
// Live WebSocket chat room — used by both Agent and Customer sides.
// Connects to: ws://localhost:8000/api/chats/ws/{chatId}?user_id=X&role=Y

import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE } from "../lib/constants";

const WS_BASE = API_BASE.replace(/^http/, "ws");

export function useChat({ chatId, userId, role }) {
  const ws                          = useRef(null);
  const [messages,   setMessages]   = useState([]);
  const [connected,  setConnected]  = useState(false);
  const [chatStatus, setChatStatus] = useState("waiting");

  useEffect(() => {
    if (!chatId || !userId) return;

    const url = `${WS_BASE}/api/chats/ws/${chatId}?user_id=${userId}&role=${role}`;
    ws.current = new WebSocket(url);

    ws.current.onopen  = () => setConnected(true);
    ws.current.onclose = () => setConnected(false);

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.event === "history") {
        setMessages(data.messages.map(m => ({ ...m, from: m.sender })));
      }
      if (data.event === "message") {
        setMessages(prev => [...prev, { id: data.id, from: data.sender, text: data.text }]);
      }
      if (data.event === "chat_accepted") {
        setChatStatus("active");
        setMessages(prev => [...prev, { id: Date.now(), from: "divider", text: "This issue assigned to you" }]);
      }
      if (data.event === "chat_resolved") {
        setChatStatus("resolved");
      }
    };

    return () => ws.current?.close();
  }, [chatId, userId, role]);

  const sendMessage = useCallback((text) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify({ event: "message", text }));
  }, []);

  const transferToAdmin = useCallback((customer) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify({ event: "transfer_to_admin", customer }));
  }, []);

  return { messages, connected, chatStatus, sendMessage, transferToAdmin };
}
