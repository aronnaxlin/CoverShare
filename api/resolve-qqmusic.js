// QQ Music URL resolver proxy
// Resolves QQ Music share URLs to album and artist names

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
    const qqUrl = req.method === 'POST' ? req.body.url : req.query.url;

    if (!qqUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Extract URL from text if needed (handles "Artist Name https://..." format)
    const urlMatch = qqUrl.match(/(https?:\/\/[^\s]+)/);
    const cleanUrl = urlMatch ? urlMatch[0] : qqUrl;

    // URL - check for short link or direct link
    let finalUrl = cleanUrl;
    let songMid = null;

    // Matches direct link: songDetail/0029CVxG4QngaW
    const directMatch = qqUrl.match(/songDetail\/([A-Za-z0-9]+)/);

    if (directMatch) {
        songMid = directMatch[1];
    } else {
        // Try fetching to see if it redirects (for short links like c6.y.qq.com)
        console.log(`Fetching QQ Music URL to resolve redirect: ${cleanUrl}`);
        try {
            // Use GET to get the full response body - songmid may be in HTML, not URL
            const fetchRes = await fetch(cleanUrl, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
                }
            });
            finalUrl = fetchRes.url;
            console.log(`Redirected to: ${finalUrl}`);

            // Try extracting from final URL first
            const redirectMatch = finalUrl.match(/songDetail\/([A-Za-z0-9]+)/) || finalUrl.match(/songmid=([A-Za-z0-9]+)/);
            if (redirectMatch) {
                songMid = redirectMatch[1];
            } else {
                // URL doesn't have songmid - check HTML body
                const htmlBody = await fetchRes.text();
                const bodyMatch = htmlBody.match(/songmid[=:]["']?([A-Za-z0-9]+)/i);
                if (bodyMatch) {
                    songMid = bodyMatch[1];
                    console.log(`Found songmid in HTML body: ${songMid}`);
                }
            }
        } catch (e) {
            console.error("Error resolving redirect:", e);
        }
    }

    if (!songMid) {
      return res.status(400).json({ error: 'Invalid QQ Music URL format or could not resolve short link' });
    }
    console.log(`Extracted QQ Music song_mid: ${songMid}`);

    // Build API request data
    const apiData = {
      comm: { ct: 24, cv: 0 },
      songinfo: {
        method: "get_song_detail_yqq",
        param: { song_mid: songMid },
        module: "music.pf_song_detail_svr"
      }
    };

    const apiUrl = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify(apiData))}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://y.qq.com/'
      }
    });

    const data = await response.json();

    if (data.songinfo?.data?.track_info) {
      const track = data.songinfo.data.track_info;
      const albumName = track.album.name || track.album.title;
      const artistName = track.singer && track.singer.length > 0 ? track.singer[0].name : '';
      const songName = track.name || track.title;

      console.log(`Resolved QQ Music URL to: ${albumName} ${artistName}`);

      return res.status(200).json({
        success: true,
        album: albumName,
        artist: artistName,
        song: songName,
        searchQuery: `${albumName} ${artistName}`
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Could not find track info in QQ Music API response'
    });

  } catch (error) {
    console.error("Error resolving QQ Music URL:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
