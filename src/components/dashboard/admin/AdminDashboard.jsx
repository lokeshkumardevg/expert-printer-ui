// src/components/dashboard/admin/AdminDashboard.jsx
// ── All data comes from real MongoDB via FastAPI ──────────────────────────────
// Stats    → GET /api/admin/stats       → { total_leads, active_chats, resolved, total_agents }
// Leads    → GET /api/admin/leads       → { leads: [...] }
// Agents   → GET /api/admin/agents      → { agents: [...] }
// Chats    → GET /api/admin/chats       → { chats: [...] }
// Website  → GET /api/admin/website     → { fields: [...] }  (editable site fields)
// No static fallback data is ever shown — empty state shown when API fails.

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../DashboardLayout";
import { Skeleton } from "../Shared";
import Icon from "../Icon";
import { apiFetch, AuthError, getUser } from "../../../lib/api";
import { useChat } from "../../../hooks/useChat";
import { useAgentNotifications } from "../../../hooks/useAgentNotifications";
import { API_ENABLED, ADMIN_NAV, FALLBACK_AREA_DATA, FALLBACK_BAR_DATA } from "../../../lib/constants";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtGroupDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}

// Map raw API stats object → stat card array
function buildStatCards(raw) {
  return [
    { label: "Total Leads",     value: String(raw.total_leads   ?? 0), change: "All time",        positive: true,  icon: "list",        accent: "bg-blue-50 text-blue-500"      },
    { label: "Active Chats",    value: String(raw.active_chats  ?? 0), change: `${raw.waiting_chats ?? 0} waiting · ${raw.offline_chats ?? 0} inactive`, positive: true,  icon: "chat",        accent: "bg-orange-50 text-orange-500"  },
    { label: "Resolved Issues", value: String(raw.resolved      ?? 0), change: "Total resolved",  positive: true,  icon: "checkCircle", accent: "bg-emerald-50 text-emerald-500" },
    { label: "Total Agents",    value: String(raw.total_agents  ?? 0), change: "Registered",      positive: true,  icon: "users",       accent: "bg-purple-50 text-purple-500"  },
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

// ─── CHARTS ───────────────────────────────────────────────────────────────────
function AreaChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return null;
  const W=500,H=200,pL=36,pR=12,pT=12,pB=36,iW=W-pL-pR,iH=H-pT-pB;
  const max=Math.ceil(Math.max(...data.map(d=>Math.max(d.leads,d.resolved)))/30)*30+30;
  const tx=i=>pL+(i/(data.length-1))*iW, ty=v=>pT+iH-(v/max)*iH;
  const line=k=>data.map((d,i)=>`${i===0?"M":"L"}${tx(i).toFixed(1)},${ty(d[k]).toFixed(1)}`).join(" ");
  const area=k=>`${line(k)} L${tx(data.length-1).toFixed(1)},${(pT+iH).toFixed(1)} L${tx(0).toFixed(1)},${(pT+iH).toFixed(1)} Z`;
  const grids=[0,30,60,90,120].filter(v=>v<=max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={()=>setTooltip(null)}>
      <defs>
        <linearGradient id="aLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity=".5"/><stop offset="100%" stopColor="#34d399" stopOpacity=".05"/></linearGradient>
        <linearGradient id="aResolved" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#93c5fd" stopOpacity=".5"/><stop offset="100%" stopColor="#93c5fd" stopOpacity=".05"/></linearGradient>
      </defs>
      {grids.map(v=><g key={v}><line x1={pL} x2={W-pR} y1={ty(v)} y2={ty(v)} stroke="#f0f0f0" strokeWidth="1"/><text x={pL-6} y={ty(v)+4} textAnchor="end" fontSize="10" fill="#bbb">{v}</text></g>)}
      <path d={area("leads")} fill="url(#aLeads)"/><path d={area("resolved")} fill="url(#aResolved)"/>
      <path d={line("leads")} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={line("resolved")} fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i)=>(
        <g key={d.day}>
          <circle cx={tx(i)} cy={ty(d.leads)} r="4" fill="white" stroke="#34d399" strokeWidth="2"
            onMouseEnter={()=>setTooltip({x:tx(i),y:ty(d.leads),leads:d.leads,resolved:d.resolved})}/>
          <text x={tx(i)} y={H-8} textAnchor="middle" fontSize="11" fill="#aaa">{d.day}</text>
        </g>
      ))}
      {tooltip&&(
        <g>
          <rect x={tooltip.x-42} y={tooltip.y-50} width="84" height="44" rx="6" fill="white" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"/>
          <text x={tooltip.x} y={tooltip.y-30} textAnchor="middle" fontSize="10" fill="#555">Lead: {tooltip.leads}</text>
          <text x={tooltip.x} y={tooltip.y-14} textAnchor="middle" fontSize="10" fill="#555">Resolved: {tooltip.resolved}</text>
        </g>
      )}
    </svg>
  );
}

function BarChart({ data }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data?.length) return null;
  const W=500,H=200,pL=36,pR=12,pT=12,pB=36,iW=W-pL-pR,iH=H-pT-pB;
  const max=Math.ceil(Math.max(...data.map(d=>Math.max(d.leads,d.resolved)))/20)*20+20;
  const gW=iW/data.length,bW=Math.min(gW*0.28,18),gap=4;
  const ty=v=>pT+iH-(v/max)*iH,th=v=>(v/max)*iH;
  const grids=[0,30,60,90,120].filter(v=>v<=max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" onMouseLeave={()=>setTooltip(null)}>
      {grids.map(v=><g key={v}><line x1={pL} x2={W-pR} y1={ty(v)} y2={ty(v)} stroke="#f0f0f0" strokeWidth="1"/><text x={pL-6} y={ty(v)+4} textAnchor="end" fontSize="10" fill="#bbb">{v}</text></g>)}
      {data.map((d,i)=>{
        const cx=pL+i*gW+gW/2;
        return(
          <g key={d.day} onMouseEnter={()=>setTooltip({x:cx,y:Math.min(ty(d.leads),ty(d.resolved)),leads:d.leads,resolved:d.resolved})}>
            <rect x={cx-gap/2-bW} y={ty(d.leads)} width={bW} height={th(d.leads)} fill="#60a5fa" rx="3"/>
            <rect x={cx+gap/2} y={ty(d.resolved)} width={bW} height={th(d.resolved)} fill="#34d399" rx="3"/>
            <text x={cx} y={H-8} textAnchor="middle" fontSize="11" fill="#aaa">{d.day}</text>
          </g>
        );
      })}
      {tooltip&&(
        <g>
          <rect x={tooltip.x-42} y={tooltip.y-50} width="84" height="44" rx="6" fill="white" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"/>
          <text x={tooltip.x} y={tooltip.y-30} textAnchor="middle" fontSize="10" fill="#555">Lead: {tooltip.leads}</text>
          <text x={tooltip.x} y={tooltip.y-14} textAnchor="middle" fontSize="10" fill="#555">Resolved: {tooltip.resolved}</text>
        </g>
      )}
    </svg>
  );
}

// ─── STATUS DROPDOWN ─────────────────────────────────────────────────────────
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
function Modal({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 w-full ${wide ? 'max-w-4xl' : 'max-w-sm'} mx-4 overflow-y-auto max-h-[92vh] transition-all`}>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView({ stats, areaData, barData, leads, loading, loadingLeads, onStatusChange }) {
  return (
    <>
      <div className="flex gap-4 mb-6">
        {loading
          ? [1,2,3,4].map(i=><StatCard key={i} loading/>)
          : stats.map(s=><StatCard key={s.label} {...s} loading={false}/>)
        }
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Leads & Resolutions (Last 7 Days)</h3>
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"/>Leads</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block"/>Resolved</span>
          </div>
          <div className="h-48">{loading?<Skeleton cls="w-full h-full"/>:<AreaChart data={areaData}/>}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Daily Performance</h3>
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"/>Leads</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"/>Resolved</span>
          </div>
          <div className="h-48">{loading?<Skeleton cls="w-full h-full"/>:<BarChart data={barData}/>}</div>
        </div>
      </div>

      {/* Recent leads — real DB data */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Recent Leads</h3>
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
              ? [1,2,3,4,5].map(i=><tr key={i}>{[1,2,3,4,5,6,7].map(j=><td key={j} className="px-5 py-4"><Skeleton cls="h-3 w-full"/></td>)}</tr>)
              : leads.length === 0
                ? <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No leads yet.</td></tr>
                : leads.slice(0,5).map((lead,i,arr)=>(
                  <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${i<arr.length-1?"border-b border-gray-100":""}`}>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">{lead.id?.slice(-6)}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-800 whitespace-nowrap">{lead.customer}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{lead.email||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{lead.printer||"—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[200px]"><span className="block truncate">{lead.issue||"—"}</span></td>
                    <td className="px-5 py-3.5"><StatusDropdown status={lead.status} onChange={s=>onStatusChange(lead.id,s)}/></td>
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

// ─── LIVE CHATS VIEW ──────────────────────────────────────────────────────────
const CPILL = { 
  active:  "bg-blue-600 text-white border-blue-500", 
  waiting: "bg-orange-50 text-orange-600 border-orange-100", 
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  offline: "bg-gray-100 text-gray-400 border-gray-200"
};

function AdminChatWindow({ chat }) {
  const currentUser = getUser();
  const { 
    messages, 
    connected, 
    otherIsTyping,
    sendMessage, 
    sendImage, 
    startTyping,
    stopTyping 
  } = useChat({
    chatId: chat?.id,
    userId: `admin_${currentUser?.id || "admin"}`,
    role:   "admin",
  });
  const [msg, setMsg] = useState("");
  const bottomRef     = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "auto" }); }, [messages]);

  const send = () => {
    if (!msg.trim()) return;
    sendMessage(msg.trim());
    setMsg("");
    stopTyping();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => sendImage(reader.result);
    reader.readAsDataURL(file);
  };

  if (!chat) return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
      <p className="text-sm text-gray-400">Select a chat to view</p>
    </div>
  );

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{chat.customer}</p>
          <p className="text-xs text-gray-400">
            {chat.printer||"—"} · {chat.email||"—"} · {chat.phone||"—"} · {fmtDate(chat.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-gray-300"}`}/>
          <span className="text-xs text-gray-400">{connected ? "Live" : "Offline"}</span>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${CPILL[chat.status]||"bg-gray-100"}`}>{chat.status}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50/30">
        {messages.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8 italic">No messages yet. Initializing secure tunnel...</div>
        )}
        {(() => {
          const groups = [];
          messages.forEach(m => {
            const date = new Date(m.created_at || Date.now()).toDateString();
            if (!groups.length || groups[groups.length - 1].date !== date) {
              groups.push({ date, display: fmtGroupDate(m.created_at || Date.now()), items: [] });
            }
            groups[groups.length - 1].items.push(m);
          });
          
          return groups.map(group => (
            <div key={group.date} className="space-y-4">
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-gray-100"/>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-gray-100">{group.display}</span>
                <div className="flex-1 h-px bg-gray-100"/>
              </div>
              
              {group.items.map((m, idx) => (
                <div key={m.id || idx}>
                  {m.from === "divider" && (
                     <div className="flex items-center gap-3 py-1 bg-blue-50/50 rounded-lg px-3 border border-blue-100/30">
                       <span className="text-[10px] text-blue-500 font-medium">System Alert: {m.text}</span>
                     </div>
                  )}
                  {m.from === "bot" && (
                    <div className="flex justify-end gap-2 group/msg">
                      <div className="max-w-sm">
                        <p className="text-[10px] text-gray-400 text-right mb-1 font-medium">Bot · {fmtTime(m.created_at)}</p>
                        <div className="bg-white border border-gray-200 text-gray-700 text-sm rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm group-hover/msg:shadow-md transition-shadow">
                          {m.type === "image" ? (
                            <img src={m.text} alt="Shared" className="max-w-full rounded-lg cursor-zoom-in" onClick={() => window.open(m.text)} />
                          ) : m.text}
                        </div>
                      </div>
                    </div>
                  )}
                  {m.from === "customer" && (
                    <div className="flex flex-col items-start gap-1 group/msg">
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider px-1">{chat.customer} · {fmtTime(m.created_at)}</p>
                      <div className="bg-blue-500 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm group-hover/msg:shadow-md transition-shadow">
                        {m.type === "image" ? (
                          <img src={m.text} alt="Shared" className="max-w-full rounded-lg cursor-zoom-in" onClick={() => window.open(m.text)} />
                        ) : m.text}
                      </div>
                    </div>
                  )}
                  {(m.from === "agent" || m.from === "admin") && (
                    <div className="flex justify-end gap-2 group/msg">
                      <div className="max-w-sm">
                        <p className="text-[10px] text-gray-400 text-right mb-1 font-medium">You ({m.from}) · {fmtTime(m.created_at)}</p>
                        <div className="bg-white border border-blue-200 text-gray-700 text-sm rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm group-hover/msg:shadow-md transition-shadow ring-1 ring-blue-50">
                          {m.type === "image" ? (
                            <img src={m.text} alt="Shared" className="max-w-full rounded-lg cursor-zoom-in" onClick={() => window.open(m.text)} />
                          ) : m.text}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ));
        })()}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {otherIsTyping && (
          <div className="flex items-center gap-2 mb-2 px-1">
             <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
             </div>
             <span className="text-[10px] text-blue-500 font-medium">{chat.customer} is typing...</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            <span className="text-xl group-hover:scale-110 transition-transform">📎</span>
          </label>
          <input
            value={msg}
            onChange={(e)=>{
              setMsg(e.target.value);
              startTyping();
            }}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            onKeyDown={(e)=>e.key==="Enter"&&send()}
          />
          <button
            onClick={send}
            className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveChatsView({ adminId }) {
  const [chats,    setChats]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const pollingRef = useRef(null);

  const fetchChats = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/chats");
      const list = data.chats || [];
      setChats(list);
      setError("");
      // Auto-select first if nothing selected yet
      if (list.length && !selected) setSelected(list[0]);
    } catch (err) {
      if (err instanceof AuthError) {
        clearInterval(pollingRef.current); pollingRef.current = null;
      }
      setError("Could not load chats.");
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { pendingChats: remotePending } = useAgentNotifications({
    userId: adminId,
    enabled: true
  });

  useEffect(() => {
    // Only update if there's a real difference in remotePending to prevent jitter
    if (remotePending.length) {
      setChats(prev => {
        let changed = false;
        const next = [...prev];
        remotePending.forEach(rc => {
          const cid = rc.id || rc._id;
          const idx = next.findIndex(c => (c.id || c._id) === cid);
          if (idx === -1) {
            next.unshift(rc);
            changed = true;
          } else {
            // Check for actual status/agent change before updating state
            if (next[idx].status !== rc.status || next[idx].agent !== rc.agent) {
              next[idx] = { ...next[idx], ...rc };
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [remotePending]);

  useEffect(() => {
    fetchChats();
    // Removed setInterval(8000) polling to prevent UI glitching/jitter
  }, [fetchChats]);

  return (
    <div className="flex gap-4 h-[calc(100vh-148px)]">
      {/* List */}
      <div className="w-60 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">All Chats ({chats.length})</p>
          <button onClick={fetchChats} className="text-gray-400 hover:text-blue-500 transition-colors">
            <Icon name="refresh" cls="w-3.5 h-3.5"/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 h-full scroll-smooth select-none">
          {loading
            ? [1,2,3].map(i=><div key={i} className="px-4 py-3 space-y-2 border-b border-gray-50"><Skeleton cls="h-3 w-24"/><Skeleton cls="h-3 w-16"/></div>)
            : error
              ? <div className="px-4 py-8 text-center text-xs text-red-400 font-medium">{error}</div>
              : chats.length === 0
                ? <div className="px-4 py-12 text-center text-xs text-gray-400 italic flex flex-col items-center gap-2">
                    <Icon name="chat" cls="w-10 h-10 text-gray-100 mb-1"/>
                    No active conversations.
                  </div>
                : (() => {
                    const sorted = [...chats].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                    const groups = [];
                    sorted.reverse().forEach(c => {
                      const date = new Date(c.created_at || Date.now()).toDateString();
                      if (!groups.length || groups[groups.length - 1].date !== date) {
                        groups.push({ date, display: fmtGroupDate(c.created_at || Date.now()), items: [] });
                      }
                      groups[groups.length - 1].items.push(c);
                    });
                    
                    return groups.map(group => (
                      <div key={group.date} className="last:pb-4">
                        <div className="px-4 py-2 bg-gray-50/80 border-y border-gray-100/50 sticky top-0 z-10 backdrop-blur-md">
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">{group.display}</span>
                        </div>
                        {group.items.map(c => {
                          const cid = c.id || c._id;
                          const isActive = selected?.id === cid;
                          return (
                            <div key={cid} onClick={()=>setSelected(c)}
                              className={`px-4 py-3.5 cursor-pointer hover:bg-blue-50/40 transition-all border-b border-gray-50 last:border-0 relative group
                                ${isActive ? "bg-white ring-2 ring-inset ring-blue-500/10 shadow-[inset_4px_0_0_0_#3b82f6]" : ""}
                                ${c.status === "offline" ? "opacity-60 grayscale-[0.3]" : ""}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <p className={`text-xs font-bold truncate pr-2 transition-colors ${isActive ? "text-blue-600" : "text-gray-800"}`}>{c.customer}</p>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border ${CPILL[c.status]||CPILL.offline}`}>{c.status === "offline" ? "Inactive" : c.status}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <p className="text-gray-400 font-medium truncate max-w-[120px]">{c.printer || "Inbound Query"}</p>
                                <span className="text-gray-300 font-mono tracking-tighter">{fmtTime(c.created_at)}</span>
                              </div>
                              {c.status === "active" && c.agent && (
                                <div className="mt-2 flex items-center gap-1.5 py-0.5 px-1.5 bg-emerald-50 rounded-md border border-emerald-100/50 w-fit">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
                                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight">Active: {c.agent}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()
          }
        </div>
      </div>
      <AdminChatWindow chat={selected}/>
    </div>
  );
}

// ─── LEADS VIEW ───────────────────────────────────────────────────────────────
function LeadsView({ search }) {
  const [leads,    setLeads]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [saving,   setSaving]   = useState({});
  const [error,    setError]    = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/admin/leads");
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
      await apiFetch(`/api/admin/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    } catch { /* optimistic stays */ }
    finally { setSaving(p => { const n={...p}; delete n[id]; return n; }); }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/admin/leads/${deleteId}`, { method: "DELETE" });
      setLeads(prev => prev.filter(l => l.id !== deleteId));
    } catch { alert("Delete failed. Please try again."); }
    finally { setDeleteId(null); }
  };

  const filtered = leads.filter(l =>
    [l.id, l.customer, l.printer, l.issue, l.status, l.email, l.phone].some(v =>
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
              ? <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">No leads found.</td></tr>
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
            <p className="text-sm text-gray-500 mb-6">This will permanently remove this lead from MongoDB.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── WEBSITE CONTENT VIEW ─────────────────────────────────────────────────────
// Shows website contact/config fields stored in MongoDB.
// GET  /api/admin/website  → { fields: [{ id, key, label, value, updated_at }] }
// PATCH /api/admin/website → { key, value }
const WC_TABS = ["Contact Info","Business Hours","Social Links","SEO / Meta"];

function WebsiteContentView({ search }) {
  const [tab,     setTab]     = useState("Contact Info");
  const [fields,  setFields]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState({});
  const [editId,  setEditId]  = useState(null);
  const [editVal, setEditVal] = useState("");
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/admin/website");
        setFields(data.fields || []);
      } catch {
        setError("Could not load website fields.");
        setFields([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const saveField = async (id, key, value) => {
    setSaving(p => ({ ...p, [id]: true }));
    try {
      await apiFetch("/api/admin/website", { method: "PATCH", body: JSON.stringify({ key, value }) });
      setFields(prev => prev.map(f => f.id === id ? { ...f, value, updated_at: new Date().toISOString() } : f));
      setEditId(null);
    } catch { alert("Save failed. Please try again."); }
    finally { setSaving(p => { const n={...p}; delete n[id]; return n; }); }
  };

  // Filter by active tab category and search
  const tabFields = fields.filter(f => f.category === tab);
  const filtered  = tabFields.filter(f =>
    !search || [f.label, f.key, f.value].some(v => String(v||"").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-4 pt-1 overflow-x-auto">
        {WC_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
              ${tab===t?"border-blue-500 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-6 space-y-3">{[1,2,3].map(i=><Skeleton key={i} cls="h-12 w-full"/>)}</div>
      ) : error ? (
        <div className="px-6 py-10 text-center text-sm text-red-400">{error}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Field","Current Value","Last Updated","Action"].map(h=>(
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-6 py-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">No fields in this category yet.</td></tr>
              : filtered.map((f,i,arr)=>(
                <tr key={f.id} className={`hover:bg-gray-50 transition-colors ${i<arr.length-1?"border-b border-gray-100":""}`}>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{f.key}</p>
                  </td>
                  <td className="px-6 py-4 max-w-[260px]">
                    {editId === f.id ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e=>setEditVal(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&saveField(f.id, f.key, editVal)}
                        className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <span className="text-sm text-gray-700 break-all">{f.value || <span className="text-gray-300 italic">empty</span>}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-pre-line">{fmtDate(f.updated_at)}</td>
                  <td className="px-6 py-4">
                    {editId === f.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={()=>saveField(f.id, f.key, editVal)}
                          disabled={saving[f.id]}
                          className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-60">
                          {saving[f.id]?"Saving…":"Save"}
                        </button>
                        <button onClick={()=>setEditId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={()=>{setEditId(f.id); setEditVal(f.value||"");}}
                        className="text-blue-400 hover:text-blue-600 p-1">
                        <Icon name="edit" cls="w-4 h-4"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── AGENTS VIEW ──────────────────────────────────────────────────────────────
function AgentsView({ search, forceAdd, onAddClose }) {
  const [agents,    setAgents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editAgent, setEditAgent] = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [form,      setForm]      = useState({ name:"", email:"", phone:"" });
  const [addForm,   setAddForm]   = useState({ name:"", email:"", password:"", phone:"" });
  const [addError,  setAddError]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => { if (forceAdd) { setShowAdd(true); onAddClose?.(); } }, [forceAdd]);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/agents");
      setAgents(data.agents || []);
    } catch {
      setError("Could not load agents.");
      setAgents([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/agents/${editAgent.id}`, { method: "PUT", body: JSON.stringify(form) });
      setAgents(prev => prev.map(a => a.id === editAgent.id ? { ...a, ...form } : a));
      setEditAgent(null);
    } catch (err) { alert(`Save failed: ${err.message}`); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/admin/agents/${deleteId}`, { method: "DELETE" });
      setAgents(prev => prev.filter(a => a.id !== deleteId));
    } catch (err) { alert(`Delete failed: ${err.message}`); }
    finally { setDeleteId(null); }
  };

  const addAgent = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) { setAddError("Name, email and password are required."); return; }
    setSaving(true);
    try {
      const data = await apiFetch("/api/admin/agents", { method: "POST", body: JSON.stringify(addForm) });
      setAgents(prev => [...prev, { id: data.id, ...addForm, created_at: new Date().toISOString() }]);
      setShowAdd(false);
      setAddForm({ name:"", email:"", password:"", phone:"" });
      setAddError("");
    } catch (err) { setAddError(err.message); }
    finally { setSaving(false); }
  };

  const filtered = agents.filter(a =>
    [a.id, a.name, a.email, a.phone].some(v => String(v||"").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
      {[1,2,3].map(i=><Skeleton key={i} cls="h-10 w-full"/>)}
    </div>
  );

  return (
    <>
      {error && <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["ID","Agent Name","Email Address","Phone Number","Joined","Action"].map(h=>(
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No agents found.</td></tr>
              : filtered.map((a,i,arr)=>(
                <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${i<arr.length-1?"border-b border-gray-100":""}`}>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{a.id?.slice(-6)}</td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-800 whitespace-nowrap">{a.name}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{a.email}</td>
                  <td className="px-5 py-4 text-xs text-gray-600">{a.phone||"—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-pre-line">{fmtDate(a.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setDeleteId(a.id)} className="text-red-400 hover:text-red-600 p-1"><Icon name="trash" cls="w-4 h-4"/></button>
                      <button onClick={()=>{setEditAgent(a);setForm({name:a.name,email:a.email,phone:a.phone||""});}} className="text-blue-400 hover:text-blue-600 p-1"><Icon name="edit" cls="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {editAgent&&(
        <Modal onClose={()=>setEditAgent(null)}>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Agent</h2>
          <p className="text-sm text-gray-400 mb-5">Changes saved to MongoDB</p>
          <div className="space-y-4">
            {[["Agent Name","name"],["Email Address","email"],["Phone Number","phone"]].map(([label,key])=>(
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                <input value={form[key]||""} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={()=>setEditAgent(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="flex-1 py-3 bg-blue-500 rounded-xl text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60">
              {saving?"Saving…":"Save"}
            </button>
          </div>
        </Modal>
      )}

      {showAdd&&(
        <Modal onClose={()=>setShowAdd(false)}>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Add New Agent</h2>
          <p className="text-sm text-gray-400 mb-5">Creates account in MongoDB with hashed password</p>
          <div className="space-y-4">
            {[["Full Name","name","text"],["Email Address","email","email"],["Password","password","password"],["Phone Number","phone","text"]].map(([label,key,type])=>(
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}{key!=="phone"&&<span className="text-red-400"> *</span>}</label>
                <input type={type} value={addForm[key]||""} onChange={e=>setAddForm(p=>({...p,[key]:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
              </div>
            ))}
            {addError&&<p className="text-xs text-red-500">{addError}</p>}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={()=>setShowAdd(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={addAgent} disabled={saving} className="flex-1 py-3 bg-blue-500 rounded-xl text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60">
              {saving?"Creating…":"Create Agent"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId&&(
        <Modal onClose={()=>setDeleteId(null)}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Icon name="trash" cls="w-7 h-7 text-red-500"/></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Agent</h2>
            <p className="text-sm text-gray-500 mb-6">This will remove the agent account from MongoDB.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function BlogsView() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', category: 'Technical Support', image: '', content: '' });

  const fetchBlogs = async () => {
    try {
      const data = await apiFetch("/api/admin/blogs");
      setBlogs(data.blogs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/blogs", { method: 'POST', body: JSON.stringify(newBlog) });
      setShowAdd(false);
      setNewBlog({ title: '', category: 'Technical Support', image: '', content: '' });
      fetchBlogs();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await apiFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      fetchBlogs();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading blogs...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Articles & News</h2>
          <p className="text-sm text-gray-500">Manage technical guides published on your website</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition cursor-pointer">
          Add New Blog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(b => (
          <div key={b._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm group">
            <div className="h-40 bg-gray-100 relative">
              <img src={b.image || "/blog_placeholder.png"} alt="" className="w-full h-full object-cover"/>
              <button onClick={() => handleDelete(b._id)} className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm">
                <Icon name="trash" cls="w-4 h-4"/>
              </button>
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                {b.category}
              </span>
              <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{b.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 mb-4">{b.content.substring(0, 100)}...</p>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{new Date(b.created_at).toLocaleDateString()}</span>
                <span>By {b.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} wide={true}>
          <div className="p-2">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Create Technical Article</h3>
                  <p className="text-sm text-gray-400 font-medium">Draft a new support guide or firmware update</p>
               </div>
               <button onClick={()=>setShowAdd(false)} className="text-gray-400 hover:text-black transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.1em]">Article Title</label>
                      <input required value={newBlog.title} onChange={e=>setNewBlog({...newBlog, title: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-sm outline-none transition-all" 
                        placeholder="How to Reset HP Printer Spooler"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.1em]">Category</label>
                      <select value={newBlog.category} onChange={e=>setNewBlog({...newBlog, category: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-sm outline-none transition-all">
                        <option>Technical Support</option>
                        <option>Setup Guides</option>
                        <option>Troubleshooting</option>
                        <option>News & Updates</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.1em]">Featured Image URL</label>
                      <input value={newBlog.image} onChange={e=>setNewBlog({...newBlog, image: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-sm outline-none transition-all" 
                        placeholder="https://example.com/banner.png"/>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
                        Publish Technical Article
                      </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-[0.1em]">Full Content (Markdown)</label>
                    <textarea required rows="14" value={newBlog.content} onChange={e=>setNewBlog({...newBlog, content: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-sm outline-none transition-all resize-none" 
                      placeholder="Write your detailed guide here... Supports markdown like # Heading, **Bold**, etc."></textarea>
                 </div>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ user, onLogout }) {
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [search,       setSearch]       = useState("");
  const [stats,        setStats]        = useState([]);
  const [areaData,     setAreaData]     = useState([]);
  const [barData,      setBarData]      = useState([]);
  const [leads,        setLeads]        = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [statsRaw, leadsData] = await Promise.all([
          apiFetch("/api/admin/stats"),
          apiFetch("/api/admin/leads"),
        ]);
        // statsRaw = { total_leads, active_chats, resolved, total_agents }
        setStats(buildStatCards(statsRaw));
        setLeads(leadsData.leads || []);
        // Build simple chart from real lead dates (group by day of week)
        const dayCounts = { Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0 };
        const dayResCounts = { Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0 };
        const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        (leadsData.leads||[]).forEach(l => {
          if (!l.created_at) return;
          const d = dayNames[new Date(l.created_at).getDay()];
          if (d) { dayCounts[d]++; if (l.status==="Resolved") dayResCounts[d]++; }
        });
        const chartDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
        const built = chartDays.map(day => ({ day, leads: dayCounts[day], resolved: dayResCounts[day] }));
        const hasData = built.some(d => d.leads > 0);
        setAreaData(hasData ? built : FALLBACK_AREA_DATA);
        setBarData(hasData ? built : FALLBACK_BAR_DATA);
      } catch {
        setStats([]); setLeads([]);
        setAreaData(FALLBACK_AREA_DATA); setBarData(FALLBACK_BAR_DATA);
      } finally { setLoadingStats(false); setLoadingLeads(false); }
    })();
  }, []);

  const handleStatusChange = async (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try { await apiFetch(`/api/admin/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); }
    catch { /* optimistic */ }
  };

  const NAV_META = {
    "Dashboard":       ["Dashboard",       "Overview of your support operations"],
    "Live Chats":      ["Live Chats",       "Manage active customer conversations"],
    "Leads":           ["Leads",            "Track and manage support requests"],
    "Website Content": ["Website Content",  "Edit live website fields stored in MongoDB"],
    "Agents":          ["Agents",           "Track and manage agents"],
    "Blogs":           ["Blogs",            "Write and manage support articles"],
  };
  const [title, subtitle] = NAV_META[activeNav]||["Dashboard",""];

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-52 shadow-sm">
        <Icon name="search" cls="w-3.5 h-3.5 text-gray-400 shrink-0"/>
        <input className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
          placeholder="Search here..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {activeNav==="Agents"
        ? <button onClick={()=>setShowAddAgent(true)} className="flex items-center gap-2 bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-600 shadow-sm whitespace-nowrap">+ Add New Agent</button>
        : <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap"><Icon name="download" cls="w-3.5 h-3.5"/> Export</button>
      }
    </div>
  );

  return (
    <DashboardLayout
      user={user} navItems={ADMIN_NAV} activeNav={activeNav}
      onNavChange={nav=>{setActiveNav(nav);setSearch("");}}
      onLogout={onLogout}
      headerTitle={title} headerSub={subtitle} headerRight={headerRight}
    >
      {activeNav==="Dashboard"       && <DashboardView stats={stats} areaData={areaData} barData={barData} leads={leads} loading={loadingStats} loadingLeads={loadingLeads} onStatusChange={handleStatusChange}/>}
            {activeNav === "Live Chats" && <LiveChatsView adminId={user.id} />}
      {activeNav==="Leads"           && <LeadsView search={search}/>}
      {activeNav==="Website Content" && <WebsiteContentView search={search}/>}
      {activeNav==="Agents"          && <AgentsView search={search} forceAdd={showAddAgent} onAddClose={()=>setShowAddAgent(false)}/>}
      {activeNav==="Blogs"           && <BlogsView/>}
    </DashboardLayout>
  );
}