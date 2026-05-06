# Bugfix · dev-server 单线程被 livereload + 并发请求拖死

## 现象

浏览器访问 `http://localhost:8765/创建需求-上传页面.html` 报 404 / 长时间无响应。

## 根因

`dev-server.py` 基于 Python 标准库 `socketserver.TCPServer + http.server.SimpleHTTPRequestHandler`，**默认单线程**。

随着重构进度推进：
- Step 1 后：浏览器加载 17 个 CSS + 1 个 HTML
- Step 2 后：再加 10 个 data JS
- Step 3 后：再加 4 个 core JS + 1 个 livereload
- 同时 livereload 每 700ms 轮询一次主 HTML

加起来一次刷新会触发 ~32 个并发请求，单线程 server 串行处理 → 后到的请求排队 → 浏览器超时 → 误报 404。

## 修复

```python
# dev-server.py
class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """多线程 + 端口可重用。
    多线程很重要：避免 livereload 长轮询请求阻塞其它静态文件请求。"""
    allow_reuse_address = True
    daemon_threads = True   # 主进程退出时自动 kill 子线程
```

加一个 mixin 类一行代码搞定。`daemon_threads = True` 保证 Ctrl+C 时所有处理线程立刻退出，不会留下僵尸进程。

## 验证

并发 6 个不同 URL：
```
HTTP 200  /scripts/data/ai-skills.js
HTTP 200  /scripts/core/icons.js
HTTP 200  /scripts/core/livereload.js
HTTP 200  /styles/components/button.css
HTTP 200  /styles/_tokens.css
HTTP 200  /styles/pages/ai-chat.css
```

全部成功，0 超时。

## 经验教训

📌 **教训**：本地开发服务器要用多线程或异步框架。单线程 server 只适合「演示型 demo」，一旦同时有 polling + 多文件加载就会暴露并发缺陷。

📌 **副作用**：之前一直存在的偶发"页面卡顿"很可能也是这个根因，不只是这次的 404。

## 行动项

- [x] dev-server.py 加 ThreadingMixIn（2026-04-24）
- [x] 重启服务并验证 6 并发全部 200（2026-04-24）

---

📅 2026-04-24
👤 Mason + AI（Claude Opus 4.7）
状态：✅ 已修复
🔗 相关文件：`dev-server.py` 第 101-105 行
