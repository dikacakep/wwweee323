export default async function handler(req, res) {
  try {

    const SECRET = process.env.API_SECRET_TOKEN;
    const ALLOWED_ORIGIN = process.env.API_ALLOWED_ORIGIN || "";

    const origin = req.headers.origin || req.headers.referer || "";
    if (ALLOWED_ORIGIN) {

      if (origin && !origin.startsWith(ALLOWED_ORIGIN)) {
        return res.status(403).json({ error: "Forbidden (origin)" });
      }
    }

    if (!global.__stockApiLastCalled) global.__stockApiLastCalled = 0;
    const now = Date.now();
    if (now - global.__stockApiLastCalled < 1000) {
      await new Promise((r) => setTimeout(r, 500));
    }
    global.__stockApiLastCalled = Date.now();

    const apiUrl = "https://plantsvsbrainrots.com/api/latest-message";
    const fetchOptions = {
      headers: {
        "Accept": "application/json",
      },
    };


    const response = await fetch(apiUrl, fetchOptions);
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("External API fetch failed:", response.status, text);
      throw new Error(`Failed to fetch stock data (status ${response.status})`);
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching stock:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
