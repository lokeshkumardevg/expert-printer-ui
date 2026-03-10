import { API_BASE } from "./constants";

// ── Token / user helpers ──────────────────────────────────────────────────────
export const getToken   = ()  => localStorage.getItem("tfc_token");
export const setToken   = (t) => localStorage.setItem("tfc_token", t);
export const clearToken = ()  => localStorage.removeItem("tfc_token");

export const getRole    = ()  => localStorage.getItem("tfc_role");
export const setRole    = (r) => localStorage.setItem("tfc_role", r);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("tfc_user") || "null"); }
  catch { return null; }
};
export const setUser  = (u) => localStorage.setItem("tfc_user", JSON.stringify(u));
export const clearUser = () => {
  ["tfc_token", "tfc_role", "tfc_user"].forEach((k) => localStorage.removeItem(k));
};

// ── Is the stored token a real JWT? ──────────────────────────────────────────
// A real JWT always has exactly 3 base64url parts separated by dots.
// "fallback-token" doesn't → returns false → apiFetch won't make the HTTP call.
export const hasRealToken = () => {
  const t = getToken();
  if (!t) return false;
  return t.split(".").length === 3;
};

// ── Auth error class ─────────────────────────────────────────────────────────
export class AuthError extends Error {
  constructor(msg) {
    super(msg);
    this.name   = "AuthError";
    this.status = 401;
  }
}

// ── Authenticated fetch ───────────────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  // Guard: if no real JWT, throw immediately without making the HTTP call.
  // This stops the 401 flood when running with the static fallback token.
  if (!hasRealToken()) {
    throw new AuthError("No valid token — running in fallback mode");
  }

  const token = getToken();
  const res   = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${token}`,
      ...options.headers,
    },
  });

  // 401 = token expired or invalid
  if (res.status === 401) {
    clearUser();
    throw new AuthError("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}
