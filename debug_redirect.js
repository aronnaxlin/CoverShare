// Debug: See exactly what URL we get after redirect

async function debugRedirect(url) {
    console.log("Testing URL:", url);

    try {
        // Try GET instead of HEAD - some servers behave differently
        const res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });

        console.log("Status:", res.status);
        console.log("Final URL:", res.url);
        console.log("Headers:", Object.fromEntries(res.headers.entries()));

        // Get body to see if there's meta refresh or JS redirect
        const text = await res.text();
        console.log("\nBody length:", text.length);
        console.log("Body preview (first 1000 chars):");
        console.log(text.substring(0, 1000));

        // Check for meta refresh
        const metaRefresh = text.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)["']/i);
        if (metaRefresh) {
            console.log("\n🔄 Found meta refresh:", metaRefresh[1]);
        }

        // Check for window.location
        const jsRedirect = text.match(/window\.location\s*=\s*["']([^"']+)["']/i);
        if (jsRedirect) {
            console.log("\n🔄 Found JS redirect:", jsRedirect[1]);
        }

        // Check for songmid anywhere in the response
        const songmidMatch = text.match(/songmid[=:]["']?([A-Za-z0-9]+)/i);
        if (songmidMatch) {
            console.log("\n✅ Found songmid in body:", songmidMatch[1]);
        }

        // Check for song_mid anywhere
        const song_midMatch = text.match(/song_mid[=:]["']?([A-Za-z0-9]+)/i);
        if (song_midMatch) {
            console.log("\n✅ Found song_mid in body:", song_midMatch[1]);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugRedirect("https://c6.y.qq.com/base/fcgi-bin/u?__=bjvC0OsVxI0M");
