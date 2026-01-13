import handler from './api/generate.js';

// Mock Request and Response
const req = {
  method: 'POST',
  body: {
    query: 'This is a very long album title that should trigger the resizing logic definitely more than 60 characters to be huge',
    style: 'jewel'
  }
};

const res = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return {
      json: (data) => {
        if (data.error) console.error("Error:", data.error);
        else {
            console.log("Success:", data.success);
            console.log("Album:", data.album.title);
            if(data.images && data.images.length > 0) {
                console.log("Generated Image Base64 Length:", data.images[0].image.length);
            }
        }
        return res; // chainable
      },
      end: () => {}
    };
  }
};

async function test() {
    try {
        console.log("Running local test with long title...");
        // internal searchAlbum might fail if I don't provide a real query that finds something on iTunes.
        // I need a real long album name or relies on the fact that I can't mock searchAlbum easily without refactoring.
        // But wait, the handler calls searchAlbum.
        // Let's use a real query for a long title.
        req.body.query = "The Boy Who Died Wolf"; // Not super long.
        // "ZARD TODAY IS ANOTHER DAY" is 25 chars.
        req.body.query = "Today Is Another Day Zard";

        await handler(req, res);
    } catch (e) {
        console.error("Test execution failed:", e);
    }
}

test();
