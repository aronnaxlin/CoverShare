const url = "https://open.spotify.com/track/6INLpBxo9F5QMer04VXEnd?si=rCwMLibMRUG4_rxltMC7yQ";

async function checkSpotify() {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.0)'
      }
    });
    const text = await res.text();

    // Find og:description
    const match = text.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (match) {
      console.log("Found og:description:", match[1]);
      const parts = match[1].split(' · ');
      console.log("Parts:", parts);
    } else {
        const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
        console.log("No og:description found");
        if (titleMatch) console.log("Found title:", titleMatch[1]);

        // Log more to see what we got
        const metaTags = text.match(/<meta[^>]+>/g);
        console.log("Meta tags found:", metaTags ? metaTags.length : 0);
    }

  } catch (e) {
    console.error(e);
  }
}

checkSpotify();
