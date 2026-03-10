import Icon from "./Icon";

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout — shared sidebar + main wrapper
//
// Props:
//   user        {object}   — { name, initials, emailDisplay, role }
//   navItems    {Array}    — [{ label, icon }]
//   activeNav   {string}
//   onNavChange {Function}
//   onLogout    {Function}
//   headerTitle {string}
//   headerSub   {string}
//   headerRight {ReactNode} — optional right slot (search, buttons)
//   children    {ReactNode} — main page content
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardLayout({
  user,
  navItems,
  activeNav,
  onNavChange,
  onLogout,
  headerTitle,
  headerSub,
  headerRight,
  children,
}) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Icon name="phone" cls="w-4 h-4 text-white"/>
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-900 leading-tight">Tech</span>
            <span className="block text-sm font-bold text-blue-500 leading-tight">for Call</span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
            ${isAdmin
              ? "bg-purple-50 text-purple-600 border border-purple-100"
              : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
            <Icon name={isAdmin ? "shield" : "user"} cls="w-3 h-3"/>
            {isAdmin ? "Admin" : "Agent"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map(({ label, icon }) => (
            <button key={label} onClick={() => onNavChange(label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full
                ${activeNav === label
                  ? "bg-blue-500 text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}>
              <Icon name={icon} cls="w-4 h-4 shrink-0"/>
              {label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-100 pt-4 mt-4 px-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0
              ${isAdmin ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-500"}`}>
              {user?.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.emailDisplay}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 px-1 py-1 transition-colors w-full">
            <Icon name="logout" cls="w-3.5 h-3.5"/>Logout
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{headerTitle}</h1>
            {headerSub && <p className="text-xs text-gray-400 mt-0.5">{headerSub}</p>}
          </div>
          {headerRight && <div className="flex items-center gap-3">{headerRight}</div>}
        </div>

        <div className="p-8 space-y-5">{children}</div>
      </main>
    </div>
  );
}