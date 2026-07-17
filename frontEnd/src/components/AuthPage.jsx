import React, { useState, useContext } from "react";
import { MyContext } from "../contexts/MyContext";
import { Mail, Lock, User, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const AuthPage = () => {
  const { setToken, setUser, showToast, setActiveTab } = useContext(MyContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        showToast(isLogin ? `Welcome back, ${data.user.name || "User"}!` : "Account created successfully!");
        setActiveTab("shortener");
      } else {
        showToast(data.message || "Authentication failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Simulation
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Simulate OAuth token payload received from Google Client library
      const payload = {
        email: email || "sandbox.user@gmail.com",
        name: name || "Google Sandbox User",
        googleId: `g_sim_${Date.now()}`,
      };

      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        showToast(`Signed in with Google as ${data.user.name}`);
        setActiveTab("shortener");
      } else {
        showToast(data.message || "Google Authentication failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Google Authentication error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-slide-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          {isLogin ? "Welcome Back" : "Get Started"} <Sparkles className="h-6 w-6 text-blue-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          {isLogin ? "Sign in to access premium links & analytics" : "Create an account to track your urls"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5"
        disabled={loading}
      >
        {/* Simple Google SVG Icon */}
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#ea4335"
            d="M12 5.04c1.67 0 3.2.58 4.4 1.71l3.29-3.29A11.96 11.96 0 0 0 12 0C7.3 0 3.25 2.72 1.3 6.69l3.87 3a7.16 7.16 0 0 1 6.83-4.65z"
          />
          <path
            fill="#4285f4"
            d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.47h6.46a5.53 5.53 0 0 1-2.4 3.63v3l3.87 3a11.94 11.94 0 0 0 3.56-9.75z"
          />
          <path
            fill="#fbbc05"
            d="M5.17 9.69a7.17 7.17 0 0 1 0 4.62l-3.87 3a11.96 11.96 0 0 0 0-10.62z"
          />
          <path
            fill="#34a853"
            d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.87-3a7.16 7.16 0 0 1-10.92-3.74l-3.87 3A11.96 11.96 0 0 0 12 24z"
          />
        </svg>
        Sign in with Google
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        {isLogin ? "New to NewRL?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline font-bold focus:outline-none cursor-pointer"
        >
          {isLogin ? "Create account" : "Sign in instead"}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
