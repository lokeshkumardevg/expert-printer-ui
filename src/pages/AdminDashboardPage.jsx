import { useNavigate } from "react-router-dom";
import AdminDashboard from "../components/dashboard/admin/AdminDashboard";
import { clearUser, getUser, apiFetch } from "../lib/api";
import { API_ENABLED } from "../lib/constants";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    // 1. Clear token immediately — no waiting
    clearUser();

    // 2. Navigate to login right away
    navigate("/login", { replace: true });

    // 3. Tell the API in the background (don't await)
    if (API_ENABLED) {
      apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  };

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}