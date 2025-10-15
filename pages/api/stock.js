// pages/api/stock.js
export default async function handler(req, res) {
  try {
    const ALLOWED_ORIGIN = process.env.API_ALLOWED_ORIGIN || "";
    const origin = (req.headers.origin || req.headers.referer || "").toString();
    const secFetchSite = (req.headers["sec-fetch-site"] || "").toString();

    if (ALLOWED_ORIGIN) {
      const normalizedAllowed = ALLOWED_ORIGIN.replace(/\/+$/, "");
      const normalizedOrigin = origin.replace(/\/+$/, "");

      const isSameOriginHeader = !!origin && normalizedOrigin.startsWith(normalizedAllowed);
      const isSameSiteFetch = secFetchSite === "same-origin" || secFetchSite === "same-site";
      const refererAllowed = !!req.headers.referer && req.headers.referer.startsWith(normalizedAllowed);

      if (!isSameOriginHeader && !isSameSiteFetch && !refererAllowed) {
        res.setHeader("Content-Type", "application/json");
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (!global.__stockApiLastCalled) global.__stockApiLastCalled = 0;
    const now = Date.now();
    const MIN_INTERVAL = 800; // ms
    if (now - global.__stockApiLastCalled < MIN_INTERVAL) {
      await new Promise((r) => setTimeout(r, 300));
    }
    global.__stockApiLastCalled = Date.now();

    const SECRET = process.env.API_SECRET_TOKEN || "";
    const apiUrl = "https://plantsvsbrainrots.com/api/latest-message";

    const fetchOptions = {
      headers: {
        Accept: "application/json",
      },
    };

    if (SECRET) {
      fetchOptions.headers.Authorization = `Bearer ${SECRET}`;
    }

    const response = await fetch(apiUrl, fetchOptions);
    if (!response.ok) {
      console.error("External API fetch failed:", response.status);
      return res.status(502).json({ error: "Bad Gateway" });
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    if (ALLOWED_ORIGIN) {
      res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
      res.setHeader("Vary", "Origin");
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/stock:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
