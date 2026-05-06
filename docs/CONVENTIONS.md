# 编码约定

## CSS 命名（BEM-lite，按页前缀）

```
.{page-prefix}-{block}-{element}-{modifier}
```

例：
- `.aichat-msg-bubble--user`（AI 对话页 · 消息 · 气泡 · 用户态）
- `.cf-filter-bar`（文案管理 · 筛选栏）
- `.wb-stat-card`（工作台 · 统计卡）

**通用组件**不带页前缀：
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.form-input`, `.form-select`, `.form-error`
- `.status-pill.status-pass`
- `.toast`, `.modal-overlay`

## JS 函数命名

| 类型 | 规则 | 例 |
|---|---|---|
| 页面级渲染 | `render{Page}{Block}` | `renderWorkbench()`, `renderAiMessages()` |
| 页面级事件 | `{action}{Page}{Subject}` | `openAiChat()`, `closeAiChat()`, `applyCopyFilters()` |
| 数据获取 | `get{Subject}` | `getCurrentUserInitial()` |
| 工具函数 | 动词开头 | `escapeHtml()`, `copyText()`, `formatDate()` |

**禁止**：
- 单字母命名（`f()` / `x` 除非是循环变量 i/j）
- 过度缩写（`renderUsrLstWthFltrs()` ❌ → `renderUserListWithFilters()` ✓）

## SVG 图标

- 只在 `scripts/core/icons.js` 的 `ICON_PATHS` 里加新图标
- 渲染统一用 `I('iconName', size)` 或 `IL('iconName', size)`
- **禁止**在业务 JS 里写 inline `<svg>...`（除非是带渐变/动画的特殊图标）

## 颜色

- 永远用 CSS 变量（`var(--primary)` 等），不要写死 `#6366f1`
- 新加颜色 → 加到 `styles/_tokens.css` 的 `:root`

## 动画

- 通用过渡用 `var(--transition)`
- 圆角用 `var(--radius)` / `var(--radius-sm)`

## 文件大小硬限

| 文件类型 | 单文件最大行数 | 超过怎么办 |
|---|---|---|
| `styles/pages/*.css` | 600 行 | 拆分子文件，如 `ai-chat.css` → `ai-chat-base.css` + `ai-chat-knowledge.css` |
| `scripts/pages/*.js` | 800 行 | 同上 |
| `scripts/data/*.js` | 不限（数据嘛） | — |
| `partials/*.html` | 400 行 | 拆成多个 partial 后在 JS 里组装 |

## Mock 数据

- 数组对象字段保持稳定 schema（接 API 时会一一对应）
- 字段名用 snake_case 或 camelCase 二选一，**全项目统一**：
  - 当前项目：`camelCase`（如 `submitTime`, `productName`）
  - 例外：API 透传字段（如 `bu_lead`）保留原样

## 提交规范（如果以后接 Git）

```
feat(ai-chat): add background knowledge panel
fix(copy-list): rule action button color
refactor(workbench): extract stat card to component
docs: update ARCHITECTURE.md
```

## ⚠️ 反模式（一旦出现，立刻重构）

1. 在 `pages/` 里写硬编码 mock 数据
2. 在通用组件 CSS 里出现页前缀类名
3. 跨页全局函数互相调用
4. 一个 JS 文件超过 800 行
5. CSS 用 `!important`（除非是覆盖第三方）
6. 新功能写到现有文件而不是新建对应模块文件
