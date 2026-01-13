const url = "https://cover-share.vercel.app/api/generate";

async function testRemote() {
  console.log("Testing remote API:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "https://open.spotify.com/track/6INLpBxo9F5QMer04VXEnd", // Air - Sexy Boy
        style: "liquid"
      })
    });

    if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        const text = await res.text();
        console.error("Body:", text);
        return;
    }

    const data = await res.json();
    console.log("Success:", data.success);

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        console.log("Received images:", data.images.length);
        const img = data.images[0];
        console.log("First image style:", img.style);
        console.log("Base64 length:", img.image ? img.image.length : "MISSING");

        if (img.image) {
            // Check if it looks like base64
            const first100 = img.image.substring(0, 100);
            console.log("First 100 chars:", first100);
            const isBase64 = /^[A-Za-z0-9+/=]+$/.test(first100);
            console.log("Base64 valid chars (start):", isBase64);
        }
    } else {
        console.log("No images returned.", data);
    }

    if (data.error) {
        console.log("Returned logical error:", data.error);
    }

  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

testRemote();
