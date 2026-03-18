import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../lib/constants";

export function useChat({ chatId, userId, role }) {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [chatStatus, setChatStatus] = useState("waiting");
  const [queuePosition, setQueuePosition] = useState(0);
  const [onlineAgents, setOnlineAgents]   = useState(0);
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!chatId || !userId) return;

    socket.current = io(API_BASE, {
      query: { chat_id: chatId, user_id: userId, role },
    });

    socket.current.on("connect", () => {
      setConnected(true);
    });

    socket.current.on("disconnect", () => {
      setConnected(false);
    });

    socket.current.on("queue_update", (data) => {
      setQueuePosition(data.position);
      setOnlineAgents(data.online_agents);
    });

    socket.current.on("system_status", (data) => {
      setOnlineAgents(data.online_agents);
    });

    socket.current.on("history", (data) => {
      setMessages(data.messages.map(m => ({ ...m, from: m.sender })));
    });

    socket.current.on("message", (data) => {
      setMessages(prev => [...prev, { 
        id: data.id, 
        from: data.sender, 
        text: data.text, 
        type: data.type || "text",
        created_at: data.created_at || new Date().toISOString()
      }]);
    });

    socket.current.on("typing", (data) => {
      if (data.sender_role !== role) {
        setOtherIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setOtherIsTyping(false), 3000);
      }
    });

    socket.current.on("stop_typing", (data) => {
      if (data.sender_role !== role) {
        setOtherIsTyping(false);
      }
    });

    socket.current.on("chat_accepted", (data) => {
      setChatStatus("active");
    });

    socket.current.on("chat_resolved", () => {
      setChatStatus("resolved");
    });

    socket.current.on("chat_transferred", () => {
      setChatStatus("waiting");
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [chatId, userId, role]);

  const sendMessage = useCallback((text) => {
    if (socket.current?.connected) {
      socket.current.emit("message", { text, type: "text" });
      socket.current.emit("stop_typing");
    }
  }, []);

  const sendImage = useCallback((base64) => {
    if (socket.current?.connected) {
      socket.current.emit("message", { text: base64, type: "image" });
    }
  }, []);

  const startTyping = useCallback(() => {
    if (socket.current?.connected) {
      socket.current.emit("typing");
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (socket.current?.connected) {
      socket.current.emit("stop_typing");
    }
  }, []);

  const transferToAdmin = useCallback((customer) => {
    if (socket.current?.connected) {
      socket.current.emit("transfer_to_admin", { customer });
    }
  }, []);

  return { 
    messages, connected, chatStatus, queuePosition, onlineAgents, otherIsTyping,
    sendMessage, sendImage, startTyping, stopTyping, transferToAdmin 
  };
}
