import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "../contexts/MyContext";
import { Search, Edit3, Trash2, Eye, Play, Pause, Copy, CheckSquare, Square, FileText, ChevronRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const Dashboard = () => {
  const { token, currentWorkspace, urls, setUrls, setActiveTab, setSelectedUrlForAnalytics, showToast } = useContext(MyContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  
  // Edit Modal States
  const [editingUrl, setEditingUrl] = useState(null);
  const [editDestUrl, setEditDestUrl] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editClickLimit, setEditClickLimit] = useState("");
  const [editCustomDomain, setEditCustomDomain] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");

  useEffect(() => {
    fetchUrls();
  }, [currentWorkspace]);

  const fetchUrls = async () => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const wsParam = currentWorkspace ? `?workspaceId=${currentWorkspace._id}` : "";
    try {
      const response = await fetch(`${API_BASE}/all${wsParam}`, { headers });
      const data = await response.json();
      if (data.success) {
        setUrls(data.data);
      } else {
        showToast(data.message || "Failed to load links", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link copied!");
    } catch (err) {
      showToast("Copy failed", "error");
    }
  };

  const handleToggleStatus = async (url) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const slug = url.customUrl || url.defaultId;
    try {
      const response = await fetch(`${API_BASE}/${slug}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ isActive: !url.isActive }),
      });
      const data = await response.json();
      if (data.success) {
        setUrls(urls.map((u) => (u._id === url._id ? { ...u, isActive: !u.isActive } : u)));
        showToast(url.isActive ? "Link paused" : "Link activated");
      } else {
        showToast(data.message || "Failed to update link status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle link status", "error");
    }
  };

  const handleDelete = async (url) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const slug = url.customUrl || url.defaultId;
    try {
      const response = await fetch(`${API_BASE}/${slug}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setUrls(urls.filter((u) => u._id !== url._id));
        showToast("Link deleted successfully");
      } else {
        showToast(data.message || "Failed to delete link", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete link", "error");
    }
  };

  const handleOpenEdit = (url) => {
    setEditingUrl(url);
    setEditDestUrl(url.originalUrl);
    setEditPassword("");
    setEditExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().substring(0, 16) : "");
    setEditClickLimit(url.clickLimit || "");
    setEditCustomDomain(url.customDomain || "");
    setEditTitle(url.title || "");
    setEditDesc(url.description || "");
    setEditImg(url.imageUrl || "");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const slug = editingUrl.customUrl || editingUrl.defaultId;
    try {
      const response = await fetch(`${API_BASE}/${slug}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          originalUrl: editDestUrl,
          password: editPassword || undefined,
          expiresAt: editExpiresAt || null,
          clickLimit: editClickLimit ? parseInt(editClickLimit) : null,
          customDomain: editCustomDomain || null,
          title: editTitle || null,
          description: editDesc || null,
          imageUrl: editImg || null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setUrls(urls.map((u) => (u._id === editingUrl._id ? data.data : u)));
        showToast("Link updated successfully");
        setEditingUrl(null);
      } else {
        showToast(data.message || "Failed to update link", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during update", "error");
    }
  };

  // Bulk operations
  const toggleSelectUrl = (urlId) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(urlId)) {
        next.delete(urlId);
      } else {
        next.add(urlId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUrls.size === filteredUrls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(filteredUrls.map((u) => u._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUrls.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUrls.size} links?`)) return;

    const selectedSlugs = urls
      .filter((u) => selectedUrls.has(u._id))
      .map((u) => u.customUrl || u.defaultId);

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/bulk-delete`, {
        method: "POST",
        headers,
        body: JSON.stringify({ identifiers: selectedSlugs }),
      });
      const data = await response.json();
      if (data.success) {
        setUrls(urls.filter((u) => !selectedUrls.has(u._id)));
        setSelectedUrls(new Set());
        showToast("Selected links deleted successfully");
      } else {
        showToast(data.message || "Failed to bulk delete links", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Bulk delete failed", "error");
    }
  };

  // Filter links
  const filteredUrls = urls.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.originalUrl.toLowerCase().includes(q) ||
      (u.customUrl && u.customUrl.toLowerCase().includes(q)) ||
      u.defaultId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search links by slug or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Bulk Action Buttons */}
        {selectedUrls.size > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {selectedUrls.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shadow-red-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Grid of Link Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUrls.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/10">
            <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No links found matching your criteria.</p>
          </div>
        ) : (
          filteredUrls.map((url) => {
            const shortKey = url.customUrl || url.defaultId;
            const fullShort = `${API_BASE}/${shortKey}`;
            const isSelected = selectedUrls.has(url._id);

            return (
              <div
                key={url._id}
                className={`p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/5 shadow-lg"
                    : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Checkbox selector */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => toggleSelectUrl(url._id)}
                    className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Shortened URL */}
                    <div className="flex items-center gap-2">
                      <a
                        href={fullShort}
                        target="_blank"
                        rel="noreferrer"
                        className="font-extrabold text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {fullShort}
                      </a>
                      <button
                        onClick={() => handleCopy(fullShort)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Original Destination */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md mt-1 font-medium">
                      {url.originalUrl}
                    </p>

                    {/* Meta stats badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {url.clicks || 0} clicks
                      </span>
                      {url.expiresAt && (
                        <span className="text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          Expires: {new Date(url.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      {url.password && (
                        <span className="text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase">
                          Password protected
                        </span>
                      )}
                      {!url.isActive && (
                        <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5 w-full md:w-auto justify-end border-t border-slate-100 dark:border-slate-800/80 md:border-t-0 pt-3 md:pt-0 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedUrlForAnalytics(shortKey);
                      setActiveTab("analytics");
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="View Analytics"
                  >
                    <Eye className="h-4 w-4" />
                    Stats
                  </button>

                  <button
                    onClick={() => handleToggleStatus(url)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      url.isActive
                        ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    }`}
                    title={url.isActive ? "Pause Link" : "Activate Link"}
                  >
                    {url.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {url.isActive ? "Pause" : "Resume"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(url)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-colors"
                    title="Edit Link Settings"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(url)}
                    className="p-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl cursor-pointer transition-colors"
                    title="Delete Link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal Popup */}
      {editingUrl && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUrl(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Edit Link Settings</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Destination URL</label>
                <input
                  type="url"
                  value={editDestUrl}
                  onChange={(e) => setEditDestUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Update Access Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged / remove"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Click limit</label>
                  <input
                    type="number"
                    value={editClickLimit}
                    onChange={(e) => setEditClickLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Custom/Branded Domain</label>
                <input
                  type="text"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
              </div>

              {/* Advanced social overrides */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1 space-y-3">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider">Social Preview Customizations</h4>
                <input
                  type="text"
                  placeholder="Custom Title override"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Custom Description override"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
                <input
                  type="url"
                  placeholder="Custom Image/Thumbnail URL override"
                  value={editImg}
                  onChange={(e) => setEditImg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
