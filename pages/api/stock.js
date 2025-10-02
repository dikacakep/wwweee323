import { RateLimit } from 'next-rate-limit';

// Initialize rate limiter: max 10 requests per minute per IP
const limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute
});

export default async function handler(req, res) {
  // Apply rate limiting
  const { allowed, error } = limiter(req, res);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Restrict to GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    // Keep using NEXT_PUBLIC_API_TOKEN as requested
    if (token !== process.env.NEXT_PUBLIC_API_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiUrl = 'https://plantsvsbrainrots.com/api/latest-message';

    // Add timeout to fetch (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!Array.isArray(data) || data.length === 0 || !data[0].embeds || data[0].embeds.length === 0) {
      throw new Error('Invalid data format from external API');
    }

    // Set CORS headers (adjust origin as needed)
    res.setHeader('Access-Control-Allow-Origin', 'https://plantvsbrainrots.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');

    // Cache response for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching stock:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
