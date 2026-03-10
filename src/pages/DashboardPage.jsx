import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — change BASE_URL to match your FastAPI server
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// Toggle to false to force static fallback (simulate API being down)
const API_ENABLED = true;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC FALLBACK DATA — used when API is unavailable
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_USERS = [
  { email: "admin@wheedle.ai",   password: "admin123",   name: "Admin",   initials: "AD" },
];

const FALLBACK_STATS = [
  { label: "Total Leads",       value: "1,247", change: "+12% vs last week", positive: true,  icon: "user",        accent: "bg-blue-50 text-blue-400" },
  { label: "Active Chats",      value: "342",   change: "-3% vs last week",  positive: false, icon: "chat",        accent: "bg-orange-50 text-orange-400" },
  { label: "Resolved Issues",   value: "893",   change: "+18% vs last week", positive: true,  icon: "checkCircle", accent: "bg-emerald-50 text-emerald-400" },
  { label: "Conversation Rate", value: "86%",   change: "+5% vs last week",  positive: true,  icon: "chat",        accent: "bg-purple-50 text-purple-400" },
];

const FALLBACK_AREA_DATA = [
  { day:"Mon", leads:80,  resolved:35 }, { day:"Tue", leads:100, resolved:45 },
  { day:"Wed", leads:90,  resolved:40 }, { day:"Thu", leads:75,  resolved:35 },
  { day:"Fri", leads:70,  resolved:38 }, { day:"Sat", leads:65,  resolved:30 },
  { day:"Sun", leads:85,  resolved:42 },
];

const FALLBACK_BAR_DATA = [
  { day:"Mon", leads:62, resolved:58 }, { day:"Tue", leads:70, resolved:62 },
  { day:"Wed", leads:45, resolved:38 }, { day:"Thu", leads:90, resolved:68 },
  { day:"Fri", leads:65, resolved:62 }, { day:"Sat", leads:68, resolved:64 },
  { day:"Sun", leads:35, resolved:30 },
];

const FALLBACK_LEADS = [
  { id:"L-001", name:"John Davis",  printer:"HP LaserJet Pro",  issue:"Printer not connecting to WiFi network", status:"New",       time:"10:30 AM" },
  { id:"L-002", name:"Sarah Lee",   printer:"Canon PIXMA",      issue:"Paper jam error persists",               status:"Contacted", time:"11:00 AM" },
  { id:"L-003", name:"Mike Brown",  printer:"Epson EcoTank",    issue:"Print quality issues – streaky lines",   status:"New",       time:"11:20 AM" },
  { id:"L-004", name:"Anna White",  printer:"Brother MFC",      issue:"Driver installation failed",             status:"Resolved",  time:"12:00 PM" },
  { id:"L-005", name:"Tom Harris",  printer:"HP OfficeJet",     issue:"Scanner not working properly",           status:"Contacted", time:"12:45 PM" },
];

const NAV_ITEMS = [
  { label:"Dashboard",       icon:"grid"  },
  { label:"Live Chats",      icon:"chat"  },
  { label:"Leads",           icon:"list"  },
  { label:"Website Content", icon:"globe" },
  { label:"Agents",          icon:"user"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("tfc_token");
const setToken = (t) => localStorage.setItem("tfc_token", t);
const clearToken = () => localStorage.removeItem("tfc_token");

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function Icon({ name, cls = "w-4 h-4" }) {
  const paths = {
    phone:       <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>,
    mail:        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
    lock:        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>,
    eye:         <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>,
    eyeOff:      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>,
    chat:        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>,
    list:        <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></>,
    globe:       <><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M3 12h18M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9"/></>,
    grid:        <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    user:        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>,
    logout:      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>,
    search:      <><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></>,
    download:    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>,
    chevron:     <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>,
    checkCircle: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    wifi:        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>,
    wifiOff:     <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3 3l18 18"/>,
  };
  if (name === "dots") return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>;
  return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>{paths[name]}</svg>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ cls = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${cls}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);

    // ── Try API first ──────────────────────────────────────────────────
    if (API_ENABLED) {
      try {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setLoading(false);
        onLogin({ ...data.user, emailDisplay: email, fromApi: true });
        return;
      } catch (err) {
        // API failed — fall through to static fallback
        console.warn("[API] Login failed, using fallback:", err.message);
      }
    }

    // ── Static fallback ────────────────────────────────────────────────
    const match = FALLBACK_USERS.find(u => u.email === email && u.password === password);
    if (!match) {
      setErrors({ password: "Invalid email or password" });
      setLoading(false);
      return;
    }
    setTimeout(() => {
      setLoading(false);
      onLogin({ ...match, emailDisplay: email, fromApi: false });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-10">
            <img
              src="/logo.svg"
              alt="logo"
              className="h-12 lg:h-14 w-auto object-contain"
            />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Icon name="mail" cls="w-4 h-4"/></span>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  placeholder="john@company.com"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white outline-none transition-all
                    ${errors.email ? "border-red-300 ring-2 ring-red-100" : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Icon name="lock" cls="w-4 h-4"/></span>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 text-sm rounded-xl border bg-white outline-none transition-all
                    ${errors.password ? "border-red-300 ring-2 ring-red-100" : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                   
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Icon name={showPass ? "eyeOff" : "eye"} cls="w-4 h-4"/>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              style={{ backgroundColor: "var(--bg-color)" }}
              className="w-full py-3 rounded-xl cursor-pointer text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
              ) : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">© 2026 TechForCall. All rights reserved.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────────────────────────────────────
function AreaChartSVG({ data }) {
  const W=460,H=180,pL=28,pR=8,pT=8,pB=28, iW=W-pL-pR, iH=H-pT-pB;
  const max = Math.ceil(Math.max(...data.map(d => Math.max(d.leads, d.resolved))) / 20) * 20 + 20;
  const tx = i => pL + (i / (data.length - 1)) * iW;
  const ty = v => pT + iH - (v / max) * iH;
  const line = k => data.map((d, i) => `${i === 0 ? "M" : "L"}${tx(i).toFixed(1)},${ty(d[k]).toFixed(1)}`).join(" ");
  const area = k => `${line(k)} L${tx(data.length-1).toFixed(1)},${(pT+iH).toFixed(1)} L${tx(0).toFixed(1)},${(pT+iH).toFixed(1)} Z`;
  const grids = [0, max*0.25, max*0.5, max*0.75, max].map(v => Math.round(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity=".4"/><stop offset="100%" stopColor="#34d399" stopOpacity=".02"/></linearGradient>
        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity=".4"/><stop offset="100%" stopColor="#818cf8" stopOpacity=".02"/></linearGradient>
      </defs>
      {grids.map(v => <g key={v}><line x1={pL} x2={W-pR} y1={ty(v)} y2={ty(v)} stroke="#f3f4f6" strokeWidth="1"/><text x={pL-4} y={ty(v)+4} textAnchor="end" fontSize="9" fill="#d1d5db">{v}</text></g>)}
      <path d={area("leads")} fill="url(#ag1)"/>
      <path d={area("resolved")} fill="url(#ag2)"/>
      <path d={line("leads")} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <path d={line("resolved")} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d, i) => <text key={d.day} x={tx(i)} y={H-6} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.day}</text>)}
    </svg>
  );
}

function BarChartSVG({ data }) {
  const W=460,H=180,pL=28,pR=8,pT=8,pB=28, iW=W-pL-pR, iH=H-pT-pB;
  const max = Math.ceil(Math.max(...data.map(d => Math.max(d.leads, d.resolved))) / 10) * 10 + 10;
  const gW = iW / data.length, bW = gW * 0.3, gap = bW * 0.4;
  const ty = v => pT + iH - (v / max) * iH, th = v => (v / max) * iH;
  const grids = [0, max*0.33, max*0.66, max].map(v => Math.round(v));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {grids.map(v => <g key={v}><line x1={pL} x2={W-pR} y1={ty(v)} y2={ty(v)} stroke="#f3f4f6" strokeWidth="1"/><text x={pL-4} y={ty(v)+4} textAnchor="end" fontSize="9" fill="#d1d5db">{v}</text></g>)}
      {data.map((d, i) => {
        const cx = pL + i * gW + gW / 2;
        return <g key={d.day}>
          <rect x={cx-gap/2-bW} y={ty(d.leads)}   width={bW} height={th(d.leads)}   fill="#60a5fa" rx="3"/>
          <rect x={cx+gap/2}    y={ty(d.resolved)} width={bW} height={th(d.resolved)} fill="#34d399" rx="3"/>
          <text x={cx} y={H-6} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.day}</text>
        </g>;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  New:       "bg-gray-900 text-white",
  Contacted: "bg-gray-100 text-gray-600 border border-gray-200",
  Resolved:  "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

function StatCard({ label, value, change, positive, icon, accent, loading }) {
  if (loading) return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0 space-y-3">
      <Skeleton cls="h-3 w-24"/><Skeleton cls="h-8 w-20"/><Skeleton cls="h-3 w-32"/>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}><Icon name={icon} cls="w-4 h-4"/></div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{value}</p>
      <p className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-red-400"}`}>{positive ? "↑" : "↓"} {change}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DashboardPage({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch]       = useState("");

  // Data state
  const [stats, setStats]         = useState([]);
  const [areaData, setAreaData]   = useState([]);
  const [barData, setBarData]     = useState([]);
  const [leads, setLeads]         = useState([]);

  // Loading flags
  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingLeads, setLoadingLeads]   = useState(true);

  // Source indicator (for dev — doesn't show in UI to user)
  const [dataSource, setDataSource] = useState({ stats:"…", charts:"…", leads:"…" });

  // ── Fetch stats ────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    if (API_ENABLED) {
      try {
        const data = await apiFetch("/api/dashboard/stats");
        setStats(data);
        setDataSource(p => ({ ...p, stats: "api" }));
        setLoadingStats(false);
        return;
      } catch (err) {
        console.warn("[API] /stats failed, using fallback:", err.message);
      }
    }
    setStats(FALLBACK_STATS);
    setDataSource(p => ({ ...p, stats: "fallback" }));
    setLoadingStats(false);
  }, []);

  // ── Fetch charts ───────────────────────────────────────────────────────
  const fetchCharts = useCallback(async () => {
    setLoadingCharts(true);
    if (API_ENABLED) {
      try {
        const data = await apiFetch("/api/dashboard/charts");
        setAreaData(data.areaData);
        setBarData(data.barData);
        setDataSource(p => ({ ...p, charts: "api" }));
        setLoadingCharts(false);
        return;
      } catch (err) {
        console.warn("[API] /charts failed, using fallback:", err.message);
      }
    }
    setAreaData(FALLBACK_AREA_DATA);
    setBarData(FALLBACK_BAR_DATA);
    setDataSource(p => ({ ...p, charts: "fallback" }));
    setLoadingCharts(false);
  }, []);

  // ── Fetch leads ────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    if (API_ENABLED) {
      try {
        const data = await apiFetch("/api/leads");
        setLeads(data.leads);
        setDataSource(p => ({ ...p, leads: "api" }));
        setLoadingLeads(false);
        return;
      } catch (err) {
        console.warn("[API] /leads failed, using fallback:", err.message);
      }
    }
    setLeads(FALLBACK_LEADS);
    setDataSource(p => ({ ...p, leads: "fallback" }));
    setLoadingLeads(false);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCharts();
    fetchLeads();
  }, [fetchStats, fetchCharts, fetchLeads]);

  // ── Update lead status ─────────────────────────────────────────────────
  const cycleStatus = async (id) => {
    const order = ["New", "Contacted", "Resolved"];
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const newStatus = order[(order.indexOf(lead.status) + 1) % order.length];

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));

    if (API_ENABLED && dataSource.leads === "api") {
      try {
        await apiFetch(`/api/leads/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.warn("[API] Status update failed, reverting:", err.message);
        // Revert on failure
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: lead.status } : l));
      }
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (API_ENABLED && user.fromApi) {
      try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch (_) {}
    }
    clearToken();
    onLogout();
  };

  const filteredLeads = leads.filter(l =>
    [l.id, l.name, l.printer, l.issue, l.status].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0"><Icon name="phone" cls="w-4 h-4 text-white"/></div>
          <div><span className="block text-sm font-bold text-gray-900 leading-tight">Tech</span><span className="block text-sm font-bold text-blue-500 leading-tight">for Call</span></div>
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ label, icon }) => (
            <button key={label} onClick={() => setActiveNav(label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full
                ${activeNav === label ? "bg-blue-500 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <Icon name={icon} cls="w-4 h-4 shrink-0"/>{label}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-4 mt-4 px-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.emailDisplay}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-1 py-1 transition-colors w-full">
            <Icon name="logout" cls="w-3.5 h-3.5"/>Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Overview of your support operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-48">
              <Icon name="search" cls="w-3.5 h-3.5 text-gray-400 shrink-0"/>
              <input
                className="bg-transparent text-xs text-gray-500 outline-none w-full placeholder:text-gray-400"
                placeholder="Search leads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
              <Icon name="download" cls="w-3.5 h-3.5"/>Export Data
            </button>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {/* Stat Cards */}
          <div className="flex gap-4">
            {loadingStats
              ? [1,2,3,4].map(i => <StatCard key={i} loading={true}/>)
              : stats.map(card => <StatCard key={card.label} {...card} loading={false}/>)
            }
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">Leads & Resolutions (Last 7 Days)</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Leads</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"/>Resolved</span>
                </div>
              </div>
              <div className="h-48">
                {loadingCharts
                  ? <div className="h-full flex items-center justify-center"><Skeleton cls="w-full h-full"/></div>
                  : <AreaChartSVG data={areaData}/>
                }
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">Daily Performance</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>Leads</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Resolved</span>
                </div>
              </div>
              <div className="h-48">
                {loadingCharts
                  ? <div className="h-full flex items-center justify-center"><Skeleton cls="w-full h-full"/></div>
                  : <BarChartSVG data={barData}/>
                }
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Recent Leads</h2>
              {!loadingLeads && (
                <span className="text-xs text-gray-400">{filteredLeads.length} result{filteredLeads.length !== 1 ? "s" : ""}</span>
              )}
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {["ID","Name","Printer","Issue","Status","Created","Action"].map(h =>
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loadingLeads ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="border-b border-gray-50">
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} className="px-5 py-4"><Skeleton cls="h-3 w-full"/></td>
                      ))}
                    </tr>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No leads match your search.</td></tr>
                ) : (
                  filteredLeads.map((lead, i) => (
                    <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${i < filteredLeads.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <td className="px-5 py-3.5 text-xs font-semibold text-gray-700 whitespace-nowrap">{lead.id}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700 whitespace-nowrap">{lead.name}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">{lead.printer}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs"><span className="block truncate">{lead.issue}</span></td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => cycleStatus(lead.id)}
                          title="Click to advance status"
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-75 cursor-pointer ${STATUS_STYLES[lead.status]}`}>
                          {lead.status}<Icon name="chevron" cls="w-2.5 h-2.5"/>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{lead.time}</td>
                      <td className="px-5 py-3.5"><button className="text-gray-300 hover:text-gray-600 transition-colors"><Icon name="dots" cls="w-4 h-4"/></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  return user
    ? <DashboardPage user={user} onLogout={() => setUser(null)}/>
    : <LoginPage onLogin={u => setUser(u)}/>;
}