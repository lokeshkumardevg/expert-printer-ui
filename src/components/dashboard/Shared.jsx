export function Skeleton({ cls = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${cls}`} />;
}

// ── StatCard ───────────────────────────────────────────────────────────────
import Icon from "./Icon";

export function StatCard({ label, value, change, positive, icon, accent, loading = false }) {
  if (loading) return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0 space-y-3">
      <Skeleton cls="h-3 w-24"/><Skeleton cls="h-8 w-20"/><Skeleton cls="h-3 w-32"/>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm min-w-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon name={icon} cls="w-4 h-4"/>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{value}</p>
      <p className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-red-400"}`}>
        {positive ? "↑" : "↓"} {change}
      </p>
    </div>
  );
}