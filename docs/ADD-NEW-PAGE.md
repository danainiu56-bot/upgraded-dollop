# 新增一个页面 - AI Agent 操作手册

> 假设要加一个新页面叫 **「市场洞察」**（market-insight），按以下 5 步操作。

## Step 1：建三件套

```bash
touch partials/market-insight.html
touch styles/pages/market-insight.css
touch scripts/pages/market-insight.js
```

## Step 2：写 HTML（partials/market-insight.html）

```html
<section id="market-insight-view" class="market-insight-view" style="display:none;">
  <header class="mi-header">
    <h2>市场洞察</h2>
  </header>
  <div class="mi-content" id="mi-content">
    <!-- 由 JS 动态渲染 -->
  </div>
</section>
```

> **关键**：根元素 `id="{page}-view"`，类名前缀 `.mi-*`（市场洞察 → mi）

## Step 3：写 CSS（styles/pages/market-insight.css）

```css
/* ===== 市场洞察 · 页面级样式（仅 .mi-* / .market-insight-view） ===== */
.market-insight-view {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.mi-header {
  padding: 24px 28px 12px;
}
.mi-content {
  padding: 0 28px 32px;
}
.mi-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
```

## Step 4：写 JS（scripts/pages/market-insight.js）

```javascript
// ============================================
// 市场洞察 · 页面逻辑
// 命名约定：函数前缀 mi*；状态前缀 mi*
// ============================================

let miState = {
  loaded: false,
  data: [],
};

function showMarketInsightView() {
  // 1. 隐藏其它视图
  hideAllListMainViews();
  // 2. 显示自己
  const view = document.getElementById('market-insight-view');
  if (view) {
    view.style.display = 'flex';
    miRender();
  }
  // 3. 持久化
  if (typeof saveView === 'function') saveView('market-insight');
  // 4. 高亮侧栏菜单
  highlightSidebar('market-insight');
}

function miRender() {
  const c = document.getElementById('mi-content');
  if (!c) return;
  c.innerHTML = `
    <div class="mi-card">
      <h3>测试卡片</h3>
      <p>这里是市场洞察内容</p>
    </div>
  `;
}
```

## Step 5：在入口 HTML 注册

打开 `创建需求-上传页面.html`，在 4 处地方加引用：

```html
<!-- 1. 引入 CSS（在其它页面 CSS 后） -->
<link rel="stylesheet" href="styles/pages/market-insight.css">

<!-- 2. 引入 partial（用 fetch 注入） -->
<script>
fetch('partials/market-insight.html').then(r => r.text()).then(html => {
  document.querySelector('#list-page .list-main').insertAdjacentHTML('beforeend', html);
});
</script>

<!-- 3. 引入 JS（在其它页面 JS 后） -->
<script src="scripts/pages/market-insight.js"></script>
```

```javascript
// 4. 在 scripts/core/router.js 的 onMenuClick 里加路由
function onMenuClick(id) {
  // ...现有 case...
  if (id === 'market-insight') {
    showMarketInsightView();
    return;
  }
}

// 5. 在 restoreSavedView 里加恢复
function restoreSavedView() {
  // ...
  if (view === 'market-insight') {
    goToList();
    showMarketInsightView();
  }
}
```

## ✅ 完成检查清单

- [ ] 文件在正确目录（`partials/` / `styles/pages/` / `scripts/pages/`）
- [ ] 类名全部带 `.mi-` 前缀
- [ ] 函数全部带 `mi` 前缀（除了 `showMarketInsightView`）
- [ ] 没有 mock 数据写在 JS 里（如有，移到 `scripts/data/market.js`）
- [ ] 在 `index.html` 的 4 个位置都加了引用
- [ ] 视图状态注入了 `saveView` / `restoreSavedView`
- [ ] 刷新页面能正常显示，且刷新后停在该视图

## 反例（不要这样写）

```javascript
// ❌ 写在 ai-chat.js 里
function renderMarketInsight() { ... }

// ❌ 在 market-insight.css 写
.aichat-msg { color: red; }

// ❌ 在 market-insight.js 调
openAiChat('xxx');  // 跨页调用！
```

如果新页面需要复用 AI 对话功能，应该把对话功能抽到 `scripts/core/` 或专门的 `scripts/components/` 目录。
