// Test script that mimics the exact logic in resolve-qqmusic.js

async function testResolveQQMusic(inputUrl) {
    console.log("=== Testing QQ Music Resolution ===");
    console.log("Input URL:", inputUrl);

    // Extract URL from text if needed (handles "Artist Name https://..." format)
    const urlMatch = inputUrl.match(/(https?:\/\/[^\s]+)/);
    const cleanUrl = urlMatch ? urlMatch[0] : inputUrl;
    console.log("Clean URL:", cleanUrl);

    // Check for direct link first
    const directMatch = cleanUrl.match(/songDetail\/([A-Za-z0-9]+)/);

    let songMid = null;

    if (directMatch) {
        songMid = directMatch[1];
        console.log("Direct match found:", songMid);
    } else {
        // Try fetching to follow redirects
        console.log("No direct match, following redirect...");
        try {
            const res = await fetch(cleanUrl, {
                method: 'HEAD',
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const finalUrl = res.url;
            console.log("Final URL after redirect:", finalUrl);

            // Try extracting from final URL
            const redirectMatch = finalUrl.match(/songDetail\/([A-Za-z0-9]+)/) || finalUrl.match(/songmid=([A-Za-z0-9]+)/);
            if (redirectMatch) {
                songMid = redirectMatch[1];
                console.log("Extracted songMid from redirect:", songMid);
            } else {
                console.log("❌ Could not extract songMid from final URL");
            }
        } catch (e) {
            console.error("❌ Fetch error:", e.message);
        }
    }

    if (!songMid) {
        console.log("❌ FAILED: Could not resolve song_mid");
        return;
    }

    // Test QQ Music API call
    console.log("\n=== Calling QQ Music API ===");
    const apiData = {
        comm: { ct: 24, cv: 0 },
        songinfo: {
            method: "get_song_detail_yqq",
            param: { song_mid: songMid },
            module: "music.pf_song_detail_svr"
        }
    };

    const apiUrl = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify(apiData))}`;

    try {
        const apiRes = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://y.qq.com/'
            }
        });

        const data = await apiRes.json();

        if (data.songinfo?.data?.track_info) {
            const track = data.songinfo.data.track_info;
            const albumName = track.album.name || track.album.title;
            const artistName = track.singer && track.singer.length > 0 ? track.singer[0].name : '';
            console.log("✅ SUCCESS!");
            console.log("Album:", albumName);
            console.log("Artist:", artistName);
            console.log("Search Query:", `${albumName} ${artistName}`);
        } else {
            console.log("❌ API returned no track info");
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("❌ API call error:", e.message);
    }
}

// Run tests
(async () => {
    // Test 1: Short link with extra text (like QQ Music share)
    await testResolveQQMusic("宇多田光 (宇多田ヒカル) - One Last Kiss https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M @QQ音乐");

    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Clean short link
    await testResolveQQMusic("https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M");
})();
