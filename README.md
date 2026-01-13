# CoverShare 🎵

> *Generate beautiful album cover cards - on web or iOS*

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://covershare.aronnax.site)
[![iOS Shortcut](https://img.shields.io/badge/iOS-Shortcut-blue)](https://www.icloud.com/shortcuts/c7e8f009c93f46ae9e78119e15a97a27)

A stylish web application that generates beautiful, shareable album cover cards with two unique styles: **Liquid Glass** (vibrant gradients) and **Classic Vibe** (jewel case aesthetic).

![CoverShare Screenshot](./demo.png)

---

## 🚀 Quick Start

### 🌐 Web App
**[Launch CoverShare →](https://covershare.aronnax.site)**

Search any album, customize the style, and download high-res PNG images.

### 📱 iOS Shortcut
**[Download Shortcut →](https://www.icloud.com/shortcuts/c7e8f009c93f46ae9e78119e15a97a27)**

Share songs from Spotify → Choose style → Images save to Photos automatically!

**Setup Required:** You need to deploy the API first (5 min, free). See [iOS Setup Guide](./docs/SHORTCUT_SETUP.md).

---

## ✨ Features

### 🎨 Two Beautiful Styles
- **Liquid Glass**: Dynamic gradients extracted from album art colors
- **Classic Vibe**: Realistic CD jewel case with professional typography

### 🎵 Album Search
- Instant search via iTunes API
- Multi-language support (English, 简体中文, 繁體中文)
- Supports both US and Taiwan stores
- **Direct URL support**: Paste Spotify or QQ Music share links

### 🖼️ High-Quality Export
- Transparent PNG downloads
- Perfect for social media sharing
- Dynamic font sizing for long titles

### 📱 iOS Integration
- Share directly from Spotify or QQ Music
- Generate images via Shortcuts
- Auto-save to Photos

### 🎨 Modern UI
- Light & Dark mode
- Fully responsive design
- Zero build dependencies (vanilla JS/CSS)

---

## 📱 iOS Shortcuts Setup

### Prerequisites
1. Deploy the API to Vercel (free, 5 minutes) - [Deployment Guide](./docs/deployment-guide.md)
2. Have Spotify app installed on iPhone

### Installation

**Option 1: Direct Download (Recommended)**

Click here to install: **[Download CoverShare Shortcut](https://www.icloud.com/shortcuts/c7e8f009c93f46ae9e78119e15a97a27)**

**Option 2: Manual Setup**

Follow the step-by-step guide: [iOS Shortcut Setup Guide](./docs/SHORTCUT_SETUP.md)

### Usage

1. Open Spotify → Play any song
2. Tap **Share** → **CoverShare**
3. Choose style (Liquid Glass or Classic Vibe)
4. Wait 5-10 seconds
5. Images saved to Photos! 🎉

---

## 🛠️ Local Development

### Web App

This is a self-contained project - no build tools needed!

```sh
# Clone repository
git clone <repository-url>
cd CoverShare

# Open in browser
open index.html
```

> **Note:** Download `UnboundedSans.otf` and `UnboundedSans.ttf` for full font support.

### API Deployment

For iOS Shortcuts integration, deploy the API to Vercel:

```sh
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [Deployment Guide](./docs/deployment-guide.md) for detailed instructions.

---

## 📚 Documentation

- 📖 [Deployment Guide](./docs/deployment-guide.md) - Deploy API to Vercel
- 📱 [iOS Shortcut Setup](./docs/SHORTCUT_SETUP.md) - Step-by-step Shortcut configuration
- 🔧 [API Documentation](./docs/api-documentation.md) - API reference

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- [html2canvas.js](https://html2canvas.hertzen.com/) - DOM to image conversion
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/) - Color palette extraction

**Backend (for iOS Shortcuts)**
- Vercel Serverless Functions
- Puppeteer + Chromium for server-side rendering

**APIs**
- [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)
- Spotify URL parsing (for iOS Shortcuts)
- QQ Music API integration (for URL sharing)

**Fonts**
- [UnboundedSans](https://github.com/maoken-fonts/unbounded-sans)
- Google Fonts (Noto Sans, Roboto)
- Material Icons

---

## 💡 How It Works

### Color Extraction
1. Album art loaded from iTunes API
2. Color Thief extracts dominant color palette
3. Colors converted to HSL and enhanced for vibrancy
4. Dynamic gradients applied to card background

### Image Generation
- **Web**: html2canvas captures DOM element
- **iOS Shortcut**: Puppeteer renders on Vercel, returns Base64 PNG

### Music Platform Integration
**Spotify & QQ Music Support:**
1. Receives share URL from Spotify or QQ Music
2. API extracts album/artist information:
   - **Spotify**: Parses metadata from OpenGraph tags
   - **QQ Music**: Queries official API with song ID
3. Searches iTunes API for album artwork
4. Generates cover images and returns Base64 PNG
5. iOS Shortcut saves images to Photos automatically

---

## 📄 License

MIT License - Open source and free to use!

---

## 🙏 Credits

*This project was generated with assistance from **Google Gemini 3.0 Pro***