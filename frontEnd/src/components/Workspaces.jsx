import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "../contexts/MyContext";
import { Plus, Users, Shield, User, Briefcase, RefreshCw, FolderPlus } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const Workspaces = () => {
  const { token, workspaces, setWorkspaces, currentWorkspace, setCurrentWorkspace, showToast } = useContext(MyContext);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/api/auth/workspaces`, { headers });
      const data = await response.json();
      if (data.success) {
        setWorkspaces(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setLoading(true);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/api/auth/workspaces`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkspaces([...workspaces, data.data]);
        showToast(`Workspace "${newWorkspaceName}" created successfully!`);
        setNewWorkspaceName("");
      } else {
        showToast(data.message || "Failed to create workspace", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Workspace creation error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create workspace form */}
        <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl h-fit">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-blue-500" /> Create Workspace
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Marketing Team"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all text-sm"
              disabled={loading}
            >
              <Plus className="h-4 w-4" /> Create Team
            </button>
          </form>
        </div>

        {/* Workspace List & Switcher */}
        <div className="md:col-span-2 bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" /> Your Workspaces
          </h3>

          {loading && workspaces.length === 0 ? (
            <div className="text-center py-10">
              <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((ws) => {
                const isActive = currentWorkspace?._id === ws._id;
                return (
                  <div
                    key={ws._id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isActive
                        ? "border-indigo-500 bg-indigo-500/5 shadow"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/10"
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{ws.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 uppercase font-bold">
                        <Users className="h-3 w-3" /> {ws.members?.length || 1} Member(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          onClick={() => {
                            setCurrentWorkspace(ws);
                            showToast(`Switched to: ${ws.name}`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 px-3 py-1 bg-indigo-500/10 rounded-lg">
                          Active Team
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspaces;
