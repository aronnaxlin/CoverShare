// Final test with the updated logic

async function testResolve(input) {
    console.log("=== Testing ===");
    console.log("Input:", input);

    // Extract URL
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
    const cleanUrl = urlMatch ? urlMatch[0] : input;
    console.log("Clean URL:", cleanUrl);

    // Check direct match first
    const directMatch = cleanUrl.match(/songDetail\/([A-Za-z0-9]+)/);
    let songMid = null;

    if (directMatch) {
        songMid = directMatch[1];
    } else {
        // Fetch with GET to get HTML body
        console.log("Fetching...");
        const fetchRes = await fetch(cleanUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });

        const finalUrl = fetchRes.url;
        console.log("Final URL:", finalUrl);

        // Try URL first
        const redirectMatch = finalUrl.match(/songDetail\/([A-Za-z0-9]+)/) || finalUrl.match(/songmid=([A-Za-z0-9]+)/);
        if (redirectMatch) {
            songMid = redirectMatch[1];
        } else {
            // Check HTML body
            const htmlBody = await fetchRes.text();
            const bodyMatch = htmlBody.match(/songmid[=:]["']?([A-Za-z0-9]+)/i);
            if (bodyMatch) {
                songMid = bodyMatch[1];
                console.log("Found songmid in HTML body:", songMid);
            }
        }
    }

    if (!songMid) {
        console.log("❌ FAILED: Could not extract songmid");
        return;
    }

    console.log("Song MID:", songMid);

    // Call QQ Music API
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
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://y.qq.com/'
        }
    });

    const data = await apiRes.json();

    if (data.songinfo?.data?.track_info) {
        const track = data.songinfo.data.track_info;
        const albumName = track.album.name || track.album.title;
        const artistName = track.singer?.[0]?.name || '';
        console.log("✅ SUCCESS!");
        console.log("Album:", albumName);
        console.log("Artist:", artistName);
    } else {
        console.log("❌ API returned no track info");
    }
}

testResolve("宇多田光 (宇多田ヒカル) - One Last Kiss https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M @QQ音乐");
