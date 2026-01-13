# CoverShare iOS Shortcut - Setup Guide

## Quick Overview
This shortcut allows you to generate beautiful vinyl cover images directly from **Spotify** or **QQ Music** share links.

**Features:**
-   Supports **Spotify** (Track & Album links)
-   Supports **QQ Music** (Share Sheet & Clipboard)
-   Generates "Liquid Glass" or "Classic Vibe" styles

---

## Setup Instructions

### Step 1: Create New Shortcut
1.  Open **Shortcuts** app.
2.  Tap **+** to create a new shortcut.
3.  Rename it to: **CoverShare**.

### Step 2: Configure Share Sheet
1.  Tap the **(i)** icon at the bottom.
2.  Enable **Show in Share Sheet**.
3.  Ensure **URLs** and **Text** are selected types.

### Step 3: Add Actions (Follow Exactly)

#### Logic Overview
We need to handle two cases:
1.  **Share Sheet**: Input comes directly from the app (Spotify).
2.  **Clipboard**: For apps that don't share pure links (QQ Music), copying the link and running the shortcut is more reliable.

#### Action 1: Handle Input
1.  Add **if** action:
    -   Condition: **Shortcut Input** `does not have any value`
2.  Inside the **If** block:
    -   Add **Get Clipboard**
    -   Add **Set Variable**: Name `SongQuery` to **Clipboard**
3.  Inside the **Otherwise** block:
    -   Add **Get Text from Input** (Select "Shortcut Input" magic variable)
    -   Add **Set Variable**: Name `SongQuery` to **Text**
4.  Ends with **End If**.

#### Action 2: Choose Style
1.  Add **Choose from Menu** with prompt "Select Style".
2.  **Option 1: Liquid Glass**:
    -   Add **Text** action: `liquid`
    -   Add **Set Variable**: Name `StyleChoice` to **Text**
3.  **Option 2: Classic Vibe**:
    -   Add **Text** action: `jewel`
    -   Add **Set Variable**: Name `StyleChoice` to **Text**

#### Action 3: Generate Image (Call API)
1.  Add **Get Contents of URL**.
    -   URL: `https://cover-share.vercel.app/api/generate`
    -   Method: **POST**
    -   Headers:
        -   `Content-Type`: `application/json`
    -   Request Body: **JSON**
        -   Key `query`: **SongQuery** (Variable)
        -   Key `style`: **StyleChoice** (Variable)

#### Action 4: Process Result
1.  Add **Get Dictionary from Input**.
2.  Add **Get Value for Key**: Key `images`.
3.  Add **Repeat with Each Item** (in Dictionary Value).
    -   Inside Loop:
        -   **Get Value for Key**: Key `image` in **Repeat Item**.
        -   **Base64 Decode**: Decode the image data.
        -   **Save to Photo Album**.
4.  End Loop.

#### Action 5: Success Message
1.  Add **Show Notification**: "Cover Generated Successfully!"

---

## Usage

### For Spotify
1.  Go to a Song or Album.
2.  Tap **Share** -> **More** -> **CoverShare**.

### For QQ Music
1.  Go to a Song.
2.  Tap **Share** -> **Copy Link**.
3.  Open Shortcuts app (or use widget) and run **CoverShare**.
