// using native fetch (Node 18+)

// Mocking the logic from api/resolve-qqmusic.js
async function resolveQQMusicUrl(input) {
    try {
        console.log("Input:", input);

        // 1. Extract URL if input contains text
        const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
        const cleanUrl = urlMatch ? urlMatch[0] : input;
        console.log("Clean URL:", cleanUrl);

        // 2. Fetch the initial URL to handle short links (302 redirects)
        const res = await fetch(cleanUrl, {  // ← Using cleanUrl now!
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Referer': 'https://y.qq.com/'
            },
            redirect: 'follow'
        });

        console.log("Final URL:", res.url);

        // 3. Extract song_mid from the Final URL
        // Expected format: https://y.qq.com/n/ryqq/songDetail/000Qepff3GyT0O
        // OR query param: songmid=0029CVxG4QngaW (Mobile redirect)
        const midMatch = res.url.match(/songDetail\/([a-zA-Z0-9]+)/) || res.url.match(/songmid=([a-zA-Z0-9]+)/);
        if (!midMatch) {
            console.error("Could not extract song_mid from URL (" + res.url + ")");
            return;
        }

        const songMid = midMatch[1];
        console.log("Song MID:", songMid);

        // 4. Call QQ Music Internal API
        const apiData = {
            comm: { ct: 24, cv: 0 },
            songinfo: {
                method: "get_song_detail_yqq",
                param: { song_mid: songMid },
                module: "music.pf_song_detail_svr"
            }
        };
        const apiUrl = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify(apiData))}`;

        const apiRes = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Referer': 'https://y.qq.com/'
            }
        });

        const data = await apiRes.json();
        console.log("API Response Code:", data.code);

        if (data.code === 0 && data.songinfo && data.songinfo.data && data.songinfo.data.track_info) {
            const info = data.songinfo.data.track_info;
            const albumName = info.album.name || info.album.title;
            const artistName = info.singer[0].name; // getting first artist

            console.log("✅ SUCCESS! Resolved:", `${albumName} ${artistName}`);
            return `${albumName} ${artistName}`;
        } else {
            console.error("API Error or Unexpected Structure", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

// Test cases
(async () => {
    console.log("--- Test Case 1: Complex Text with URL ---");
    await resolveQQMusicUrl("宇多田光 (宇多田ヒカル) - One Last Kiss https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M @QQ音乐");

    console.log("\n--- Test Case 2: Clean URL ---");
    await resolveQQMusicUrl("https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M");
})();
