import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../contexts/MyContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from "recharts";
import { BarChart3, FileSpreadsheet, Globe2, Laptop, Compass, ArrowLeft, RefreshCw, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const COLORS = ["#38bdf8", "#818cf8", "#fb7185", "#34d399", "#fbbf24", "#a78bfa"];

const AnalyticsView = () => {
  const { token, selectedUrlForAnalytics, setSelectedUrlForAnalytics, urls, showToast } = useContext(MyContext);
  const [activeSlug, setActiveSlug] = useState(selectedUrlForAnalytics || "");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeSlug) {
      fetchAnalytics(activeSlug);
    } else if (urls.length > 0) {
      const firstSlug = urls[0].customUrl || urls[0].defaultId;
      setActiveSlug(firstSlug);
      fetchAnalytics(firstSlug);
    }
  }, [activeSlug, urls]);

  const fetchAnalytics = async (slug) => {
    setLoading(true);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/analytics/${slug}`, { headers });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        showToast(data.message || "Failed to load analytics", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!activeSlug) return;
    window.open(`${API_BASE}/analytics/${activeSlug}/export?token=${token}`, "_blank");
    showToast("Exporting CSV log...");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header filter selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl animate-slide-in">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setSelectedUrlForAnalytics(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 cursor-pointer"
            title="Clear selection"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select link to inspect</label>
            <select
              value={activeSlug}
              onChange={(e) => setActiveSlug(e.target.value)}
              className="bg-transparent border-0 font-bold text-slate-800 dark:text-slate-200 text-sm focus:ring-0 cursor-pointer py-0 pl-0 mt-0.5"
            >
              {urls.length === 0 ? (
                <option value="">No links available</option>
              ) : (
                urls.map((u) => {
                  const key = u.customUrl || u.defaultId;
                  return (
                    <option key={u._id} value={key} className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {`newrl.ly/${key} (${u.originalUrl.substring(0, 30)}...)`}
                    </option>
                  );
                })
              )}
            </select>
          </div>
        </div>

        {activeSlug && (
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-colors shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV Data
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Fetching analytics data...</p>
        </div>
      ) : stats ? (
        <div className="space-y-6 animate-slide-in">
          {/* Main counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Click Counts</span>
              <h4 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{stats.totalClicks}</h4>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Country</span>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 truncate">
                {stats.countries?.[0]?.name || "None"}
              </h4>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Referrer</span>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 truncate">
                {stats.referrers?.[0]?.name || "None"}
              </h4>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Browser</span>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 truncate">
                {stats.browsers?.[0]?.name || "None"}
              </h4>
            </div>
          </div>

          {/* Time Series Area Chart */}
          <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-500" /> Click Activity Time-Series (Last 14 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timeSeries}>
                  <defs>
                    <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      color: "#f8fafc",
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorClick)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device and Browser Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geo Breakdown */}
            <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-80">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Globe2 className="h-4.5 w-4.5 text-indigo-500" /> Geographic breakdown
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {stats.countries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No geographic data logged.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.countries.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-950 dark:text-slate-100">{c.count}</span>
                          <span className="text-[10px] text-slate-400">
                            ({Math.round((c.count / stats.totalClicks) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Referrer Breakdown */}
            <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-80">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-sky-500" /> Referrers / Sources
              </h3>
              <div className="flex-1 overflow-y-auto pr-1">
                {stats.referrers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No referrer data logged.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.referrers.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{ref.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-950 dark:text-slate-100">{ref.count}</span>
                          <span className="text-[10px] text-slate-400">
                            ({Math.round((ref.count / stats.totalClicks) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Device breakdown Bar Chart */}
            <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Laptop className="h-4.5 w-4.5 text-indigo-500" /> Devices
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.devices}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browsers Pie Chart */}
            <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-rose-500" /> Browsers
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.browsers}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "10px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.browsers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10">
          <BarChart3 className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Select a shortened link above to display analytics charts.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
