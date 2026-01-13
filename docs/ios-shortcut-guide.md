# iOS Shortcut Setup Guide

This guide will help you create an iOS Shortcut to share songs from Spotify and generate CoverShare images.

## Overview

When completed, you'll be able to:
1. Share a song from Spotify
2. Select your preferred image style (Liquid Glass, Classic Vibe, or Both)
3. Automatically generate and save images to your Photos library

## Prerequisites

- iPhone with iOS 15 or later
- Spotify app installed
- iOS Shortcuts app (pre-installed on iOS)
- Your API deployed to Vercel (see [Deployment Guide](./deployment-guide.md))

## Creating the Shortcut

### Method 1: Import Pre-Built Shortcut (Easiest)

> [!TIP]
> A pre-built `.shortcut` file will be provided that you can import directly.

1. Download the shortcut file (to be provided)
2. Open the file on your iPhone
3. Tap "Add Shortcut"
4. Edit the shortcut to add your API URL
5. Done!

### Method 2: Build Manually

Follow these steps to create the shortcut from scratch:

#### Step 1: Create New Shortcut

1. Open **Shortcuts** app
2. Tap **+** (top right)
3. Name it "CoverShare"

#### Step 2: Get Shared Input

1. Tap "Add Action"
2. Search for "Get URLs from Input"
3. Add it

This will capture the Spotify share URL.

#### Step 3: Extract Song Information

1. Add action: "Get Text from Input"
2. Add action: "Match Text" with pattern: `track/([^?]+)`
3. Add action: "Get Group from Matched Text" (Group Index: 1)
4. Add action: "Replace Text"
   - Find: `-`
   - Replace with: ` ` (space)
5. Add action: "Set Variable" → Name it "SongQuery"

#### Step 4: Show Style Selection Menu

1. Add action: "Choose from Menu"
2. Set prompt: "Select Image Style"
3. Add three options:
   - **Liquid Glass**
   - **Classic Vibe**
   - **Both Styles**

#### Step 5: Set Style Variable

Under each menu option:

**For "Liquid Glass" option:**
1. Add action: "Set Variable"
   - Name: `StyleChoice`
   - Value: `liquid`

**For "Classic Vibe" option:**
1. Add action: "Set Variable"
   - Name: `StyleChoice`
   - Value: `jewel`

**For "Both Styles" option:**
1. Add action: "Set Variable"
   - Name: `StyleChoice`
   - Value: `both`

#### Step 6: Call API

After the menu (outside any option), add:

1. Add action: "Get Contents of URL"
2. Configure:
   - **URL**: `https://your-project.vercel.app/api/generate`
   - **Method**: POST
   - **Headers**:
     - Key: `Content-Type`
     - Value: `application/json`
   - **Request Body**: JSON

   ```json
   {
     "query": "SongQuery variable",
     "style": "StyleChoice variable"
   }
   ```

3. Add action: "Get Dictionary from Input"

#### Step 7: Extract and Save Images

1. Add action: "Get Value for Key" → Key: `images`
2. Add action: "Repeat with Each"
3. Inside the repeat:
   - Add action: "Get Dictionary Value" → Key: `image`
   - Add action: "Base64 Decode"
   - Add action: "Save to Photo Album"

#### Step 8: Show Notification

1. Add action: "Show Notification"
2. Set text: "CoverShare images saved!"

### Step 9: Enable Sharing

1. Tap shortcut settings (ⓘ icon)
2. Enable "Show in Share Sheet"
3. Under "Share Sheet Types", enable:
   - **URLs**
   - **Text**

## Using the Shortcut

### From Spotify:

1. Play any song in Spotify
2. Tap **Share** (⋯ menu → Share)
3. Tap **Copy Link** or **Share Song**
4. Select "CoverShare" from the share sheet
5. Choose your preferred style
6. Wait 5-10 seconds
7. Images will be saved to your Photos library!

### Troubleshooting

**"No input provided"**
- Make sure you're sharing a Spotify track link
- Try copying the link first, then running the shortcut manually

**"Request failed"**
- Check your internet connection
- Verify API URL is correct in the shortcut
- Check Vercel deployment logs

**"Invalid response"**
- The song may not be found on iTunes
- Try sharing a more popular track
- Check API logs for errors

**Images not saving**
- Grant Photos access to Shortcuts app
- Settings → Shortcuts → Photos → Allow

## Example Shortcuts JSON

For advanced users, here's a simplified version:

```json
{
  "actions": [
    {
      "type": "GetURLsFromInput"
    },
    {
      "type": "ChooseFromMenu",
      "prompt": "Select Style",
      "items": ["Liquid Glass", "Classic Vibe", "Both"]
    },
    {
      "type": "GetContentsOfURL",
      "url": "https://your-api.vercel.app/api/generate",
      "method": "POST",
      "body": {
        "query": "{{songName}}",
        "style": "{{styleChoice}}"
      }
    },
    {
      "type": "SaveToPhotoAlbum"
    }
  ]
}
```

## Next Steps

- Test with different albums
- Customize the shortcut icon
- Share the shortcut with friends!

## Need Help?

If you encounter issues, check:
1. [API Documentation](./api-documentation.md)
2. Vercel function logs
3. iOS Shortcuts app permissions
