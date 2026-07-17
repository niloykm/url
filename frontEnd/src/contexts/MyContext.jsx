import React, { createContext, useEffect, useState } from "react";

export const MyContext = createContext();

export const MyContextProvider = (props) => {
  // Theme state: dark by default for sleek aesthetic
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState("shortener"); // shortener, dashboard, analytics, team, billing
  const [selectedUrlForAnalytics, setSelectedUrlForAnalytics] = useState(null);
  const [urls, setUrls] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const value = {
    theme,
    setTheme,
    user,
    setUser,
    token,
    setToken,
    workspaces,
    setWorkspaces,
    currentWorkspace,
    setCurrentWorkspace,
    activeTab,
    setActiveTab,
    selectedUrlForAnalytics,
    setSelectedUrlForAnalytics,
    urls,
    setUrls,
    toasts,
    showToast,
  };

  return (
    <MyContext.Provider value={value}>{props.children}</MyContext.Provider>
  );
};
