import { useState } from "react";
import Icon from "../dashboard/Icon";
import { apiFetch, setToken, setRole, setUser } from "../../lib/api";
import { FALLBACK_USERS, API_ENABLED } from "../../lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage
// Single login form for both Admin and Agent.
// After login, calls onLogin(user) — user.role determines redirect destination.
//
// Props:
//   onLogin(user) — { name, initials, email, role, fromApi }
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }) {
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

    // ── Try API ────────────────────────────────────────────────────────
    if (API_ENABLED) {
      try {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        // API must return: { token, user: { name, initials, role, ... } }
        setToken(data.token);
        setRole(data.user.role);
        setUser({ ...data.user, emailDisplay: email });
        setLoading(false);
        onLogin({ ...data.user, emailDisplay: email, fromApi: true });
        return;
      } catch (err) {
        console.warn("[API] Login failed, using fallback:", err.message);
      }
    }

    // ── Static fallback ────────────────────────────────────────────────
    const match = FALLBACK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!match) {
      setErrors({ password: "Invalid email or password" });
      setLoading(false);
      return;
    }
    setTimeout(() => {
      const userObj = { ...match, emailDisplay: email, fromApi: false };
      setToken("fallback-token");
      setRole(match.role);
      setUser(userObj);
      setLoading(false);
      onLogin(userObj);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <Icon name="phone" cls="w-5 h-5 text-white"/>
            </div>
            <div>
              <span className="block text-lg font-bold text-gray-900 leading-tight">Tech</span>
              <span className="block text-lg font-bold text-blue-500 leading-tight -mt-1">for Call</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in to your dashboard</p>
          </div>

          {/* Role hint badges */}
          <div className="flex gap-2 mb-6">
            <span className="flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-1 rounded-full">
              <Icon name="shield" cls="w-3 h-3"/> Admin
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
              <Icon name="user" cls="w-3 h-3"/> Agent
            </span>
            <span className="text-xs text-gray-400 self-center">— same login form</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon name="mail" cls="w-4 h-4"/>
                </span>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="you@techforcall.ai"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-gray-50 outline-none transition-all
                    ${errors.email ? "border-red-300 ring-2 ring-red-100 bg-red-50" : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon name="lock" cls="w-4 h-4"/>
                </span>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 text-sm rounded-xl border bg-gray-50 outline-none transition-all
                    ${errors.password ? "border-red-300 ring-2 ring-red-100 bg-red-50" : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Icon name={showPass ? "eyeOff" : "eye"} cls="w-4 h-4"/>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-sm shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 TechForCall. All rights reserved.
        </p>
      </div>
    </div>
  );
}