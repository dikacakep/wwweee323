export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    if (token !== process.env.NEXT_PUBLIC_API_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const apiUrl = "https://plantsvsbrainrots.com/api/latest-message";
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch stock data");

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching stock:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

