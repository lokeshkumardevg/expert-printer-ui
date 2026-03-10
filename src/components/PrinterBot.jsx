// src/components/PrinterBot.jsx
// ════════════════════════════════════════════════════════════════════════════
//  FLOW:
//  "issue"    → predefined issue buttons (no text input)
//  "brand"    → predefined brand buttons (no text input)
//  "model"    → predefined model buttons for selected brand (no text input)
//  "name"     → type full name
//  "email"    → type email
//  "phone"    → type phone number
//  "location" → type city / country
//  "confirm"  → review card (Edit | Confirm)
//  "connecting" → loader  →  POST /api/chats/new
//  "live"     → green agent badge
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../lib/constants";

// ─── Stable per-tab user ID ──────────────────────────────────────────────────
const USER_ID = (() => {
  let id = sessionStorage.getItem("printer_bot_uid");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("printer_bot_uid", id); }
  return id;
})();

// ─── Issue quick-reply buttons ───────────────────────────────────────────────
const ISSUE_OPTIONS = [
  { label: "🖨️ Not Printing",      value: "Printer is not printing" },
  { label: "📶 Printer Offline",    value: "Printer shows offline" },
  { label: "📄 Paper Jam",          value: "Paper jam" },
  { label: "🎨 Poor Print Quality", value: "Poor print quality / streaks" },
  { label: "💻 Driver Issue",       value: "Driver not installed or unavailable" },
  { label: "📡 Wi-Fi Setup",        value: "Wireless printer setup" },
  { label: "🔧 Other Issue",        value: "Other printer issue" },
];

// ─── Brand quick-reply buttons ───────────────────────────────────────────────
const BRAND_OPTIONS = [
  "HP", "Canon", "Epson", "Brother",
  "Xerox", "Ricoh", "Kyocera", "Samsung", "Other",
];

// ─── Predefined models per brand ─────────────────────────────────────────────
const MODELS_BY_BRAND = {
  HP:      ["DeskJet 2700", "OfficeJet Pro 9015", "LaserJet Pro M404n", "ENVY 6055", "LaserJet MFP M428", "Other"],
  Canon:   ["PIXMA MG3620", "PIXMA TR8620", "imageCLASS MF445dw", "PIXMA G7020", "imageCLASS LBP6030", "Other"],
  Epson:   ["EcoTank ET-2720", "WorkForce WF-3820", "Expression ET-3850", "EcoTank Pro ET-5850", "SureColor P700", "Other"],
  Brother: ["HL-L2350DW", "MFC-L2710DW", "DCP-L2550DW", "HL-L3210CW", "MFC-J995DW", "Other"],
  Xerox:   ["VersaLink C405", "WorkCentre 6515", "Phaser 6510", "VersaLink B405", "Other"],
  Ricoh:   ["SP 3610SF", "IM C300", "MP C307", "SP 330DN", "Other"],
  Kyocera: ["ECOSYS M2535dn", "ECOSYS P2235dn", "TASKalfa 2553ci", "ECOSYS M5526cdw", "Other"],
  Samsung: ["Xpress M2020W", "Xpress M2070FW", "ProXpress M4020ND", "Other"],
  Other:   ["Other"],
};

// ─── Contact field validators ─────────────────────────────────────────────────
const VALIDATORS = {
  name: (v) => {
    if (!v.trim()) return "Name cannot be empty.";
    if (v.trim().length < 2) return "At least 2 characters required.";
    if (!/^[a-zA-Z\s'\-]+$/.test(v.trim())) return "Letters, spaces, hyphens only.";
    return null;
  },
  email: (v) => {
    if (!v.trim()) return "Email cannot be empty.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address.";
    return null;
  },
  phone: (v) => {
    const d = v.replace(/\D/g, "");
    if (!v.trim()) return "Phone cannot be empty.";
    if (d.length < 7 || d.length > 15) return "Phone must be 7–15 digits.";
    return null;
  },
  location: (v) => {
    if (!v.trim()) return "Location cannot be empty.";
    if (v.trim().length < 2) return "Enter a valid city or country.";
    return null;
  },
};

// ─── Steps that show the text input ──────────────────────────────────────────
const INPUT_STEPS = ["name", "email", "phone", "location"];

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const PrinterBot = ({ isMinimized, setIsMinimized }) => {

  const [step,            setStep]            = useState("issue");
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [inputError,      setInputError]      = useState("");
  const [isTyping,        setIsTyping]        = useState(false);
  const [showIntroText,   setShowIntroText]   = useState(false);
  const [liveChatId,      setLiveChatId]      = useState(null);
  const [escalationError, setEscalationError] = useState("");

  const collected = useRef({
    issue: "", brand: "", model: "",
    name: "", email: "", phone: "", location: "",
  });
  const conversationHistory = useRef([]);
  const chatEndRef          = useRef(null);

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  // ── Init welcome message ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMinimized && messages.length === 0) {
      pushBotMsg(
        "Hey! I'm Atlas 👋 Your printer support assistant. What issue are you facing today?",
        true
      );
    }
  }, []);

  // ── Minimized intro text timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!isMinimized) return;
    const s = setTimeout(() => setShowIntroText(true),  3000);
    const h = setTimeout(() => setShowIntroText(false), 15000);
    return () => { clearTimeout(s); clearTimeout(h); };
  }, [isMinimized]);

  // ── Message helpers ───────────────────────────────────────────────────────────
  const pushBotMsg = (text, instant = false) => {
    conversationHistory.current.push({
      sender: "bot", text, created_at: new Date().toISOString(),
    });
    if (instant) {
      setMessages(prev => [...prev, { type: "bot", text }]);
      return;
    }
    setIsTyping(true);
    setMessages(prev => [...prev, { type: "bot", text: "" }]);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setMessages(prev => {
        const u = [...prev];
        u[u.length - 1] = { ...u[u.length - 1], text: text.slice(0, i) };
        return u;
      });
      if (i >= text.length) { clearInterval(iv); setIsTyping(false); }
    }, 16);
  };

  const pushUserMsg = (text) => {
    conversationHistory.current.push({
      sender: "customer", text, created_at: new Date().toISOString(),
    });
    setMessages(prev => [...prev, { type: "user", text }]);
  };

  // ── Button handlers ───────────────────────────────────────────────────────────
  const handleIssueSelect = (option) => {
    pushUserMsg(option.label);
    collected.current.issue = option.value;
    setTimeout(() => {
      pushBotMsg("Got it! Which printer brand are you using?");
      setStep("brand");
    }, 400);
  };

  const handleBrandSelect = (brand) => {
    pushUserMsg(brand);
    collected.current.brand = brand;
    setTimeout(() => {
      pushBotMsg(`Which ${brand} model do you have?`);
      setStep("model");
    }, 400);
  };

  const handleModelSelect = (model) => {
    pushUserMsg(model);
    collected.current.model = model;
    setTimeout(() => {
      pushBotMsg("To connect you with a certified technician, I need a few details. What's your full name?");
      setStep("name");
    }, 400);
  };

  // ── Typed input send ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    const trimmed = input.trim();
    const err = VALIDATORS[step]?.(trimmed);
    if (err) { setInputError(err); return; }

    setInputError("");
    setInput("");
    pushUserMsg(trimmed);

    if (step === "name") {
      collected.current.name = trimmed;
      setTimeout(() => { pushBotMsg("What's your email address?"); setStep("email"); }, 400);
    } else if (step === "email") {
      collected.current.email = trimmed;
      setTimeout(() => { pushBotMsg("What's your phone number?"); setStep("phone"); }, 400);
    } else if (step === "phone") {
      collected.current.phone = trimmed;
      setTimeout(() => { pushBotMsg("Please provide your city or country."); setStep("location"); }, 400);
    } else if (step === "location") {
      collected.current.location = trimmed;
      setTimeout(() => { setStep("confirm"); }, 400);
    }
  };

  // ── Escalate to backend ───────────────────────────────────────────────────────
  const escalateToBackend = async () => {
    setEscalationError("");
    try {
      const res = await fetch(`${API_BASE}/api/chats/new`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: collected.current.name,
          email:    collected.current.email,
          phone:    collected.current.phone,
          location: collected.current.location,
          printer:  `${collected.current.brand} ${collected.current.model}`.trim(),
          issue:    collected.current.issue,
          history:  conversationHistory.current,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setLiveChatId(data.chat_id);
      return data.chat_id;
    } catch (err) {
      console.warn("[PrinterBot] Escalation failed:", err.message);
      setEscalationError("Could not reach support. Please try again or call us directly.");
      return null;
    }
  };

  const handleConfirm = async () => {
    setStep("connecting");
    const chatId = await escalateToBackend();
    if (chatId) {
      pushBotMsg(`You're all set, ${collected.current.name}! ✅ A certified technician is reviewing your case and will join shortly.`);
    } else {
      pushBotMsg(`Hi ${collected.current.name}, we couldn't reach our servers. Please try again or call us directly.`);
    }
    setStep("live");
  };

  const handleEdit = () => {
    pushBotMsg("No problem! Let's update your details. What's your full name?");
    setStep("name");
  };

  // ── Restart ───────────────────────────────────────────────────────────────────
  const refreshChat = () => {
    setStep("issue");
    setMessages([]);
    setInput("");
    setInputError("");
    setLiveChatId(null);
    setEscalationError("");
    collected.current          = { issue:"", brand:"", model:"", name:"", email:"", phone:"", location:"" };
    conversationHistory.current = [];
    setTimeout(() => {
      pushBotMsg("Hey! I'm Atlas 👋 Your printer support assistant. What issue are you facing today?", true);
    }, 50);
  };

  const getPlaceholder = () => {
    const map = {
      name:     "Enter your full name...",
      email:    "Enter your email address...",
      phone:    "Enter your phone number...",
      location: "Enter your city or country...",
    };
    return map[step] || "";
  };

  const showInput = INPUT_STEPS.includes(step);
  const modelOptions = MODELS_BY_BRAND[collected.current.brand] || ["Other"];

  /* ════════════════════════════════════════════════════════════════════════════
     MINIMIZED
  ════════════════════════════════════════════════════════════════════════════ */
  if (isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          key="minimized"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 animate-bounce"
        >
          <AnimatePresence>
            {showIntroText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.6, x: 20 }}
                className="relative -translate-y-6"
              >
                <img src="/bot_text.svg" alt="Chat Intro" className="w-48 h-20 object-contain" />
                <div className="absolute top-7 left-4 right-4 text-sm text-black text-center leading-tight">
                  Hi, how can I help you?
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsMinimized(false)}
            className="w-16 h-16 rounded-full bg-white border-2 border-[#5695D0]"
          >
            <img src="/atlas_icon.svg" alt="Atlas" className="w-full h-full object-contain scale-[0.7]" />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════════
     FULL VIEW
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <AnimatePresence>
      <motion.div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="rounded-[26px] p-[1.5px] bg-gradient-to-b from-white to-[#5695D0]">
          <div className="w-[94vw] sm:w-[350px] h-[600px] sm:h-[580px] rounded-[26px] px-4 pt-4 pb-3 flex flex-col bg-gradient-to-b from-[#9dc4e8] to-white text-black overflow-hidden">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between h-[38px] flex-shrink-0">
              <div className="flex items-center gap-2">
                <img src="/Vector.svg" alt="Atlas" className="w-[28px] h-[28px]" />
                <span className="text-[24px] leading-[38px] font-Inter">
                  {step === "live" ? "Assistant" : "Atlas"}
                </span>
                <div className="flex items-center gap-1 bg-white/70 border border-[#5695D0]/40 rounded-full px-2 py-0.5 shadow-sm">
                  <span className="text-base leading-none">🇺🇸</span>
                  <span className="text-[10px] text-gray-600 font-medium">USA</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={refreshChat} className="text-gray-500 hover:text-black transition-colors text-lg" title="Restart">↻</button>
                <button onClick={() => setIsMinimized(true)} className="text-gray-500 hover:text-black transition-colors" title="Close">✕</button>
              </div>
            </div>

            {/* ── LIVE AGENT BADGE ── */}
            {step === "live" && liveChatId && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl border border-green-200 flex-shrink-0"
              >
                <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">TS</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-700">Certified Technician</p>
                  <p className="text-xs text-gray-500">Connected · Agent joining shortly</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono flex-shrink-0">
                  #{liveChatId.slice(-6)}
                </span>
              </motion.div>
            )}

            {/* ── CONNECTING LOADER ── */}
            {step === "connecting" && (
              <div className="mt-4 flex flex-col items-center flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#5695D0]/30 animate-pulse" />
                <p className="text-sm mt-2 text-gray-500">Connecting to certified technician...</p>
              </div>
            )}

            {/* ── CONFIRMATION CARD ── */}
            {step === "confirm" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-white rounded-2xl border border-[#5695D0]/40 shadow-sm p-4 flex flex-col gap-3 flex-shrink-0"
              >
                <p className="text-sm font-semibold text-[#286CAC] text-center">Please confirm your details</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "🖨️ Issue",    value: collected.current.issue },
                    { label: "🏷️ Printer",  value: `${collected.current.brand} ${collected.current.model}`.trim() },
                    { label: "👤 Name",     value: collected.current.name },
                    { label: "✉️ Email",    value: collected.current.email },
                    { label: "📞 Phone",    value: collected.current.phone },
                    { label: "📍 Location", value: collected.current.location },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-2 text-xs">
                      <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
                      <span className="font-medium text-gray-800 break-all">{value}</span>
                    </div>
                  ))}
                </div>
                {escalationError && (
                  <p className="text-xs text-red-500 text-center">{escalationError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex-1 py-1.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-1.5 rounded-xl bg-[#5695D0] text-white text-sm font-medium hover:bg-[#286CAC] transition-colors"
                  >
                    ✅ Confirm
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── MESSAGES + BUTTONS ── */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 mt-3 min-h-0">
              <AnimatePresence initial={false}>

                {/* Chat bubbles */}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.type === "user" ? 30 : -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs opacity-60 mb-0.5">
                      {msg.type === "user" ? "You" : step === "live" ? "Assistant" : "Atlas"}
                    </span>
                    <div className={`max-w-[85%] px-4 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.type === "user" ? "bg-white text-black" : "bg-[#286CAC] text-white"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-xs opacity-60 mb-0.5">Atlas</span>
                    <div className="px-4 py-2 rounded-xl bg-[#286CAC] text-white flex gap-1">
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <motion.span key={idx} animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1, delay }}>.</motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* ── ISSUE BUTTONS ── */}
              {step === "issue" && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-1"
                >
                  {ISSUE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleIssueSelect(opt)}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#5695D0] text-[#286CAC] text-xs font-medium hover:bg-[#5695D0] hover:text-white transition-colors shadow-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* ── BRAND BUTTONS ── */}
              {step === "brand" && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-1"
                >
                  {BRAND_OPTIONS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#5695D0] text-[#286CAC] text-xs font-medium hover:bg-[#5695D0] hover:text-white transition-colors shadow-sm"
                    >
                      {brand}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* ── MODEL BUTTONS ── */}
              {step === "model" && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mt-1"
                >
                  {modelOptions.map((model) => (
                    <button
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#5695D0] text-[#286CAC] text-xs font-medium hover:bg-[#5695D0] hover:text-white transition-colors shadow-sm"
                    >
                      {model}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ── TEXT INPUT (contact steps only) ── */}
            {showInput && (
              <div className="mt-3 flex-shrink-0">
                <AnimatePresence>
                  {inputError && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-[11px] mb-1.5 px-1 flex items-center gap-1"
                    >
                      <span>⚠</span> {inputError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className={`flex gap-2 border rounded-xl px-4 py-2 bg-white/80 transition-colors ${
                  inputError ? "border-red-400" : "border-[#5695D0]/60"
                }`}>
                  <input
                    value={input}
                    onChange={(e) => { setInput(e.target.value); if (inputError) setInputError(""); }}
                    placeholder={getPlaceholder()}
                    className="flex-1 bg-transparent outline-none text-sm min-w-0"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                    autoFocus
                  />
                  <button
                    onClick={sendMessage}
                    className="w-8 h-8 flex-shrink-0 bg-[#5695D0] rounded-full text-white flex items-center justify-center hover:bg-[#286CAC] transition-colors"
                  >
                    ↑
                  </button>
                </div>
              </div>
            )}

            <div className="text-center text-xs mt-2 text-gray-400 flex-shrink-0">
              Powered by <b className="text-gray-600">Printer Support</b>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PrinterBot;