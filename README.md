# 影片字幕同步檢視器

一個簡單的網頁應用程式，可以將 MP4 影片每 30 秒截取一張圖片，並同步顯示對應時間點的 SRT 字幕內容。

## 功能特色

- 📹 支援 MP4 影片檔案上傳
- 📝 支援 SRT 字幕檔案解析
- ⏱️ 每 30 秒自動截取影片畫面
- 🖼️ 左側顯示影片截圖，右側顯示對應字幕
- 📱 響應式設計，支援手機瀏覽
- 🎨 美觀的使用者介面

## 使用方法

### 方法一：直接開啟網頁
1. 下載所有檔案到本地目錄
2. 在命令列中執行：
```bash
python3 -m http.server 8000
```
3. 開啟瀏覽器訪問 http://localhost:8000

### 方法二：使用 GitHub Pages
1. Fork 這個專案
2. 在 GitHub 設定中啟用 Pages
3. 直接在線上使用

## 檔案結構

```
├── index.html      # 主頁面
├── styles.css      # 樣式表
├── script.js       # JavaScript 邏輯
├── server.py       # Python 伺服器 (可選)
└── README.md       # 說明文件
```

## 技術規格

- 純前端實作，無需後端伺服器
- 使用 HTML5 Canvas 處理影片
- 支援 SRT 字幕格式解析
- 截圖間隔：30 秒
- 圖片格式：JPEG (80% 品質)

## 瀏覽器相容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 開源授權

MIT License