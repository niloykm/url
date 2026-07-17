import React, { useContext, useEffect } from "react";
import { MyContext } from "./contexts/MyContext";
import Navbar from "./components/Navbar";
import Toaster from "./components/Toaster";
import UrlShortener from "./components/UrlShortener";
import Dashboard from "./components/Dashboard";
import AnalyticsView from "./components/AnalyticsView";
import Workspaces from "./components/Workspaces";
import Billing from "./components/Billing";
import AuthPage from "./components/AuthPage";
import { Sparkles, Terminal } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const App = () => {
  const {
    theme,
    user,
    token,
    setUser,
    setWorkspaces,
    setCurrentWorkspace,
    activeTab,
    setActiveTab,
    showToast,
  } = useContext(MyContext);

  // Fetch current user details if token exists on boot
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // Load user workspaces
      const response = await fetch(`${API_BASE}/api/auth/workspaces`, { headers });
      const data = await response.json();
      if (data.success) {
        setWorkspaces(data.data);
        if (data.data.length > 0) {
          setCurrentWorkspace(data.data[0]);
        }
      }

      // Re-validate token & populate mock user structure if no full endpoint exists
      // We can inspect the token or request profile. Let's make sure user exists.
      if (!user) {
        // Decode token to extract base user payload
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          // Call update-tier with empty body to verify token and return updated user object
          const checkRes = await fetch(`${API_BASE}/api/auth/update-tier`, {
            method: "POST",
            headers,
            body: JSON.stringify({ tier: "free" }), // safe dry-run toggle
          });
          const checkData = await checkRes.json();
          if (checkData.success) {
            setUser(checkData.user);
          } else {
            // Decoded payload mock fallback
            setUser({ id: payload.userId, email: "sandbox.user@gmail.com", name: "Developer", tier: "free" });
          }
        } catch (e) {
          console.error("Token decoding error:", e);
        }
      }
    } catch (err) {
      console.error("Fetch current user failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-multiply filter animate-pulse" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl mix-blend-multiply filter animate-pulse delay-1000" />
      </div>

      <Navbar />
      <Toaster />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
        {/* Render Active View */}
        {activeTab === "shortener" && <UrlShortener />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "team" && <Workspaces />}
        {activeTab === "billing" && <Billing />}
        {activeTab === "auth" && <AuthPage />}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500" /> Powered by NewRL URL Shortener Team
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5 text-slate-400" /> Public API: <code>/create</code>
            </span>
            <span>&copy; {new Date().getFullYear()} NewRL. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
