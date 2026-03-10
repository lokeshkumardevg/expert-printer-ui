// src/components/dashboard/agent/AgentDashboard.jsx
// ── All data from real MongoDB via FastAPI ────────────────────────────────────
// Stats   → GET /api/agent/stats  → { my_leads, active_chats, resolved_today, avg_response }
// Leads   → GET /api/agent/leads  → { leads: [...] }
// Chats   → GET /api/agent/chats  → { chats: [...] }
// Accept  → POST /api/agent/chats/{id}/accept
// Resolve → POST /api/agent/chats/{id}/resolve
// No static fallback — empty states shown when API is unavailable.

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../DashboardLayout";
import { Skeleton } from "../Shared";
import Icon from "../Icon";
import { apiFetch, AuthError, getUser } from "../../../lib/api";
import { useChat } from "../../../hooks/useChat";
import { useAgentNotifications } from "../../../hooks/useAgentNotifications";
import { API_ENABLED, AGENT_NAV, STATUS_STYLES } from "../../../lib/constants";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString()}\n${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

// Map raw API stats object → stat card array
function buildStatCards(raw) {
  return [
    { label: "My Leads",       value: String(raw.my_leads        ?? 0), change: "Assigned to you",   positive: true,  icon: "list",        accent: "bg-blue-50 text-blue-500"      },
    { label: "Active Chats",   value: String(raw.active_chats    ?? 0), change: "Currently open",    positive: true,  icon: "chat",        accent: "bg-orange-50 text-orange-500"  },
    { label: "Resolved Today", value: String(raw.resolved_today  ?? 0), change: "Today",             positive: true,  icon: "checkCircle", accent: "bg-emerald-50 text-emerald-500" },
    { label: "Avg. Response",  value: raw.avg_response           ?? "—", change: "Target: under 5m", positive: true,  icon: "clock",       accent: "bg-indigo-50 text-indigo-500"  },
  ];
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, positive, icon, accent, loading }) {
  if (loading) return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0 space-y-3">
      <Skeleton cls="h-3 w-24"/><Skeleton cls="h-8 w-20"/><Skeleton cls="h-3 w-32"/>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon name={icon} cls="w-5 h-5"/>
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-red-400"}`}>
        {positive ? "↑" : "↓"} {change}
      </p>
    </div>
  );
}

// ─── STATUS DROPDOWN ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["New","Connected","Resolved","Hold","Pending"];
const STATUS_STYLE = {
  New:       "bg-gray-900 text-white border-0",
  Connected: "bg-white text-gray-700 border border-gray-300",
  Resolved:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Hold:      "bg-amber-50 text-amber-700 border border-amber-200",
  Pending:   "bg-blue-50 text-blue-700 border border-blue-200",
};
function StatusDropdown({ status, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={()=>setOpen(o=>!o)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer ${STATUS_STYLE[status]||STATUS_STYLE.Connected}`}>
        {status}<Icon name="chevron" cls="w-3 h-3"/>
      </button>
      {open&&(
        <>
          <div className="fixed inset-0 z-10" onClick={()=>setOpen(false)}/>
          <div className="absolute left-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[130px]">
            {STATUS_OPTIONS.map(s=>(
              <button key={s} onClick={()=>{onChange(s);setOpen(false);}}
                className="w-full text-left text-xs px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        {children}
      </div>
    </div>
  );
}

// ─── LIVE CHAT WINDOW ─────────────────────────────────────────────────────────
function LiveChatWindow({ chat, onAccept, onResolve, onTransfer, currentUser }) {
  const { messages, connected, chatStatus, sendMessage, transferToAdmin } = useChat({
    chatId: chat?.id,
    userId: currentUser?.id,
    role:   "agent",
  });
  const [input, setInput] = useState("");
  const bottomRef         = useRef(null);

  // Sync WS chat_accepted event back to parent list
  useEffect(() => {
    if (chatStatus === "active" && chat?.status === "waiting") onAccept?.(chat.id, false);
  }, [chatStatus]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim() || chat?.status === "waiting") return;
    sendMessage(input.trim());
    setInput("");
  };

  if (!chat) return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
      <p className="text-sm text-gray-400">Select a chat</p>
    </div>
  );

  const status = chat.status;

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{chat.customer}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
            {chat.printer||"—"} · {chat.email||"—"} · {chat.phone||"—"} · {fmtDate(chat.created_at)}
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-gray-300"}`}/>
            <span>{connected ? "Live" : "Offline"}</span>
          </p>
          {chat.issue && <p className="text-xs text-blue-500 mt-0.5">{chat.issue}</p>}
        </div>
        <div className="flex items-center gap-2">
          {status === "waiting" && (
            <button onClick={()=>onAccept(chat.id, true)}
              className="bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-600 transition-colors">
              Accept
            </button>
          )}
          {status === "active" && (
            <>
              <button onClick={()=>{transferToAdmin(chat.customer); onTransfer?.(chat.id);}}
                className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                Transfer to Admin
              </button>
              <button onClick={()=>onResolve(chat.id)}
                className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
                Issue Solved
              </button>
            </>
          )}
          {status === "resolved" && (
            <span className="border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-xl">Resolved</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gray-50/20">
        {messages.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">
            {status === "waiting" ? "Accept this chat to start messaging." : "No messages yet."}
          </div>
        )}
        {messages.map((m,idx) => (
          <div key={m.id||idx}>
            {m.from === "divider" && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="text-xs text-gray-400 whitespace-nowrap">{m.text}</span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>
            )}
            {m.from === "bot" && (
              <div className="flex justify-end">
                <div className="max-w-sm">
                  <p className="text-xs text-gray-400 text-right mb-1.5">ChatBot</p>
                  <div className="bg-white border border-gray-100 shadow-sm text-gray-700 text-sm rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed">{m.text}</div>
                </div>
              </div>
            )}
            {m.from === "customer" && (
              <div className="flex flex-col items-start">
                <p className="text-xs text-blue-500 font-semibold mb-1.5">{chat.customer}</p>
                <div className="bg-blue-500 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm leading-relaxed">{m.text}</div>
              </div>
            )}
            {(m.from === "agent" || m.from === "admin") && (
              <div className="flex justify-end">
                <div className="max-w-sm">
                  <p className="text-xs text-gray-400 text-right mb-1.5">You</p>
                  <div className="bg-white border border-gray-100 shadow-sm text-gray-700 text-sm rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed">{m.text}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all ${
          status === "waiting" ? "border-gray-100 bg-gray-50" : "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        }`}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send()}
            disabled={status === "waiting"}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400 disabled:cursor-not-allowed"
            placeholder={status === "waiting" ? "Accept the chat to start messaging…" : "Type message here…"}
          />
          <button onClick={send} disabled={status === "waiting" || !input.trim()}
            className="text-blue-500 hover:text-blue-600 disabled:text-gray-300 transition-colors">
            <Icon name="send" cls="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LIVE CHATS VIEW ─────────────────────────────────────────────────────────
function LiveChatsView({ user }) {
  const currentUser = user || getUser();
  const [chats,       setChats]       = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [acceptModal, setAcceptModal] = useState(null);

  const { pendingChats, dismiss } = useAgentNotifications({
    userId: currentUser?.id,
    enabled: true,
  });

  // Merge WS new chats into list (avoid duplicates)
  useEffect(() => {
    pendingChats.forEach(pc => {
      setChats(prev => {
        if (prev.find(c => c.id === pc.id)) return prev;
        return [...prev, { ...pc, status: "waiting" }];
      });
    });
  }, [pendingChats]);

  const pollingRef = useRef(null);

  const fetchChats = useCallback(async () => {
    try {
      const data = await apiFetch("/api/agent/chats");
      setChats(data.chats || []);
      if (data.chats?.length && !selected) setSelected(data.chats[0]);
    } catch (err) {
      if (err instanceof AuthError) { clearInterval(pollingRef.current); pollingRef.current = null; }
      setChats([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchChats();
    pollingRef.current = setInterval(fetchChats, 8000);
    return () => clearInterval(pollingRef.current);
  }, [fetchChats]);

  const handleAccept = async (chatId, showModal) => {
    if (showModal) { setAcceptModal(chatId); return; }
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: "active" } : c));
  };

  const confirmAccept = async () => {
    const chatId = acceptModal;
    setAcceptModal(null);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: "active" } : c));
    try {
      await apiFetch(`/api/agent/chats/${chatId}/accept`, { method: "POST" });
      dismiss(chatId);
    } catch { /* optimistic update stays */ }
  };

  const handleResolve = async (chatId) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: "resolved" } : c));
    try { await apiFetch(`/api/agent/chats/${chatId}/resolve`, { method: "POST" }); }
    catch { /* optimistic */ }
  };

  const handleTransfer = (chatId) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: "waiting" } : c));
  };

  const sel = chats.find(c => c.id === selected?.id) || chats[0] || null;

  const listPill = {
    waiting:  "border border-gray-300 text-gray-600 bg-white",
    active:   "bg-gray-900 text-white",
    resolved: "border border-gray-300 text-gray-600 bg-white",
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-148px)]">
      {/* Chat list */}
      <div className="w-64 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">Chats ({chats.length})</p>
          {pendingChats.length > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {pendingChats.length}
            </span>
          )}
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {loading
            ? [1,2,3].map(i=>(
                <div key={i} className="px-5 py-4 space-y-2">
                  <Skeleton cls="h-3 w-24"/><Skeleton cls="h-3 w-16"/>
                </div>
              ))
            : chats.length === 0
              ? <div className="px-5 py-10 text-center text-xs text-gray-400">No chats yet. Waiting for customers…</div>
              : chats.map(c => (
                  <div key={c.id} onClick={() => setSelected(c)}
                    className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${sel?.id === c.id ? "bg-blue-50/40" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.customer}</p>
                      {c.status === "waiting" ? (
                        <button onClick={e=>{e.stopPropagation();handleAccept(c.id,true);}}
                          className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                          Accept
                        </button>
                      ) : (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${listPill[c.status]}`}>
                          {c.status === "active" ? "Active" : "Resolved"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.printer||"—"}</p>
                    <p className="text-xs text-gray-400 truncate">{c.issue||"—"}</p>
                  </div>
                ))
          }
        </div>
      </div>

      <LiveChatWindow chat={sel} currentUser={currentUser} onAccept={handleAccept} onResolve={handleResolve} onTransfer={handleTransfer}/>

      {acceptModal && (
        <Modal onClose={() => setAcceptModal(null)}>
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl border-2 border-blue-400 flex items-center justify-center">
                <Icon name="chat" cls="w-7 h-7 text-blue-500"/>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Accept Request</h2>
            <p className="text-sm text-gray-500 mb-7">
              {chats.find(c=>c.id===acceptModal)?.customer} wants to chat with you.
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setAcceptModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Decline</button>
              <button onClick={confirmAccept} className="flex-1 py-3 bg-blue-500 rounded-xl text-sm font-semibold text-white hover:bg-blue-600 transition-colors">Accept</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── LEADS VIEW ───────────────────────────────────────────────────────────────
function LeadsView({ search }) {
  const [leads,    setLeads]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [error,    setError]    = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/agent/leads");
        setLeads(data.leads || []);
      } catch {
        setError("Could not load leads.");
        setLeads([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const updateStatus = async (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setSaving(p => ({ ...p, [id]: true }));
    try {
      await apiFetch(`/api/agent/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    } catch { /* optimistic stays */ }
    finally { setSaving(p => { const n={...p}; delete n[id]; return n; }); }
  };

  const filtered = leads.filter(l =>
    [l.id, l.customer, l.printer, l.issue, l.status].some(v =>
      String(v||"").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
      {[1,2,3,4,5].map(i=><Skeleton key={i} cls="h-10 w-full"/>)}
    </div>
  );

  return (
    <>
      {error && <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["ID","Customer","Email","Phone","Printer","Issue","Status","Created","Action"].map(h=>(
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">No leads assigned yet.</td></tr>
              : filtered.map((lead,i,arr)=>(
                <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${i<arr.length-1?"border-b border-gray-100":""}`}>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{lead.id?.slice(-6)}</td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-800 whitespace-nowrap">{lead.customer}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{lead.email||"—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{lead.phone||"—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-700 whitespace-nowrap">{lead.printer||"—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 max-w-[160px]"><span className="block truncate">{lead.issue||"—"}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <StatusDropdown status={lead.status} onChange={s=>updateStatus(lead.id,s)}/>
                      {saving[lead.id]&&<span className="text-xs text-gray-400 animate-pulse">saving…</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-pre-line">{fmtDate(lead.created_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={()=>setDeleteId(lead.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Icon name="trash" cls="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {deleteId&&(
        <Modal onClose={()=>setDeleteId(null)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Icon name="trash" cls="w-7 h-7 text-red-500"/></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Lead</h2>
            <p className="text-sm text-gray-500 mb-6">Remove this lead from your list?</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{setLeads(p=>p.filter(l=>l.id!==deleteId));setDeleteId(null);}} className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── DASHBOARD OVERVIEW ───────────────────────────────────────────────────────
function DashboardView({ stats, leads, loading, loadingLeads, pendingChats, onGoToChats }) {
  return (
    <>
      <div className="flex gap-4 mb-6">
        {loading
          ? [1,2,3,4].map(i => <StatCard key={i} loading/>)
          : stats.map(s => <StatCard key={s.label} {...s} loading={false}/>)
        }
      </div>

      {pendingChats > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Icon name="bell" cls="w-4 h-4 text-amber-600"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">{pendingChats} new chat request(s) waiting</p>
              <p className="text-xs text-amber-600">Customers are waiting — go to Live Chats to accept</p>
            </div>
          </div>
          <button onClick={onGoToChats} className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors">
            View Chats
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">My Recent Leads</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["ID","Customer","Email","Printer","Issue","Status","Created"].map(h=>(
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingLeads
              ? [1,2,3].map(i=><tr key={i}>{[1,2,3,4,5,6,7].map(j=><td key={j} className="px-5 py-4"><Skeleton cls="h-3 w-full"/></td>)}</tr>)
              : leads.length === 0
                ? <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No leads yet.</td></tr>
                : leads.slice(0,5).map((lead,i,arr)=>(
                  <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${i<arr.length-1?"border-b border-gray-100":""}`}>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">{lead.id?.slice(-6)}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-800 whitespace-nowrap">{lead.customer}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{lead.email||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{lead.printer||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]"><span className="block truncate">{lead.issue||"—"}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[lead.status]||"bg-gray-100 text-gray-600"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-pre-line">{fmtDate(lead.created_at)}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AgentDashboard({ user, onLogout }) {
  const currentUser = user || getUser();
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [search,       setSearch]       = useState("");
  const [stats,        setStats]        = useState([]);
  const [leads,        setLeads]        = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const { pendingChats } = useAgentNotifications({
    userId:  currentUser?.id,
    enabled: activeNav !== "Live Chats",
  });

  useEffect(() => {
    (async () => {
      try {
        const [statsRaw, leadsData] = await Promise.all([
          apiFetch("/api/agent/stats"),
          apiFetch("/api/agent/leads"),
        ]);
        // statsRaw = { my_leads, active_chats, resolved_today, avg_response }
        setStats(buildStatCards(statsRaw));
        setLeads(leadsData.leads || []);
      } catch {
        setStats([]);
        setLeads([]);
      } finally { setLoadingStats(false); setLoadingLeads(false); }
    })();
  }, []);

  const NAV_META = {
    "Dashboard":  ["Dashboard",  `Welcome back, ${user?.name?.split(" ")[0] || "Agent"}`],
    "Live Chats": ["Live Chats", "Manage active customer conversations"],
    "Leads":      ["Leads",      "Track and manage your support requests"],
  };
  const [title, subtitle] = NAV_META[activeNav] || ["Dashboard",""];

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-52 shadow-sm">
        <Icon name="search" cls="w-3.5 h-3.5 text-gray-400 shrink-0"/>
        <input className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
          placeholder="Search here..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
        <Icon name="download" cls="w-3.5 h-3.5"/> Export Data
      </button>
    </div>
  );

  return (
    <DashboardLayout
      user={user} navItems={AGENT_NAV} activeNav={activeNav}
      onNavChange={nav=>{setActiveNav(nav);setSearch("");}}
      onLogout={onLogout}
      headerTitle={title} headerSub={subtitle}
      headerRight={activeNav !== "Live Chats" ? headerRight : null}
    >
      {activeNav === "Dashboard"  && (
        <DashboardView
          stats={stats} leads={leads}
          loading={loadingStats} loadingLeads={loadingLeads}
          pendingChats={pendingChats.length}
          onGoToChats={() => setActiveNav("Live Chats")}
        />
      )}
      {activeNav === "Live Chats" && <LiveChatsView user={currentUser}/>}
      {activeNav === "Leads"      && <LeadsView search={search}/>}
    </DashboardLayout>
  );
}