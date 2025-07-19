#!/usr/bin/env python3
"""
簡化版影片字幕檢視器 - 僅使用內建模組
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def open_browser():
    """延遲開啟瀏覽器"""
    time.sleep(2)
    webbrowser.open('http://localhost:8000')

def main():
    PORT = 8000
    
    print("=== 影片字幕同步檢視器 ===")
    print()
    print("伺服器將在 http://localhost:8000 啟動")
    print("瀏覽器會自動開啟應用程式")
    print("按 Ctrl+C 停止伺服器")
    print()
    
    # 在背景開啟瀏覽器
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # 啟動HTTP伺服器
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        try:
            print(f"伺服器已啟動在 port {PORT}")
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n伺服器已停止")

if __name__ == "__main__":
    main()