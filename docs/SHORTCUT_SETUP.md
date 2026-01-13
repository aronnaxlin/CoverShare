# CoverShare iOS Shortcut - Step-by-Step Setup Guide

## Quick Overview
This shortcut will:
1. Get a song shared from Spotify
2. Ask you to choose a style (Liquid Glass / Classic Vibe / Both)
3. Generate beautiful cover images
4. Save them to your Photos

**Time needed:** 5 minutes

---

## Setup Instructions

### Step 1: Create New Shortcut

1. Open **Shortcuts** app on your iPhone
2. Tap **+** (top right)
3. Tap the shortcut name at the top
4. Rename to: **CoverShare**
5. Tap ✓ (checkmark) to confirm

---

### Step 2: Configure Share Sheet Access

1. Tap the **ⓘ** icon (info) at the bottom
2. Enable **Show in Share Sheet**
3. Under "Share Sheet Types":
   - Enable **URLs**
   - Enable **Text**
4. Tap "Done"

---

### Step 3: Add Actions (Follow Exactly)

#### Action 1: Get Shared Input
- Search for: **"Receive"**
- Add: **"Receive URLs from Share Sheet"** or **"Receive Any Input"**

#### Action 2: Get Text from Input
- Search for: **"Get Text"**
- Add: **"Get Text from Input"**
- Set input to: **Shortcut Input**

#### Action 3: Extract Song Name
- Search for: **"Replace Text"**
- Add: **"Replace Text"**
- Configure:
  - Find: `open.spotify.com/track/`
  - Replace with: (leave empty)
  - Regular Expression: OFF

#### Action 4: Clean URL Parameters
- Add another **"Replace Text"**
- Configure:
  - In: **Replaced Text** (from previous action)
  - Find: `\\?.*$`
  - Replace with: (leave empty)
  - Regular Expression: **ON** ⚠️ (Important!)

#### Action 5: Replace Hyphens with Spaces
- Add another **"Replace Text"**
- Configure:
  - In: **Replaced Text**
  - Find: `-`
  - Replace with: ` ` (a space)
  - Regular Expression: OFF

#### Action 6: Store Song Query
- Search for: **"Set Variable"**
- Add: **"Set Variable"**
- Variable Name: `SongQuery`
- Value: **Replaced Text** (from previous action)

#### Action 7: Show Style Menu
- Search for: **"Choose from Menu"**
- Add: **"Choose from Menu"**
- Prompt: `Select Image Style`
- Add 3 menu items:
  1. **Liquid Glass**
  2. **Classic Vibe**
  3. **Both Styles**

---

### Step 4: Configure Each Menu Option

#### Under "Liquid Glass" Option:
1. Search for: **"Set Variable"**
2. Add: **"Set Variable"**
3. Variable Name: `StyleChoice`
4. Value: Type manually: `liquid`

#### Under "Classic Vibe" Option:
1. Add: **"Set Variable"**
2. Variable Name: `StyleChoice`
3. Value: Type manually: `jewel`

#### Under "Both Styles" Option:
1. Add: **"Set Variable"**
2. Variable Name: `StyleChoice`
3. Value: Type manually: `both`

---

### Step 5: Call API (After Menu, Outside All Options)

⚠️ Make sure this is AFTER the "End Menu" action!

#### Action 8: Get Contents of URL
- Search for: **"Get Contents"**
- Add: **"Get Contents of URL"**
- Configure:
  - **URL**: `https://cover-share.vercel.app/api/generate`
  - **Method**: **POST**
  - **Headers**:
    - Tap "Add new field"
    - Key: `Content-Type`
    - Value: `application/json`
  - **Request Body**: **JSON**
  - **JSON**: Tap to expand, then:
    - Add field `query`: Select variable **SongQuery**
    - Add field `style`: Select variable **StyleChoice**

#### Action 9: Get Dictionary
- Search for: **"Get Dictionary"**
- Add: **"Get Dictionary from Input"**
- Input: **Contents of URL** (from previous action)

#### Action 10: Get Images Array
- Search for: **"Get Value"**
- Add: **"Get Dictionary Value"**
- Key: Type `images`
- Dictionary: **Dictionary** (from previous action)

#### Action 11: Loop Through Images
- Search for: **"Repeat"**
- Add: **"Repeat with Each"**
- Each item in: **Dictionary Value** (images array)

---

### Step 6: Inside the Repeat Loop

#### Action 12: Get Image Data
- Add: **"Get Dictionary Value"**
- Key: `image`
- Dictionary: **Repeat Item**

#### Action 13: Decode Base64
- Search for: **"Base64"**
- Add: **"Base64 Encode"**
- Change it to: **"Base64 Decode"** (tap the action, toggle)
- Input: **Dictionary Value** (from previous action)

#### Action 14: Save to Photos
- Search for: **"Save"**
- Add: **"Save to Photo Album"**
- Photo: **Base64 Decoded**
- Album: **Recents** (or create a custom album)

---

### Step 7: Add Completion Notification

⚠️ This should be AFTER the "End Repeat" action!

#### Action 15: Show Notification
- Search for: **"Show Notification"**
- Add: **"Show Notification"**
- Message: `✅ CoverShare images saved to Photos!`

---

## Visual Workflow Summary

```
1. Receive URLs from Share Sheet
2. Get Text from Input
3. Replace Text (remove spotify URL part)
4. Replace Text (remove URL parameters, REGEX ON)
5. Replace Text (replace - with space)
6. Set Variable → SongQuery
7. Choose from Menu "Select Image Style"
   ├─ Liquid Glass → Set Variable StyleChoice = "liquid"
   ├─ Classic Vibe → Set Variable StyleChoice = "jewel"
   └─ Both Styles → Set Variable StyleChoice = "both"
8. Get Contents of URL (POST to API)
9. Get Dictionary from Input
10. Get Dictionary Value (key: "images")
11. Repeat with Each (loop through images)
    ├─ Get Dictionary Value (key: "image")
    ├─ Base64 Decode
    └─ Save to Photo Album
12. Show Notification "Images saved!"
```

---

## How to Use

1. Open **Spotify** app
2. Play any song
3. Tap **⋯** (More) → **Share**
4. Scroll down and tap **CoverShare**
5. Select your preferred style
6. Wait 5-10 seconds
7. Images appear in Photos! 🎉

---

## Troubleshooting

### "No input provided"
- Make sure you're sharing from Spotify
- The share should include a URL like `open.spotify.com/track/...`

### "Invalid album" error
- Try a more popular song
- Include artist name if possible

### Images not saving
- Settings → Shortcuts → Allow access to Photos

### Slow/Timeout
- First run is slower (cold start)
- Increase timeout if needed in "Get Contents of URL" action

---

## Tips

- Works with any song on Spotify
- Creates high-resolution PNG images
- Images have transparent backgrounds
- Perfect for sharing on social media

Enjoy! 🎵
