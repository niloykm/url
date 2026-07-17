import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../contexts/MyContext";
import QRCode from "qrcode";
import { Link2, Sparkles, Settings, Copy, Share2, MessageSquare, Mail, RefreshCw, FileText, CheckSquare, Plus, AlertCircle, QrCode } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

const UrlShortener = () => {
  const { user, token, activeTab, setActiveTab, showToast } = useContext(MyContext);
  const [tab, setTab] = useState("single"); // single, bulk
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  // Advanced Options
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  
  // Link Preview (OG meta)
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDesc, setPreviewDesc] = useState("");
  const [previewImg, setPreviewImg] = useState("");

  // UTM Builder
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [finalLongUrl, setFinalLongUrl] = useState("");

  // Bulk input
  const [bulkUrlsInput, setBulkUrlsInput] = useState("");
  const [bulkResults, setBulkResults] = useState([]);

  // Result state
  const [loading, setLoading] = useState(false);
  const [shortResult, setShortResult] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");

  // Keyboard shortcut listener: Paste + Enter
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey && (longUrl || bulkUrlsInput)) {
        // Prevent trigger if they are focusing textarea
        if (document.activeElement.tagName === "TEXTAREA" && tab === "bulk") return;
        handleSubmit(e);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [longUrl, customAlias, password, expiresAt, clickLimit, customDomain, previewTitle, previewDesc, previewImg, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, captchaChecked, tab, bulkUrlsInput]);

  // Compute final long url based on UTM parameters
  useEffect(() => {
    if (!longUrl) {
      setFinalLongUrl("");
      return;
    }
    try {
      const url = new URL(longUrl);
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      if (utmTerm) url.searchParams.set("utm_term", utmTerm);
      if (utmContent) url.searchParams.set("utm_content", utmContent);
      setFinalLongUrl(url.toString());
    } catch (e) {
      setFinalLongUrl(longUrl); // Fallback to raw input
    }
  }, [longUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!captchaChecked) {
      showToast("Please verify the CAPTCHA checkbox", "error");
      return;
    }

    if (tab === "single") {
      if (!longUrl) {
        showToast("Destination URL is required", "error");
        return;
      }
      setLoading(true);
      setShortResult(null);
      setQrCodeData("");

      // Advanced options check: Premium Only features if free user
      const isPremiumUser = user && user.tier === "paid";
      if ((password || expiresAt || clickLimit || customDomain || previewTitle) && !isPremiumUser) {
        showToast("Advanced settings require Premium account!", "error");
        setLoading(false);
        setActiveTab("billing");
        return;
      }

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const response = await fetch(`${API_BASE}/create`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            originalUrl: finalLongUrl,
            customUrl: customAlias,
            password: password || undefined,
            expiresAt: expiresAt || undefined,
            clickLimit: clickLimit || undefined,
            customDomain: customDomain || undefined,
            title: previewTitle || undefined,
            description: previewDesc || undefined,
            imageUrl: previewImg || undefined,
          }),
        });

        const data = await response.json();
        if (data.success) {
          const resUrl = data.data.customUrl || data.data.defaultId;
          const generatedShort = `${API_BASE}/${resUrl}`;
          setShortResult(generatedShort);
          showToast("Link shortened successfully!");

          // Generate QR code
          const qr = await QRCode.toDataURL(generatedShort, { width: 300, margin: 2 });
          setQrCodeData(qr);
        } else {
          showToast(data.message || "Failed to shorten URL", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Error connecting to server", "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Bulk processing
      if (!bulkUrlsInput.trim()) {
        showToast("Please paste URLs to shorten", "error");
        return;
      }
      setLoading(true);
      const lines = bulkUrlsInput.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      
      const isPremiumUser = user && user.tier === "paid";
      if (lines.length > 5 && !isPremiumUser) {
        showToast("Free users are limited to 5 URLs in bulk shortening", "error");
        setLoading(false);
        setActiveTab("billing");
        return;
      }

      const urlsPayload = lines.map((l) => {
        // Support custom alias separation like "url,alias"
        const parts = l.split(",");
        return {
          originalUrl: parts[0].trim(),
          customUrl: parts[1] ? parts[1].trim() : undefined,
        };
      });

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const response = await fetch(`${API_BASE}/create-bulk`, {
          method: "POST",
          headers,
          body: JSON.stringify({ urls: urlsPayload }),
        });
        const data = await response.json();
        if (data.success) {
          setBulkResults(data.data);
          showToast(`Processed ${data.data.length} links!`);
        } else {
          showToast(data.message || "Bulk processing failed", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Bulk shorten request failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (err) {
      showToast("Copy failed", "error");
    }
  };

  const downloadBulkCSV = () => {
    let csv = "Original URL,Shortened URL,Status\n";
    bulkResults.forEach((r) => {
      const short = r.success ? `${API_BASE}/${r.shortUrl}` : "";
      csv += `"${r.originalUrl}","${short}","${r.success ? "Success" : r.message}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "bulk_links.csv");
    a.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setTab("single");
            setShortResult(null);
            setBulkResults([]);
          }}
          className={`flex-1 py-4 font-bold text-sm text-center border-b-2 transition-all cursor-pointer ${
            tab === "single"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400"
          }`}
        >
          Single Shortener
        </button>
        <button
          onClick={() => {
            setTab("bulk");
            setShortResult(null);
            setBulkResults([]);
          }}
          className={`flex-1 py-4 font-bold text-sm text-center border-b-2 transition-all cursor-pointer ${
            tab === "bulk"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400"
          }`}
        >
          Bulk Shortener
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl animate-slide-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {tab === "single" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                  Destination URL
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Keyboard: Paste + Enter</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/very-long-link-destination"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Custom Alias / Slug (Optional)</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400 text-sm font-semibold select-none">newrl.ly/</div>
                  <input
                    type="text"
                    placeholder="my-awesome-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full pl-22 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Paste URLs (one per line, optionally append a custom alias with comma)
              </label>
              <textarea
                placeholder="https://example.com/item1&#10;https://example.com/item2,my-custom-alias&#10;https://example.com/item3"
                value={bulkUrlsInput}
                onChange={(e) => setBulkUrlsInput(e.target.value)}
                className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all resize-none"
              />
              {!user && (
                <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  Free tier users can shorten up to 5 links in bulk.
                </div>
              )}
            </div>
          )}

          {/* Settings / Premium Options Button */}
          {tab === "single" && (
            <div>
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Settings className={`h-4 w-4 transition-transform duration-300 ${showOptions ? "rotate-90" : ""}`} />
                Advanced Targeting & Meta overrides
                {(!user || user.tier === "free") && (
                  <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow">
                    Premium
                  </span>
                )}
              </button>

              {showOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Password Protection</label>
                    <input
                      type="password"
                      placeholder="Access Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Expiration Date</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Click Expiry Limit</label>
                    <input
                      type="number"
                      placeholder="e.g. 100 clicks max"
                      value={clickLimit}
                      onChange={(e) => setClickLimit(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Branded Domain</label>
                    <input
                      type="text"
                      placeholder="links.mybrand.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* OG Metadata Block */}
                  <div className="md:col-span-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-2">
                    <h4 className="text-xs font-extrabold text-blue-500 uppercase tracking-wider mb-3">Custom Preview Overrides (Social Sharing Metadata)</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Custom Title (og:title)"
                        value={previewTitle}
                        onChange={(e) => setPreviewTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Custom Description (og:description)"
                        value={previewDesc}
                        onChange={(e) => setPreviewDesc(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <input
                        type="url"
                        placeholder="Custom Image URL (og:image)"
                        value={previewImg}
                        onChange={(e) => setPreviewImg(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* UTM Builder */}
                  <div className="md:col-span-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-2">
                    <h4 className="text-xs font-extrabold text-indigo-500 uppercase tracking-wider mb-3">UTM Campaign Builder</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="UTM Source (e.g. twitter)"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="UTM Medium (e.g. social)"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="UTM Campaign (e.g. launch)"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                    {finalLongUrl && finalLongUrl !== longUrl && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 break-all p-2 bg-slate-100 dark:bg-slate-950/40 rounded border border-slate-200/40 dark:border-slate-800/40 font-mono">
                        Target with UTM: {finalLongUrl}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Simulated CAPTCHA Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
            <input
              type="checkbox"
              id="captcha-check"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="captcha-check" className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1">
              I am not a robot (Abuse Protection Verification)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Processing..." : tab === "single" ? "Shorten Link" : "Shorten Bulk List"}
          </button>
        </form>
      </div>

      {/* Result presentation */}
      {shortResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-2xl backdrop-blur-xl animate-slide-in grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Shortened Link:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shortResult}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold text-sm outline-none"
              />
              <button
                onClick={() => handleCopy(shortResult)}
                className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer transition-colors"
                title="Copy Link"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>

            {/* Sharing */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Share Link:</span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortResult)}&text=Check%20out%20this%20link!`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg> Twitter / X
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shortResult)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <MessageSquare className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href={`mailto:?subject=Shortened%20Link&body=${encodeURIComponent(shortResult)}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </div>
          </div>

          {/* QR Code display */}
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-150 dark:border-slate-800">
            {qrCodeData ? (
              <>
                <img src={qrCodeData} alt="Link QR Code" className="h-32 w-32 object-contain" />
                <a
                  href={qrCodeData}
                  download="qrcode.png"
                  className="flex items-center gap-1 text-[11px] text-blue-500 font-bold hover:underline mt-2 cursor-pointer"
                >
                  <QrCode className="h-3 w-3" /> Download QR Code
                </a>
              </>
            ) : (
              <span className="text-xs text-slate-400">Loading QR code...</span>
            )}
          </div>
        </div>
      )}

      {/* Bulk Results List */}
      {bulkResults.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-slide-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" /> Shortened Results ({bulkResults.length})
            </h3>
            <button
              onClick={downloadBulkCSV}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">Original URL</th>
                  <th className="p-3">Short Link</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {bulkResults.map((r, idx) => {
                  const shortened = r.success ? `${API_BASE}/${r.shortUrl}` : "";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                      <td className="p-3 truncate max-w-xs font-medium text-slate-800 dark:text-slate-200">{r.originalUrl}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                        {r.success ? shortened : <span className="text-red-500 text-xs">{r.message}</span>}
                      </td>
                      <td className="p-3 text-right">
                        {r.success && (
                          <button
                            onClick={() => handleCopy(shortened)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
