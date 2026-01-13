const chromium = require('chrome-aws-lambda');

// iTunes API search function
async function searchAlbum(query) {
  const encodedQuery = encodeURIComponent(query);
  const isTW = false; // Default to US store for consistency
  const langParam = isTW ? 'zh_TW' : 'en_US';
  const countryParam = isTW ? 'TW' : 'US';

  const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=album&limit=1&lang=${langParam}&country=${countryParam}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Album not found');
  }

  return data.results[0];
}

// Generate HTML template with album data
function generateHTML(albumData, style) {
  const artworkUrl = albumData.artworkUrl100.replace('100x100bb', '600x600bb');
  const year = albumData.releaseDate.slice(0, 4);
  const dateFull = albumData.releaseDate.slice(0, 10).replace(/-/g, '.');
  const genre = albumData.primaryGenreName.toUpperCase();
  const title = albumData.collectionName;
  const artist = albumData.artistName;

  // Use the exact HTML structure from index.html (simplified for rendering)
  const html = `
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoverShare</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Inter:wght@400;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'UnboundedSans';
            src: url('https://covershare.aronnax.site/UnboundedSans.otf') format('opentype'),
                 url('https://covershare.aronnax.site/UnboundedSans.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', 'Roboto', sans-serif;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }

        #vinyl-card {
            position: relative; overflow: hidden;
            display: flex; flex-direction: column;
        }

        /* Liquid Glass Style */
        #vinyl-card.style-liquid {
            width: 360px; aspect-ratio: 0.66; border-radius: 24px; padding: 32px;
            box-shadow: 0 20px 60px -10px rgba(0,0,0,0.3); color: white;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .liquid-layer { position: absolute; inset: 0; z-index: 0; }
        .liquid-bg {
            position: absolute; inset: 0; opacity: 0.9;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .liquid-glass {
            position: absolute; inset: 0;
            background: rgba(255,255,255,0.02);
        }

        .content-liquid { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; }
        .cover-l { width: 100%; aspect-ratio: 1; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); margin-bottom: auto; overflow: hidden; }
        .cover-l img { width: 100%; height: 100%; object-fit: cover; }
        .info-l { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }

        .title-l {
            font-size: 24px; font-weight: 800; line-height: 1.2; margin-bottom: 4px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .artist-l { font-size: 16px; opacity: 0.9; font-weight: 500; }
        .tags-row { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

        .pill {
            background: rgba(255,255,255,0.15); padding: 0 10px; border-radius: 6px;
            height: 22px; display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 400; letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .watermark {
            position: absolute; bottom: 150px; right: 2px;
            font-size: 11px; font-weight: 900; letter-spacing: 8px;
            opacity: 0.35; text-shadow: 0 1px 2px rgba(0,0,0,0.1); pointer-events: none;
        }

        /* Classic Vibe Style */
        #vinyl-card.style-jewel {
            width: 500px; height: 600px; padding: 50px; border-radius: 0;
            background-color: #e0e0e0;
            background-image:
                radial-gradient(at 0% 0%, #f5f5f5 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(255,255,255,0.8) 0px, transparent 40%),
                radial-gradient(at 100% 100%, #f5f5f5 0px, transparent 60%),
                radial-gradient(at 0% 100%, rgba(255,255,255,0.5) 0px, transparent 40%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        .grain-overlay {
            position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.08;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
        }

        .content-jewel {
            display: flex; flex-direction: column; align-items: center;
            width: 100%; transform: rotate(-1deg); z-index: 10;
        }

        .jewel-case-white {
            width: 380px; height: 335px; background: #fdfdfd; position: relative;
            border-radius: 4px; padding: 6px 6px 6px 36px;
            box-shadow: 1px 1px 0px rgba(255,255,255,0.6), 15px 30px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03);
            display: flex;
        }

        .jewel-spine-white {
            position: absolute; top: 0; bottom: 0; left: 0; width: 36px;
            background: #f4f4f4; border-right: 1px solid rgba(0,0,0,0.08); border-radius: 4px 0 0 4px;
            z-index: 10; overflow: hidden;
            background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px);
        }

        .spine-text {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-90deg);
            white-space: nowrap; font-size: 9px;
            font-weight: normal; color: #888; letter-spacing: 1px; width: 300px; text-align: center;
            font-family: 'UnboundedSans', 'Inter', sans-serif;
        }

        .jewel-cover-area {
            width: 100%; height: 100%; position: relative; background: #fff;
            box-shadow: inset 2px 2px 6px rgba(0,0,0,0.1); overflow: hidden;
        }

        .jewel-img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.02) saturate(1.05); }

        .plastic-shell {
            position: absolute; inset: 0; pointer-events: none; z-index: 20;
            box-shadow: inset 1px 1px 2px rgba(255,255,255,0.9), inset -1px -1px 2px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2);
            background: linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 60%);
            opacity: 0.7;
        }

        .plastic-scuffs {
            position: absolute; inset: 0; opacity: 0.05; pointer-events: none; z-index: 21;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='scuff'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.08' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23scuff)' opacity='0.4'/%3E%3C/svg%3E");
        }

        .hinge-w {
            position: absolute; left: 12px; width: 6px; height: 24px;
            background: linear-gradient(to right, #e0e0e0, #fff, #d0d0d0);
            border-radius: 1px; box-shadow: 1px 0 2px rgba(0,0,0,0.1); z-index: 30;
        }
        .hinge-w.top { top: 20px; }
        .hinge-w.bottom { bottom: 20px; }
        .cd-logo { position: absolute; bottom: 8px; right: 10px; z-index: 30; font-family: sans-serif; font-weight: 900; font-size: 10px; color: rgba(0,0,0,0.2); pointer-events: none; letter-spacing: -0.5px; }

        .jewel-info-card {
            margin-top: 30px; background: #fff; padding: 16px 24px; border-radius: 2px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; width: 80%;
            position: relative; transform: rotate(0.5deg);
        }
        .tape {
            position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 80px; height: 25px;
            background: rgba(255,255,255,0.4);
            border-left: 1px dashed rgba(0,0,0,0.1); border-right: 1px dashed rgba(0,0,0,0.1);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); z-index: 50; opacity: 0.8;
        }

        .font-main { font-family: 'UnboundedSans', monospace; }
        .font-artist { font-family: 'Noto Sans Mono', 'Noto Sans SC', sans-serif; }
        .font-fallback { font-family: 'Inter', 'Roboto', sans-serif !important; }

        .j-title { font-weight: normal; font-size: 32px; color: #222; margin-bottom: 4px; }
        .j-artist { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .j-meta { margin-top: 12px; border-top: 1px dashed #ddd; padding-top: 8px; font-size: 11px; color: #999; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div id="vinyl-card" class="style-${style}">
        ${
          style === 'liquid'
            ? `
        <div class="liquid-layer">
            <div class="liquid-bg"></div>
            <div class="liquid-glass"></div>
        </div>
        <div class="content-liquid">
            <div class="cover-l">
                <img src="${artworkUrl}" crossorigin="anonymous">
            </div>
            <div class="info-l">
                <div class="title-l">${title}</div>
                <div class="artist-l">${artist}</div>
                <div class="tags-row">
                    <span class="pill">${year}</span>
                    <span class="pill">${genre}</span>
                </div>
            </div>
            <div class="watermark">COVERSHARE</div>
        </div>
        `
            : `
        <div class="grain-overlay"></div>
        <div class="content-jewel">
            <div class="jewel-case-white">
                <div class="jewel-spine-white">
                    <div class="hinge-w top"></div>
                    <div class="hinge-w bottom"></div>
                    <div class="spine-text font-main">${artist.toUpperCase()} - ${title.toUpperCase()}</div>
                </div>
                <div class="jewel-cover-area">
                    <img src="${artworkUrl}" class="jewel-img" crossorigin="anonymous">
                    <div class="plastic-shell"></div>
                    <div class="plastic-scuffs"></div>
                    <div class="cd-logo">CoverShare</div>
                </div>
            </div>
            <div class="jewel-info-card">
                <div class="tape"></div>
                <div class="j-title font-main">${title.toUpperCase()}</div>
                <div class="j-artist font-artist">${artist.toUpperCase()}</div>
                <div class="j-meta font-main">
                    <span>${genre}</span>
                    <span>${dateFull}</span>
                </div>
            </div>
        </div>
        `
        }
    </div>
</body>
</html>
  `;

  return html;
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, style = 'both' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    // Validate style parameter
    const validStyles = ['liquid', 'jewel', 'both'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({ error: 'Invalid style. Must be liquid, jewel, or both' });
    }

    console.log(`Searching for album: ${query}, style: ${style}`);

    // Search for album
    const albumData = await searchAlbum(query);
    console.log(`Found album: ${albumData.collectionName} by ${albumData.artistName}`);

    // Launch browser with chrome-aws-lambda
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const results = [];

    // Generate requested styles
    const stylesToGenerate = style === "both" ? ["liquid", "jewel"] : [style];

    for (const currentStyle of stylesToGenerate) {
      const page = await browser.newPage();

      // Set viewport based on style
      if (currentStyle === "liquid") {
        await page.setViewport({
          width: 440,
          height: 720,
          deviceScaleFactor: 2,
        });
      } else {
        await page.setViewport({
          width: 600,
          height: 720,
          deviceScaleFactor: 2,
        });
      }

      const html = generateHTML(albumData, currentStyle);
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Wait for fonts to load
      await page.evaluateHandle("document.fonts.ready");

      // Take screenshot
      const element = await page.$("#vinyl-card");
      const screenshot = await element.screenshot({
        type: "png",
        omitBackground: true,
      });

      const base64Image = screenshot.toString("base64");

      results.push({
        style: currentStyle,
        styleName: currentStyle === "liquid" ? "Liquid Glass" : "Classic Vibe",
        image: base64Image,
        filename: `CoverShare-${albumData.collectionName.replace(
          /[/\\?%*:|"<>]/g,
          "-"
        )}-${currentStyle}.png`,
      });

      await page.close();
    }

    await browser.close();

    // Return response
    return res.status(200).json({
      success: true,
      album: {
        title: albumData.collectionName,
        artist: albumData.artistName,
        genre: albumData.primaryGenreName,
        releaseDate: albumData.releaseDate,
        artworkUrl: albumData.artworkUrl100.replace("100x100bb", "600x600bb"),
      },
      images: results,
    });
  } catch (error) {
    console.error("Error generating images:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
