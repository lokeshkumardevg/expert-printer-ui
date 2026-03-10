// ─────────────────────────────────────────────────────────────────────────────
// constants.js — all static config, fallback data, nav items per role
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE    = "http://localhost:8000";
export const API_ENABLED = true;

export const ROLES = { ADMIN: "admin", AGENT: "agent" };

// ── Fallback users (dev/offline) ───────────────────────────────────────────
export const FALLBACK_USERS = [
  { email: "admin@wheedle.ai", password: "admin123", name: "Admin User",  initials: "AU", role: "admin" },
  { email: "agent@wheedle.ai", password: "agent123", name: "Agent Smith", initials: "AS", role: "agent" },
];

// ── Nav per role ───────────────────────────────────────────────────────────
export const ADMIN_NAV = [
  { label: "Dashboard",       icon: "grid"  },
  { label: "Live Chats",      icon: "chat"  },
  { label: "Leads",           icon: "list"  },
  { label: "Website Content", icon: "globe" },
  { label: "Agents",          icon: "users" },
];

export const AGENT_NAV = [
  { label: "Dashboard",  icon: "grid" },
  { label: "Live Chats", icon: "chat" },
  { label: "Leads",      icon: "list" },
];

// ── Admin stats ────────────────────────────────────────────────────────────
export const ADMIN_FALLBACK_STATS = [
  { label: "Total Leads",     value: "1,247", change: "+12% vs last week", positive: true,  icon: "list",        accent: "bg-blue-50 text-blue-500"      },
  { label: "Active Chats",    value: "342",   change: "-3% vs last week",  positive: false, icon: "chat",        accent: "bg-orange-50 text-orange-500"  },
  { label: "Resolved Issues", value: "893",   change: "+18% vs last week", positive: true,  icon: "checkCircle", accent: "bg-emerald-50 text-emerald-500" },
  { label: "Total Agents",    value: "12",    change: "+2 this month",     positive: true,  icon: "users",       accent: "bg-purple-50 text-purple-500"  },
];

// ── Agent stats ────────────────────────────────────────────────────────────
export const AGENT_FALLBACK_STATS = [
  { label: "My Leads",       value: "38",  change: "+5 today",         positive: true,  icon: "list",        accent: "bg-blue-50 text-blue-500"      },
  { label: "Active Chats",   value: "4",   change: "2 pending reply",  positive: false, icon: "chat",        accent: "bg-orange-50 text-orange-500"  },
  { label: "Resolved Today", value: "11",  change: "+3 vs yesterday",  positive: true,  icon: "checkCircle", accent: "bg-emerald-50 text-emerald-500" },
  { label: "Avg. Response",  value: "2m",  change: "Target: under 5m", positive: true,  icon: "clock",       accent: "bg-indigo-50 text-indigo-500"  },
];

// ── Chart data ─────────────────────────────────────────────────────────────
export const FALLBACK_AREA_DATA = [
  { day: "Mon", leads: 80,  resolved: 35 }, { day: "Tue", leads: 100, resolved: 45 },
  { day: "Wed", leads: 90,  resolved: 40 }, { day: "Thu", leads: 75,  resolved: 35 },
  { day: "Fri", leads: 70,  resolved: 38 }, { day: "Sat", leads: 65,  resolved: 30 },
  { day: "Sun", leads: 85,  resolved: 42 },
];

export const FALLBACK_BAR_DATA = [
  { day: "Mon", leads: 62, resolved: 58 }, { day: "Tue", leads: 70, resolved: 62 },
  { day: "Wed", leads: 45, resolved: 38 }, { day: "Thu", leads: 90, resolved: 68 },
  { day: "Fri", leads: 65, resolved: 62 }, { day: "Sat", leads: 68, resolved: 64 },
  { day: "Sun", leads: 35, resolved: 30 },
];

// ── All leads (admin sees all, agent sees own) ─────────────────────────────
export const FALLBACK_ALL_LEADS = [
  { id: "L-001", name: "John Davis",  printer: "HP LaserJet Pro", issue: "Printer not connecting to WiFi",   status: "New",       time: "10:30 AM", assignedTo: "agent@techforcall.ai" },
  { id: "L-002", name: "Sarah Lee",   printer: "Canon PIXMA",     issue: "Paper jam error persists",         status: "Contacted", time: "11:00 AM", assignedTo: "agent@techforcall.ai" },
  { id: "L-003", name: "Mike Brown",  printer: "Epson EcoTank",   issue: "Print quality – streaky lines",    status: "New",       time: "11:20 AM", assignedTo: null },
  { id: "L-004", name: "Anna White",  printer: "Brother MFC",     issue: "Driver installation failed",       status: "Resolved",  time: "12:00 PM", assignedTo: "other@techforcall.ai" },
  { id: "L-005", name: "Tom Harris",  printer: "HP OfficeJet",    issue: "Scanner not working properly",     status: "Contacted", time: "12:45 PM", assignedTo: "agent@techforcall.ai" },
];

// ── Agents list (admin only) ───────────────────────────────────────────────
export const FALLBACK_AGENTS = [
  { id: "A-001", name: "Agent Smith", email: "agent@techforcall.ai",  status: "Online",  leads: 12, resolved: 9 },
  { id: "A-002", name: "Jane Cooper", email: "jane@techforcall.ai",   status: "Busy",    leads: 8,  resolved: 6 },
  { id: "A-003", name: "Carlos Diaz", email: "carlos@techforcall.ai", status: "Offline", leads: 5,  resolved: 5 },
];

// ── Chats ──────────────────────────────────────────────────────────────────
export const FALLBACK_CHATS = [
  { id: "C-001", customer: "John Davis", issue: "WiFi printer issue",     status: "Open",    time: "10:32 AM", unread: 2 },
  { id: "C-002", customer: "Sarah Lee",  issue: "Paper jam support",      status: "Pending", time: "11:05 AM", unread: 0 },
  { id: "C-003", customer: "Tom Harris", issue: "Scanner not responding", status: "Open",    time: "12:50 PM", unread: 1 },
];

// ── Styles ─────────────────────────────────────────────────────────────────
export const STATUS_STYLES = {
  New:       "bg-gray-900 text-white",
  Contacted: "bg-amber-50 text-amber-600 border border-amber-200",
  Resolved:  "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

export const CHAT_STATUS_STYLES = {
  Open:    "bg-blue-50 text-blue-600 border border-blue-100",
  Pending: "bg-amber-50 text-amber-600 border border-amber-200",
  Closed:  "bg-gray-100 text-gray-500",
};

export const AGENT_ONLINE_STYLES = {
  Online:  "bg-emerald-400",
  Busy:    "bg-amber-400",
  Offline: "bg-gray-300",
};