/* ============================================
   Livereload 本地开发自动刷新（GET 全文 + 内容 hash 比对）
   抽取自 创建需求-上传页面.html
   ============================================ */

(function () {
  if (location.protocol === 'file:') {
    console.warn('%c[livereload] file:// 协议无法监听文件变化，请通过本地服务器访问，例如：\n  cd %c"' + decodeURIComponent(location.pathname.replace(/[^/]+$/, '')) + '"%c && python3 -m http.server 8765','color:#f59e0b','color:#0ea5e9','color:#f59e0b');
    return;
  }

  const POLL_MS = 700;          // 700ms 轮询
  const MAX_FAILS = 30;         // 连续失败 30 次才放弃（约 20s）
  let baseHash = null;
  let fails = 0;
  let inflight = false;

  function hash(s) {
    // 简易 53-bit hash，避免 32-bit 碰撞
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  async function tick() {
    if (inflight) return;
    inflight = true;
    try {
      const url = location.pathname + '?_lr=' + Date.now();
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      const h = hash(text);
      if (baseHash === null) {
        baseHash = h;
        console.log('%c[livereload] 已就绪 ✓ 监听文件变化中（' + POLL_MS + 'ms 轮询，长度=' + text.length + '）','color:#10b981;font-weight:600;');
      } else if (h !== baseHash) {
        console.log('%c[livereload] 文件已变更，自动刷新…','color:#10b981;font-weight:600;');
        location.reload();
        return;
      }
      fails = 0;
    } catch (e) {
      fails++;
      if (fails > MAX_FAILS) {
        console.warn('[livereload] 连续 ' + MAX_FAILS + ' 次拉取失败，已停止');
        return;
      }
    } finally {
      inflight = false;
    }
    setTimeout(tick, POLL_MS);
  }

  // 立刻跑一次（建立基线），之后每 700ms 一次
  tick();

  // 切回标签页时立即检查一次，避免你切走又切回时有延迟
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });

  // 暴露一个手动触发的全局方法，方便你在 Console 里调试：__lr.check()
  window.__lr = { check: tick, reset: () => { baseHash = null; tick(); } };
})();
