import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../contexts/MyContext";
import { Check, ShieldAlert, CreditCard, Sparkles, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const Billing = () => {
  const { user, token, setUser, showToast } = useContext(MyContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for callback parameters from Stripe Checkout / Simulated checkout URL redirection
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const sessionId = params.get("session_id");

    if (success === "true" && sessionId) {
      verifyUpgrade(sessionId);
    }
  }, []);

  const verifyUpgrade = async (sessionId) => {
    setLoading(true);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/api/payment/verify-session`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      if (data.success) {
        // Upgrade current user locally
        setUser((prev) => ({ ...prev, tier: "paid" }));
        showToast("Success! Your subscription has been activated.", "success");
        // Clear search query param
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        showToast(data.message || "Failed to verify transaction", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error verifying checkout session", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please log in to upgrade", "error");
      return;
    }
    setLoading(true);

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/api/payment/create-session`, {
        method: "POST",
        headers,
      });
      const data = await response.json();
      if (data.success && data.url) {
        // Redirect to Stripe checkout page (or mock success URL)
        window.location.href = data.url;
      } else {
        showToast(data.message || "Failed to launch Stripe Checkout", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Payment checkout launch error", "error");
    } finally {
      setLoading(false);
    }
  };

  const featuresFree = [
    "Basic URL Shortening",
    "Duplicate check detection",
    "QR code for every link",
    "Standard URL validations",
    "Max 5 bulk URLs batch size",
  ];

  const featuresPremium = [
    "Everything in Free Tier",
    "Advanced Click Analytics (Devices, Browsers, Countries, referrers, timeline)",
    "Password protection & click-limit expirations",
    "Branded Domains integration (Bring-your-own-domain)",
    "Custom Social metadata overrides (og:title, image, desc)",
    "Unlimited bulk shortening batch sizes",
    "CSV click logs data export",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-slide-in">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          Upgrade to Premium <Sparkles className="h-6 w-6 text-blue-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Unlock custom domains, campaign targeting, metadata overrides, click limits, and deep analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white/80 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Free Tier Plan</h3>
            <p className="text-slate-400 text-xs mt-1">Perfect for simple redirects & standard links</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">$0</span>
              <span className="text-slate-400 text-xs"> / forever</span>
            </div>

            <ul className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              {featuresFree.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                  <Check className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              disabled
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider select-none"
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="relative p-6 rounded-2xl border-2 border-blue-500/80 bg-white/95 dark:bg-slate-900 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-widest shadow">
            Recommended
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Premium Plan <Sparkles className="h-4 w-4 text-blue-500" />
            </h3>
            <p className="text-slate-400 text-xs mt-1">Supercharged sharing for creators & marketers</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">$9.99</span>
              <span className="text-slate-400 text-xs"> / month</span>
            </div>

            <ul className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              {featuresPremium.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                  <Check className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {user?.tier === "paid" ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold uppercase tracking-wider select-none flex items-center justify-center gap-1.5"
              >
                <Check className="h-4.5 w-4.5" /> Premium Active
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <CreditCard className="h-4.5 w-4.5" />}
                {loading ? "Launching Checkout..." : "Upgrade Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
