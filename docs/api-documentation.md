# CoverShare API Documentation

## Base URL

```
https://your-project.vercel.app
```

Replace `your-project` with your actual Vercel project name.

## Endpoints

### POST /api/generate

Generate album cover images based on song/album query.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "query": "Song Name Artist Name",
  "style": "liquid" | "jewel" | "both"
}
```

**Parameters:**

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| query     | string | Yes      | Search query (song name, artist, album)        |
| style     | string | No       | Image style: `liquid`, `jewel`, or `both`. Default: `both` |

**Style Options:**
- `liquid` - Liquid Glass style only
- `jewel` - Classic Vibe (jewel case) style only
- `both` - Generate both styles (default)

#### Response

**Success (200 OK):**

```json
{
  "success": true,
  "album": {
    "title": "Lover",
    "artist": "Taylor Swift",
    "genre": "Pop",
    "releaseDate": "2019-08-23",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music123/..."
  },
  "images": [
    {
      "style": "liquid",
      "styleName": "Liquid Glass",
      "image": "iVBORw0KGgoAAAANSUhEUgAA...",
      "filename": "CoverShare-Lover-liquid.png"
    },
    {
      "style": "jewel",
      "styleName": "Classic Vibe",
      "image": "iVBORw0KGgoAAAANSUhEUgAA...",
      "filename": "CoverShare-Lover-jewel.png"
    }
  ]
}
```

**Field Descriptions:**

| Field              | Type   | Description                                      |
|-------------------|--------|--------------------------------------------------|
| success           | boolean | Whether the request succeeded                    |
| album.title       | string | Album title                                       |
| album.artist      | string | Artist name                                       |
| album.genre       | string | Primary genre                                     |
| album.releaseDate | string | Release date (YYYY-MM-DD)                        |
| album.artworkUrl  | string | High-resolution album artwork URL                |
| images            | array  | Array of generated images                        |
| images[].style    | string | Style identifier (`liquid` or `jewel`)           |
| images[].styleName| string | Human-readable style name                        |
| images[].image    | string | Base64-encoded PNG image                         |
| images[].filename | string | Suggested filename for saving                    |

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Missing query parameter"
}
```

```json
{
  "error": "Invalid style. Must be liquid, jewel, or both"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Album not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Usage Examples

### cURL

**Generate both styles:**
```bash
curl -X POST https://your-project.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Midnights Taylor Swift",
    "style": "both"
  }'
```

**Generate only Liquid Glass:**
```bash
curl -X POST https://your-project.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "folklore Taylor Swift",
    "style": "liquid"
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('https://your-project.vercel.app/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '1989 Taylor Swift',
    style: 'jewel',
  }),
});

const data = await response.json();

if (data.success) {
  // Decode base64 images
  data.images.forEach(img => {
    const imageData = atob(img.image);
    // Use the image data...
  });
}
```

### Python

```python
import requests
import base64

response = requests.post(
    'https://your-project.vercel.app/api/generate',
    json={
        'query': 'Lover Taylor Swift',
        'style': 'both'
    }
)

data = response.json()

if data['success']:
    for img in data['images']:
        # Decode and save image
        image_data = base64.b64decode(img['image'])
        with open(img['filename'], 'wb') as f:
            f.write(image_data)
```

## Rate Limits

**Vercel Free Tier:**
- 100 GB bandwidth per month
- No hard request limit
- 10-second function timeout

**Typical Response Times:**
- Single style: ~3-5 seconds
- Both styles: ~6-10 seconds

## Best Practices

1. **Cache Results**: If requesting the same album multiple times, cache the response
2. **Use Specific Queries**: Include artist name for better search results
3. **Handle Errors**: Always check the `success` field before processing images
4. **Decode Base64**: Images are returned as base64 strings and must be decoded

## Search Tips

The API uses iTunes Search API internally. For best results:

- ✅ Include artist name: `"Reputation Taylor Swift"`
- ✅ Use official album names: `"The Tortured Poets Department"`
- ❌ Avoid generic terms: `"best songs 2024"`
- ❌ Don't use only track names (may not find album)

## Troubleshooting

**"Album not found"**
- Try adding the artist name to the query
- Ensure spelling is correct
- Some albums may not be available in iTunes Store

**Slow Response**
- Rendering takes 3-5 seconds per style
- Requesting both styles takes longer
- Large album artwork increases processing time

**Base64 Decode Errors**
- Ensure you're decoding the `image` field correctly
- Some libraries require removing data URI prefix

## Technical Details

**Image Specifications:**

| Style        | Dimensions  | Format | Background |
|-------------|-------------|--------|------------|
| Liquid Glass| 360×545 px  | PNG    | Transparent|
| Classic Vibe| 500×600 px  | PNG    | Transparent|

**Scale**: 2x (Retina resolution)

**Fonts Used:**
- UnboundedSans (titles)
- Noto Sans Mono (artist names)
- Inter/Roboto (fallback)

## Support

For issues or questions:
1. Check Vercel function logs
2. Review deployment guide
3. Test with `curl` to isolate issues
