import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
//
// Guards a route by checking:
//   1. Token exists → if not, redirect to /login
//   2. User's role matches allowedRole → if not, redirect to their own dashboard
//
// Props:
//   allowedRole {string}    — "admin" | "agent"
//   children    {ReactNode} — page to render if authorized
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtectedRoute({ children, allowedRole }) {
  const token = getToken();
  const role  = getRole();

  // Not logged in → go to login
  if (!token) return <Navigate to="/login" replace />;

  // No specific role required (bare /dashboard) → send to their dashboard
  if (!allowedRole) return <Navigate to={`/dashboard/${role}`} replace />;

  // Wrong role → redirect to their own dashboard instead
  if (role !== allowedRole) return <Navigate to={`/dashboard/${role}`} replace />;

  return children;
}