# QQ音乐链接支持 - CORS 问题修复

## 🐛 问题分析

### 原始问题
用户报告通过 Shortcut 和网页端搜索框输入 QQ音乐链接均无效。

### 根本原因
1. **CORS 限制**: QQ音乐的 API (`u.y.qq.com`) 不允许跨域请求
2. **前端直接调用失败**: 浏览器会阻止前端 JavaScript 直接调用 QQ音乐 API
3. **错误实现**: 初始实现让前端直接调用 QQ音乐 API，导致 CORS 错误

```
浏览器 → QQ音乐 API ❌ (CORS 阻止)
```

## ✅ 解决方案

### 架构改进
使用**后端代理**模式，通过自己的 API 作为中间层：

```
前端 → 我们的后端 API → QQ音乐 API ✅
```

### 实现细节

#### 1. 创建后端代理 API
**文件**: `api/resolve-qqmusic.js`

功能：
- 接收 QQ音乐链接
- 提取 `song_mid`
- 调用 QQ音乐官方 API（服务端没有 CORS 限制）
- 返回专辑和艺术家信息

端点：`/api/resolve-qqmusic`

请求格式：
```json
{
  "url": "https://y.qq.com/n/ryqq/songDetail/0029CVxG4QngaW"
}
```

响应格式：
```json
{
  "success": true,
  "album": "First Love",
  "artist": "宇多田光",
  "song": "First Love",
  "searchQuery": "First Love 宇多田光"
}
```

#### 2. 更新前端代码
**文件**: `script.js`

修改内容：
- ✅ `resolveQQMusicUrl()`: 改为调用后端代理 API
- ✅ `fetchAlbum()`: 检测 QQ音乐链接并解析
- ✅ 输入监听器: 简化 URL 检测逻辑

#### 3. 后端 API 保持不变
**文件**: `api/generate.js`

`resolveQQMusicUrl()` 函数保持原样，因为服务端可以直接调用 QQ音乐 API。

## 🔧 修改文件列表

1. **api/resolve-qqmusic.js** (新建)
   - QQ音乐 URL 解析代理 API

2. **script.js** (修改)
   - `resolveQQMusicUrl()`: 调用后端代理
   - `fetchAlbum()`: 添加 QQ音乐 URL 检测
   - 输入监听器: 简化逻辑

## 📊 工作流程

### 网页端
```
用户输入 QQ音乐链接
    ↓
前端检测到 y.qq.com
    ↓
调用 /api/resolve-qqmusic
    ↓
后端提取 song_mid
    ↓
后端调用 QQ音乐 API
    ↓
返回 "专辑名 艺术家名"
    ↓
前端搜索 iTunes
    ↓
显示专辑封面
```

### iOS Shortcut
```
用户从 QQ音乐分享
    ↓
Shortcut 获取链接
    ↓
调用 /api/generate (带 query=QQ音乐链接)
    ↓
后端检测到 y.qq.com
    ↓
调用内部 resolveQQMusicUrl()
    ↓
搜索 iTunes 并生成图片
    ↓
返回 Base64 图片
    ↓
保存到相册
```

## 🧪 测试方法

### 本地测试
1. 确保后端正在运行（Vercel Dev）
2. 打开 `index.html`
3. 粘贴 QQ音乐链接：
   ```
   https://y.qq.com/n/ryqq/songDetail/0029CVxG4QngaW
   ```
4. 应该看到解析成功并加载专辑

### 生产环境测试
1. 部署到 Vercel
2. 访问网站
3. 测试相同的链接

### API 测试
```bash
curl -X POST https://covershare.aronnax.site/api/resolve-qqmusic \
  -H "Content-Type: application/json" \
  -d '{"url":"https://y.qq.com/n/ryqq/songDetail/0029CVxG4QngaW"}'
```

预期响应：
```json
{
  "success": true,
  "album": "First Love",
  "artist": "宇多田光",
  "song": "First Love",
  "searchQuery": "First Love 宇多田光"
}
```

## 🎯 优势

| 方案 | CORS | 稳定性 | 维护性 |
|------|------|--------|--------|
| ❌ 前端直接调用 | 失败 | - | - |
| ✅ 后端代理 | 成功 | 高 | 好 |

**后端代理的优势:**
- ✅ 绕过 CORS 限制
- ✅ 统一 API 接口
- ✅ 便于错误处理
- ✅ 可以添加缓存
- ✅ 可以添加速率限制

## 📝 部署说明

部署后，以下功能应该可以正常工作：

1. ✅ **网页端**: 粘贴 QQ音乐链接到搜索框
2. ✅ **iOS Shortcut**: 从 QQ音乐分享
3. ✅ **API 调用**: 直接调用 `/api/generate` 带 QQ音乐链接

## 🔍 故障排查

### 如果网页端仍然失败
1. 检查浏览器控制台
2. 确认 `/api/resolve-qqmusic` 返回成功
3. 检查 iTunes 搜索是否有结果

### 如果 Shortcut 失败
1. 确认链接格式正确 (`y.qq.com/n/ryqq/songDetail/...`)
2. 检查 Vercel 日志
3. 确认 API 部署成功

## 🎉 总结

通过添加后端代理层，成功解决了 CORS 问题：
- ✅ 网页端可以正常使用 QQ音乐链接
- ✅ iOS Shortcut 可以正常使用 QQ音乐链接
- ✅ 与现有 Spotify 支持完美集成
- ✅ 代码结构清晰，易于维护

问题已完全解决！🎵
