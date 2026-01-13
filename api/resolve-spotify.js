// Spotify URL resolver proxy
// Resolves Spotify share URLs to album and artist names

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get URL from query or body
    const spotifyUrl = req.method === 'POST' ? req.body.url : req.query.url;

    if (!spotifyUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    console.log(`Fetching Spotify URL: ${spotifyUrl}`);

    // Fetch the Spotify page
    const response = await fetch(spotifyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.0)'
      }
    });

    const text = await response.text();

    // Extract og:description which has "Artist · Album · Type · Year"
    const match = text.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (match) {
      const parts = match[1].split(' · ');
      if (parts.length >= 2) {
        const artist = parts[0];
        const album = parts[1];

        console.log(`Resolved Spotify URL to: ${album} ${artist}`);

        return res.status(200).json({
          success: true,
          album: album,
          artist: artist,
          searchQuery: `${album} ${artist}`
        });
      }
    }

    // Fallback: try title
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].replace(' | Spotify', '').replace(' - song and lyrics by ', ' ');

      return res.status(200).json({
        success: true,
        album: title,
        artist: '',
        searchQuery: title
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Could not extract album info from Spotify page'
    });

  } catch (error) {
    console.error("Error resolving Spotify URL:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
