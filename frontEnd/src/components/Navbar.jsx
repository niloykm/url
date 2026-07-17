import React, { useContext } from "react";
import { MyContext } from "../contexts/MyContext";
import { Link2, LayoutDashboard, BarChart3, Users, CreditCard, Sun, Moon, LogIn, LogOut } from "lucide-react";
import logo from "../assets/favicon.png";

const Navbar = () => {
  const {
    theme,
    setTheme,
    user,
    setToken,
    setUser,
    activeTab,
    setActiveTab,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    showToast,
  } = useContext(MyContext);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setCurrentWorkspace(null);
    setActiveTab("shortener");
    showToast("Logged out successfully");
  };

  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("shortener")}>
              <img src={logo} alt="NewRL" className="h-8 w-8 bg-blue-500 rounded-lg p-1.5 shadow-lg shadow-blue-500/30" />
              <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                NewRL
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab("shortener")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "shortener"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Link2 className="h-4 w-4" />
                Shortener
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    showToast("Please log in to access the Dashboard", "info");
                    setActiveTab("auth");
                  } else {
                    setActiveTab("dashboard");
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              {user && (
                <>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === "analytics"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </button>

                  <button
                    onClick={() => setActiveTab("team")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === "team"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Workspaces
                  </button>

                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === "billing"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pricing
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Switcher */}
            {user && workspaces.length > 0 && (
              <div className="relative">
                <select
                  value={currentWorkspace?._id || ""}
                  onChange={(e) => {
                    const ws = workspaces.find((w) => w._id === e.target.value);
                    setCurrentWorkspace(ws || null);
                    showToast(`Switched workspace to: ${ws?.name}`);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {workspaces.map((ws) => (
                    <option key={ws._id} value={ws._id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500">
                    {user.tier === "paid" ? "Premium" : "Free Tier"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("auth")}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
