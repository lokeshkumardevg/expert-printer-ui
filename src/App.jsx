import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// ── Existing pages ─────────────────────────────────────────────────────────
import LandingPage  from "./pages/LandingPage";
import SupportPage  from "./pages/SupportPage";
import Fdbkpage     from "./pages/Fdbkpage";
import ServicePage  from "./pages/ServicePage";
import NotFound     from "./components/NotFound";
import Preloader    from "./components/Preloader";

// ── Auth & dashboard ───────────────────────────────────────────────────────
import LoginPage          from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import ProtectedRoute     from "./components/ProtectedRoute";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Preloader />;

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────────── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/support"  element={<SupportPage />} />
      <Route path="/feedback" element={<Fdbkpage />} />
      <Route path="/services" element={<ServicePage />} />

      {/* ── Auth ──────────────────────────────────────────────────────── */}
      {/* /login → auto-redirects to correct dashboard if already logged in */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Protected dashboards (role-gated) ─────────────────────────── */}

      {/* Admin only — agent visiting this URL gets sent to /dashboard/agent */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      }/>

      {/* Agent only — admin visiting this URL gets sent to /dashboard/admin */}
      <Route path="/dashboard/agent" element={
        <ProtectedRoute allowedRole="agent">
          <AgentDashboardPage />
        </ProtectedRoute>
      }/>

      {/* Bare /dashboard → redirect to role-specific dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {/* ProtectedRoute with no allowedRole just checks token,
              then redirects to /dashboard/:role automatically */}
          <AdminDashboardPage />
        </ProtectedRoute>
      }/>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;