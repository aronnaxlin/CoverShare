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

#### Action 1: Get Input from Share Sheet OR Clipboard
我们需要支持两种输入方式：
1. 从 Spotify 的 Share Sheet 获取
2. 从剪贴板读取（用于 QQ音乐等应用）

**步骤：**
- Search for: **"Receive"**
- Add: **"Receive URLs from Share Sheet"** or **"Receive Any Input"**
- ⚠️ **重要**: 在这个 action 的设置中，打开 **"Show in Share Sheet"**

#### Action 2: Check if Input is Empty
因为 QQ音乐无法直接分享，我们需要在没有输入时从剪贴板读取：

- Search for: **"If"**
- Add: **"If"**
- Condition: **Shortcut Input** → **does not have any value**
- Inside the "If" block:
  - Search for: **"Get Clipboard"**
  - Add: **"Get Clipboard"**
  - Search for: **"Set Variable"**
  - Add: **"Set Variable"**
  - Variable Name: `ClipboardURL`
  - Value: **Clipboard** (from previous action)

#### Action 3: Combine Inputs
在 "End If" 之后（很重要！）：

- Search for: **"Text"**
- Add: **"Text"**
- Tap on the text field and select **"Select Magic Variable"**
- Add two variables:
  1. **Shortcut Input** (from Action 1)
  2. **ClipboardURL** (from Action 2)
- 这样无论是分享还是剪贴板都能工作

#### Action 4: Store Query
- Search for: **"Set Variable"**
- Add: **"Set Variable"**
- Variable Name: `SongQuery`
- Value: **Text** (from previous action)

#### Action 5: Show Style Menu
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

#### Action 6: Get Contents of URL
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

#### Action 7: Get Dictionary
- Search for: **"Get Dictionary"**
- Add: **"Get Dictionary from Input"**
- Input: **Contents of URL** (from previous action)

#### Action 8: Check for Errors (Crucial Debugging)
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

#### Action 9: Get Images Array
- Search for: **"Get Value"**
- Add: **"Get Dictionary Value"**
- Key: Type `images`
- Dictionary: **Dictionary** (from previous action)

#### Action 10: Loop Through Images
- Search for: **"Repeat"**
- Add: **"Repeat with Each"**
- Each item in: **Dictionary Value** (images array)

---

### Step 6: Inside the Repeat Loop

#### Action 11: Get Image Data
- Add: **"Get Dictionary Value"**
- Key: `image`
- Dictionary: **Repeat Item**

#### Action 12: Decode Base64
- Search for: **"Base64"**
- Add: **"Base64 Encode"**
- Change it to: **"Base64 Decode"** (tap the action, toggle)
- Input: **Dictionary Value** (from previous action)

#### Action 13: Save to Photos
- Search for: **"Save"**
- Add: **"Save to Photo Album"**
- Photo: **Base64 Decoded**
- Album: **Recents** (or create a custom album)

---

### Step 7: Add Completion Notification

⚠️ This should be AFTER the "End Repeat" action!

#### Action 14: Show Notification
- Search for: **"Show Notification"**
- Add: **"Show Notification"**
- Message: `✅ CoverShare images saved to Photos!`

---

## Visual Workflow Summary

```
1. Receive URLs from Share Sheet
2. If Shortcut Input is empty
   └─ Get Clipboard → Set Variable ClipboardURL
3. Text (combine Shortcut Input + ClipboardURL)
4. Set Variable → SongQuery
5. Choose from Menu "Select Image Style"
   ├─ Liquid Glass → Text "liquid" → Set Variable StyleChoice
   └─ Classic Vibe → Text "jewel" → Set Variable StyleChoice
6. Get Contents of URL (POST to API)
7. Get Dictionary from Input
8. Check for Error
   └─ If Error exists → Show Alert & Stop
9. Get Dictionary Value (key: "images")
10. Repeat with Each (loop through images)
    ├─ Get Dictionary Value (key: "image")
    ├─ Base64 Decode
    └─ Save to Photo Album
11. Show Notification "Images saved!"
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
3. Tap **Share** button → **Copy Link** (复制链接)
4. Open **Shortcuts** app
5. Run **CoverShare** shortcut
6. Shortcut will automatically read from clipboard
7. Select your preferred style
8. Wait 5-10 seconds
9. Images appear in Photos! 🎉

💡 **提示**: 因为QQ音乐不支持系统分享菜单，所以需要先复制链接，然后运行Shortcut。Shortcut会自动从剪贴板读取链接。

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
