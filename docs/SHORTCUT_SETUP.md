# CoverShare iOS Shortcut - Step-by-Step Setup Guide

## Quick Overview
This shortcut will:
1. Get a song shared from Spotify or QQ Music
2. Ask you to choose a style (Liquid Glass or Classic Vibe)
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

#### Action 3: Store Query
- Search for: **"Set Variable"**
- Add: **"Set Variable"**
- Variable Name: `SongQuery`
- Value: **Text** (from previous action)

#### Action 4: Show Style Menu
- Search for: **"Choose from Menu"**
- Add: **"Choose from Menu"**
- Prompt: `Select Image Style`
- Add 2 menu items:
  1. **Liquid Glass**
  2. **Classic Vibe**

---

### Step 4: Configure Each Menu Option

#### Under "Liquid Glass" Option:
1. Search for: **"Text"**
2. Add: **"Text"** action
3. Type inside it: `liquid`
4. Search for: **"Set Variable"**
5. Add: **"Set Variable"**
6. Variable Name: `StyleChoice`
7. Value: **Text** (should auto-select)

#### Under "Classic Vibe" Option:
1. Add: **"Text"** action
2. Type inside it: `jewel`
3. Add: **"Set Variable"**
4. Variable Name: `StyleChoice`
5. Value: **Text**

---

### Step 5: Call API (After Menu, Outside All Options)

⚠️ Make sure this is AFTER the "End Menu" action!

#### Action 5: Get Contents of URL
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

#### Action 6: Get Dictionary
- Search for: **"Get Dictionary"**
- Add: **"Get Dictionary from Input"**
- Input: **Contents of URL** (from previous action)

#### Action 7: Check for Errors (Crucial Debugging)
- Search for: **"Get Value"**
- Add: **"Get Dictionary Value"**
- Key: `error`
- Dictionary: **Dictionary**
- Search for: **"If"**
- Add: **"If"**
- Input: **Dictionary Value** (the error value)
- Condition: **has any value**
  - Search for: **"Show Alert"**
  - Add: **"Show Alert"**
  - Message: Select **Dictionary Value** (the error text)
  - Search for: **"Stop"**
  - Add: **"Stop This Shortcut"**
- End If

#### Action 8: Get Images Array
- Search for: **"Get Value"**
- Add: **"Get Dictionary Value"**
- Key: Type `images`
- Dictionary: **Dictionary** (from previous action)

#### Action 8: Loop Through Images
- Search for: **"Repeat"**
- Add: **"Repeat with Each"**
- Each item in: **Dictionary Value** (images array)

---

### Step 6: Inside the Repeat Loop

#### Action 9: Get Image Data
- Add: **"Get Dictionary Value"**
- Key: `image`
- Dictionary: **Repeat Item**

#### Action 10: Decode Base64
- Search for: **"Base64"**
- Add: **"Base64 Encode"**
- Change it to: **"Base64 Decode"** (tap the action, toggle)
- Input: **Dictionary Value** (from previous action)

#### Action 11: Save to Photos
- Search for: **"Save"**
- Add: **"Save to Photo Album"**
- Photo: **Base64 Decoded**
- Album: **Recents** (or create a custom album)

---

### Step 7: Add Completion Notification

⚠️ This should be AFTER the "End Repeat" action!

#### Action 12: Show Notification
- Search for: **"Show Notification"**
- Add: **"Show Notification"**
- Message: `✅ CoverShare images saved to Photos!`

---

## Visual Workflow Summary

```
1. Receive URLs from Share Sheet
2. Get Text from Input
3. Set Variable → SongQuery
4. Choose from Menu "Select Image Style"
   ├─ Liquid Glass → Text "liquid" → Set Variable StyleChoice
   └─ Classic Vibe → Text "jewel" → Set Variable StyleChoice
5. Get Contents of URL (POST to API)
6. Get Dictionary from Input
7. Check for Error
   └─ If Error exists → Show Alert & Stop
8. Get Dictionary Value (key: "images")
9. Repeat with Each (loop through images)
    ├─ Get Dictionary Value (key: "image")
    ├─ Base64 Decode
    └─ Save to Photo Album
10. Show Notification "Images saved!"
```

---

## How to Use

### From Spotify:
1. Open **Spotify** app
2. Play any song
3. Tap **⋯** (More) → **Share**
4. Scroll down and tap **CoverShare**
5. Select your preferred style
6. Wait 5-10 seconds
7. Images appear in Photos! 🎉

### From QQ Music:
1. Open **QQ Music** app
2. Play any song
3. Tap **Share** button
4. Copy the share link
5. Open **Shortcuts** app
6. Run **CoverShare** shortcut
7. Paste the QQ Music link when prompted
8. Select your preferred style
9. Wait 5-10 seconds
10. Images appear in Photos! 🎉

---

## Troubleshooting

### "No input provided"
- Make sure you're sharing from Spotify or QQ Music
- The share link should look like:
  - Spotify: `open.spotify.com/track/...`
  - QQ Music: `y.qq.com/n/ryqq/songDetail/...`

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

- Works with Spotify and QQ Music
- Creates high-resolution PNG images
- Images have transparent backgrounds
- Perfect for sharing on social media

Enjoy! 🎵
