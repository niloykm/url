import { findByIdentifier } from "../services/url.service.js";
import Analytics from "../models/analytics.model.js";
import URLModel from "../models/url.model.js";
import bcrypt from "bcryptjs";
import UAParser from "ua-parser-js";
import mongoose from "mongoose";

const isDbConnected = () => mongoose.connection.readyState === 1;

export const redirectUrl = async (req, res) => {
  const { customUrl } = req.params;
  const { password, preview } = req.query; // Accept password in query or preview parameter

  try {
    const url = await findByIdentifier(customUrl);
    if (!url) {
      return res.status(404).send(`
        <html>
          <head>
            <title>URL Not Found | NewRL</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 12px; text-align: center; border: 1px solid #334155; }
              h1 { color: #f43f5e; margin: 0 0 1rem; }
              a { color: #38bdf8; text-decoration: none; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>404 - Link Not Found</h1>
              <p>The shortened link you are trying to reach does not exist or has been deleted.</p>
              <a href="/">Go to NewRL Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // 1. Check if active
    if (!url.isActive) {
      return res.status(403).send(`
        <html>
          <head>
            <title>Link Paused | NewRL</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 12px; text-align: center; border: 1px solid #334155; }
              h1 { color: #eab308; margin: 0 0 1rem; }
              a { color: #38bdf8; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Paused</h1>
              <p>This shortened link has been temporarily disabled by its owner.</p>
              <a href="/">Go to NewRL Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // 2. Check Expiration Date
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired | NewRL</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 12px; text-align: center; border: 1px solid #334155; }
              h1 { color: #ef4444; margin: 0 0 1rem; }
              a { color: #38bdf8; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Expired</h1>
              <p>This shortened link has expired on ${new Date(url.expiresAt).toLocaleString()}.</p>
              <a href="/">Go to NewRL Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // 3. Check Click Limit
    if (url.clickLimit && url.clicks >= url.clickLimit) {
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Limit Reached | NewRL</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 12px; text-align: center; border: 1px solid #334155; }
              h1 { color: #ef4444; margin: 0 0 1rem; }
              a { color: #38bdf8; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Limit Reached</h1>
              <p>This shortened link has reached its maximum click limit.</p>
              <a href="/">Go to NewRL Home</a>
            </div>
          </body>
        </html>
      `);
    }

    // 4. Password Protection Challenge
    if (url.password) {
      let isVerified = false;
      if (password) {
        isVerified = await bcrypt.compare(password, url.password);
      }

      if (!isVerified) {
        // Return a beautiful HTML password form
        return res.status(401).send(`
          <html>
            <head>
              <title>Password Protected Link | NewRL</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 2.5rem; border-radius: 16px; text-align: center; border: 1px solid #334155; max-width: 400px; width: 90%; }
                h1 { color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.5rem; }
                p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
                input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; margin-bottom: 1rem; box-sizing: border-box; }
                button { width: 100%; padding: 0.75rem; border-radius: 8px; border: none; background: #38bdf8; color: #0f172a; font-weight: 600; cursor: pointer; }
                button:hover { background: #0ea5e9; }
                .error { color: #ef4444; font-size: 0.85rem; margin-top: 0.5rem; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Password Required</h1>
                <p>This link is password-protected. Enter the password to proceed.</p>
                <form method="GET">
                  <input type="password" name="password" placeholder="Enter password" required autofocus />
                  <button type="submit">Unlock & Access</button>
                  ${password ? '<div class="error">Incorrect password. Please try again.</div>' : ""}
                </form>
              </div>
            </body>
          </html>
        `);
      }
    }

    // 5. Open Graph Metadata pass-through or Preview Page Check
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot/i.test(userAgent);
    const showPreview = preview === "true" || (!isBot && url.title); // Show preview if explicitly requested or if title custom preview settings exist

    if (isBot || showPreview) {
      const pageTitle = url.title || "Shared Link | NewRL";
      const pageDesc = url.description || "Click to visit this shortened link via NewRL URL Shortener.";
      const pageImg = url.imageUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=500";

      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${pageTitle}</title>
            <meta name="description" content="${pageDesc}">
            
            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="website">
            <meta property="og:title" content="${pageTitle}">
            <meta property="og:description" content="${pageDesc}">
            <meta property="og:image" content="${pageImg}">
            <meta property="og:url" content="${req.protocol}://${req.get("host")}/${customUrl}">

            <!-- Twitter -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${pageTitle}">
            <meta name="twitter:description" content="${pageDesc}">
            <meta name="twitter:image" content="${pageImg}">

            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #1e293b; padding: 2rem; border-radius: 16px; border: 1px solid #334155; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
              .thumbnail { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #475569; }
              h1 { font-size: 1.4rem; margin: 0 0 0.5rem; color: #f8fafc; }
              p { font-size: 0.9rem; color: #94a3b8; margin: 0 0 1.5rem; line-height: 1.4; }
              .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #38bdf8; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
              .btn:hover { background: #0ea5e9; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${pageImg}" class="thumbnail" alt="Preview Thumbnail" />
              <h1>${pageTitle}</h1>
              <p>${pageDesc}</p>
              <a href="${url.originalUrl}" class="btn" id="redirect-btn">Proceed to Destination</a>
              <p style="font-size: 0.75rem; margin-top: 1rem; color: #64748b;">You will be redirected to: <br/>${url.originalUrl}</p>
            </div>
            <script>
              // If not manually requesting a preview, automatically proceed after 2 seconds
              if ("${preview}" !== "true") {
                setTimeout(() => {
                  window.location.href = "${url.originalUrl}";
                }, 2500);
              }
            </script>
          </body>
        </html>
      `);
    }

    // 6. Log Analytics and click-count update
    try {
      // Parse User-Agent
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || "Unknown";
      const device = parser.getDevice().type || "Desktop";
      const os = parser.getOS().name || "Unknown";
      
      // Parse UTM Parameters from request referers/query
      const urlObj = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
      const utm_source = urlObj.searchParams.get("utm_source") || undefined;
      const utm_medium = urlObj.searchParams.get("utm_medium") || undefined;
      const utm_campaign = urlObj.searchParams.get("utm_campaign") || undefined;
      const utm_term = urlObj.searchParams.get("utm_term") || undefined;
      const utm_content = urlObj.searchParams.get("utm_content") || undefined;

      // Simulated country list for local testing
      const countries = ["United States", "United Kingdom", "Canada", "Bangladesh", "Germany", "France", "Japan", "India"];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];

      if (isDbConnected()) {
        // Record click
        const click = new Analytics({
          urlId: url._id,
          ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          country: randomCountry, // Simulated geography for this sandbox
          device,
          browser,
          os,
          referrer: req.get("Referrer") || "Direct",
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
        });
        await click.save();

        // Increment clicks
        await URLModel.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
      } else {
        // In-memory stats update
        url.clicks = (url.clicks || 0) + 1;
      }
    } catch (e) {
      console.error("Failed to log analytics:", e);
    }

    // 7. Perform Redirect
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error: ", error);
    return res.status(500).send("Server error");
  }
};
