# CoverShare 🎵

[English](./README.md) | [简体中文](./README-CN.md)
#### 本应用由Google Gemini 3.0 Pro生成

---

一个时尚的单页 Web 应用，用于生成和分享漂亮的音乐专辑封面卡片。搜索任何专辑，CoverShare 都会根据专辑封面的调色板创建一个动态的、液体风格的卡片。

![CoverShare Screenshot](./demo.png)

---

## 🌐 线上体验

**[https://musicshare.aronnax.site](https://musicshare.aronnax.site)**

## ✨ 功能特性

- **专辑搜索**: 使用 iTunes Search API 即时查找专辑。
- **动态卡片生成**: 自动为任何专辑创建视觉上吸引人的卡片。
- **炫彩“液体”背景**: 卡片背景是根据专辑封面主色调动态生成的漂亮渐变。
- **色彩增强**: 自定义算法会增强提取的颜色，确保为每张卡片提供充满活力且美观的主题。
- **高质量导出**: 将生成的卡片下载为高分辨率的透明背景 PNG 文件，非常适合分享。
- **现代 UI**:
    -   支持亮色和暗色模式。
    -   多语言界面 (英语, 简体中文, 繁體中文)。
    -   完全响应式设计，适配桌面和移动设备。
- **零依赖**: 使用原生 JavaScript、HTML 和 CSS 构建，无需构建步骤。

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, 原生 JavaScript (ES6+)
- **API**:
    -   [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) 用于获取专辑数据。
- **库**:
    -   [html2canvas.js](https://html2canvas.hertzen.com/): 用于捕获 DOM 元素并将其导出为图像。
    -   [Color Thief](https://lokeshdhakar.com/projects/color-thief/): 用于从专辑封面中提取调色板。
- **字体 & 图标**:
    -   Google Fonts (Roboto)
    -   Material Icons

## 🚀 工作原理

1.  **搜索**: 用户输入搜索词 (例如 "周杰伦 范特西")。
2.  **获取**: 应用调用 iTunes Search API 获取专辑详情，包括封面图片的 URL。
3.  **颜色提取**: 专辑封面加载后，`Color Thief` 库会从图像中提取主色调色板。
4.  **颜色处理**: 一个自定义的 `boostColor` 函数将主要的 RGB 颜色转换为 HSL，调整其饱和度和亮度，使其更加鲜艳，并确保它们适合作为背景。
5.  **渲染卡片**: 处理后的颜色被设置为卡片元素上的 CSS 自定义属性 (`--bg-color-1`, `--bg-color-2`)。这些属性随后被用于一个复杂的 `radial-gradient` (径向渐变) 来创建标志性的“液体”背景效果。
6.  **下载**: 当用户点击下载按钮时:
    -   调用 `html2canvas` 来渲染卡片元素。
    -   关键步骤：一个 `onclone` 回调函数会简化截图过程中的 CSS。它将复杂的 `radial-gradient` 替换为更简单的 `linear-gradient` (线性渐变)，并移除 `backdrop-filter` 等不兼容的效果。这确保了在没有视觉瑕疵的情况下获得干净、高质量的渲染。
    -   画布输出被转换为 PNG 数据 URL 并触发下载。

## ⚙️ 安装与使用

这是一个独立的项目，上手非常简单：

1.  克隆此仓库:
    ```sh
    git clone <repository-url>
    ```
2.  进入项目目录:
    ```sh
    cd <repository-folder>
    ```
3.  在你喜欢的浏览器中打开 `index.html` 文件。

就这样！无需安装或构建过程。

## 📄 许可证

该项目基于 MIT 许可证开源。

---

*由 Google Gemini 辅助编码。*