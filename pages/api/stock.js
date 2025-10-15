export default async function handler(req, res) {
  try {
    console.log("[DEBUG] Origin:", req.headers.origin);
    console.log("[DEBUG] Referer:", req.headers.referer);
    console.log("[DEBUG] Sec-Fetch-Site:", req.headers["sec-fetch-site"]);
    console.log("[DEBUG] Allowed Origin:", process.env.API_ALLOWED_ORIGIN);

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

    const response = await fetch("https://plantsvsbrainrots.com/api/latest-message");
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
