import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginPage";
import { getToken, getRole } from "../lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage (route: /login)
//
// If user already has a token, redirect straight to their dashboard.
// Otherwise show the login form and redirect after success.
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  // Already logged in → skip login screen
  useEffect(() => {
    const token = getToken();
    const role  = getRole();
    if (token && role) navigate(`/dashboard/${role}`, { replace: true });
  }, [navigate]);

  const handleLogin = (user) => {
    // Role is already saved in localStorage by LoginForm via setRole()
    navigate(`/dashboard/${user.role}`, { replace: true });
  };

  return <LoginForm onLogin={handleLogin} />;
}