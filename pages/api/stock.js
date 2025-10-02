export default async function handler(req, res) {
  try {
    // Restrict to GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    // Use NEXT_PUBLIC_API_TOKEN as requested
    if (token !== process.env.NEXT_PUBLIC_API_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiUrl = 'https://plantsvsbrainrots.com/api/latest-message';

    // Add timeout to fetch (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(apiUrl, {
        signal: controller.signal,
      });
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      throw new Error(`Failed to fetch from external API: ${fetchErr.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.error('External API response not OK:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('External API response:', data); // Log response for debugging

    // Validate response structure
    if (!Array.isArray(data) || data.length === 0 || !data[0].embeds || data[0].embeds.length === 0) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format from external API');
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://plantvsbrainrots.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');

    // Cache response for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (err) {
    console.error('Handler error:', {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
