# 项目架构（AI 必读）

> 任何 AI Agent 在改这个项目代码前，**必须先读完本文档**。否则会写出和现有约定冲突的代码。

## 项目定位

「产品到营销系统」前端原型 —— 用来快速验证 UI/UX，**不是**生产级 Vue/React 应用。

- 单页应用（SPA），所有页面切换通过 `display: none/block` + `sessionStorage` 持久化
- 零构建工具：原生 HTML + CSS + JS，浏览器直接跑
- 数据全是 mock，未来接 API 时只改 `scripts/data/`

## 目录速查（2026-04-24 重构完成版）

```
创建需求-上传页面.html       1123 行 · 入口（HTML 模版 + link/script）
创建需求-上传页面.html.backup 9883 行 · 重构前的备份

styles/                      ←  17 个 CSS 文件，4979 行
  _tokens.css               (37)   设计变量（颜色/间距/圆角/动画时长）
  _animations.css           (11)   keyframes
  components/                       通用组件（多页面复用）
    button.css              (25)
    card.css                (35)
    form.css                (59)
    sku-select.css          (227)
    editable.css            (45)
    divider.css             (13)
    toast.css               (34)
  pages/                            页面级（一页一文件，互不污染）
    topbar.css              (99)
    layout.css              (23)
    wizard.css              (828)   step1 + step2 + 解析中
    result.css              (1337)  结果页 8 模块
    demand-list.css         (841)   需求管理列表
    copy-list.css           (12)    文案管理 wrapper
    workbench.css           (294)   工作台
    ai-chat.css             (1059)  AI 文案对话页

scripts/
  core/                      ← 5 个文件，460 行 · 基础设施（无业务）
    icons.js                (98)   ICON_PATHS / SVG / SVGL / I / IL
    toast.js                (22)   showToast
    utils.js                (65)   editableField / setByPath / copyText / ...
    router.js               (205)  视图切换 + sessionStorage
    livereload.js           (70)   开发期自动刷新

  data/                      ← 10 个文件，~500 行 · 所有 mock 数据
    req-types.js            (66)   需求类型/站点/子品类字典
    persons.js              (12)   人员选择器
    skus.js                 (83)   SKU 库
    demand-list.js          (20)   需求管理列表 mock
    copy-list.js            (28)   文案管理列表 mock + 状态色
    result-mock.js          (187)  结果页 8 模块完整 mock
    ai-skills.js            (35)   AI Skills + Tools + 欢迎示例
    ai-history.js           (14)   AI 历史对话
    bg-knowledge.js         (35)   AI 背景知识 27 项
    score-rules.js          (13)   AI 评测打分规则

  pages/                     ← 6 个文件，~3000 行 · 页面级业务逻辑
    topbar.js               (57)   日期 + 静态图标注入
    wizard.js               (765)  step1/2 + 飞书 + 上传 + 解析
    result.js               (648)  结果页 8 模块 render + 弹窗
    demand-list.js          (379)  需求管理列表 + sidebar
    copy-list.js            (279)  文案管理（cf* 前缀）
    ai-chat.js              (973)  AI 对话最大模块

  main.js                    ← DOMContentLoaded 入口（40 行）

partials/                    ← (空，留作未来扩展)

docs/                        ← AI 必读文档
  ARCHITECTURE.md           你正在读的位置
  CONVENTIONS.md            命名规则 + 文件大小硬限 + 反模式
  ADD-NEW-PAGE.md           新增页面操作手册（5 步）

产品文档/                    ← Mason 的 PM 工作区
原型预览/                    ← 其它静态 HTML 原型
dev-server.py                ← 多线程本地开发服务器（含 API proxy + CORS 修复）
```

## 5 条铁律

### 1. 命名前缀绑定文件

| 前缀 | CSS 文件 | JS 文件 |
|---|---|---|
| `.wb-*` / `wb*()` | `styles/pages/workbench.css` | `scripts/pages/workbench.js` |
| `.cf-*` / `copyXxx()` | `styles/pages/copy-list.css` | `scripts/pages/copy-list.js` |
| `.aichat-*` / `aiXxx()` | `styles/pages/ai-chat.css` | `scripts/pages/ai-chat.js` |
| `.list-*` | `styles/pages/demand-list.css` | `scripts/pages/demand-list.js` |
| `.result-*` | `styles/pages/result.css` | `scripts/pages/result.js` |
| `.step-*` / `.wizard*` | `styles/pages/wizard.css` | `scripts/pages/wizard.js` |
| `.topbar-*` | `styles/pages/topbar.css` | `scripts/pages/topbar.js` |

**违反此规则的代价**：你以为只动了 A 页面，其实意外影响了 B 页面（之前已经发生过 N 次）。

### 2. 数据 / 视图 / 逻辑分离

- `scripts/data/*.js` 只放数据：常量、mock 数组、字典
- `scripts/pages/*.js` 只放渲染 + 交互
- 永远不要在 `pages/` 里写 mock 数组

### 3. 一页 = 三件套

每个页面恰好对应：
- `partials/{page}.html`（HTML 模版）
- `styles/pages/{page}.css`（样式）
- `scripts/pages/{page}.js`（逻辑）

**新增页面**就复制三件套（参考 `docs/ADD-NEW-PAGE.md`）。

### 4. 全局禁止跨页 import

- `pages/copy-list.js` **禁止**调用 `pages/ai-chat.js` 的内部函数
- 真要共用就放 `scripts/core/`
- 共用样式就放 `styles/components/`
- 共用数据就放 `scripts/data/`

### 5. 入口文件只许有 `<link>` / `<script>` / `<div id="root">`

`创建需求-上传页面.html` **不写业务代码**，全靠引用其它文件。

## 状态管理

- 视图状态：`sessionStorage['__cursor_current_view']`（`list / workbench / wizard:1 / result / ai-chat` 等）
- 表单状态：`sessionStorage['__cursor_step1_form']`
- 这两个都通过 `scripts/core/router.js` 提供的 API 读写，**不要直接访问 sessionStorage**

## 加载顺序（index.html 中固定）

```html
<!-- 1. 设计变量 + 重置 -->
<link rel="stylesheet" href="styles/_tokens.css">
<link rel="stylesheet" href="styles/_reset.css">
<link rel="stylesheet" href="styles/_icons.css">

<!-- 2. 通用组件 -->
<link rel="stylesheet" href="styles/components/...">

<!-- 3. 页面样式 -->
<link rel="stylesheet" href="styles/pages/...">

<!-- 4. 基础设施 -->
<script src="scripts/core/icons.js"></script>
<script src="scripts/core/toast.js"></script>
<script src="scripts/core/utils.js"></script>
<script src="scripts/core/router.js"></script>

<!-- 5. 数据 -->
<script src="scripts/data/...">

<!-- 6. 页面逻辑 -->
<script src="scripts/pages/...">

<!-- 7. 入口 -->
<script src="scripts/main.js"></script>

<!-- 8. 开发辅助（最后） -->
<script src="scripts/core/livereload.js"></script>
```

## 启动方式

```bash
cd /Users/mason/Desktop/Cursor/
python3 dev-server.py
# 访问 http://localhost:8765/创建需求-上传页面.html
```

## 重构历史

- v1（~9883 行单文件）→ v2（按方案 A 拆分）于 2026-04 完成
- 备份在 `创建需求-上传页面.html.backup`，万一炸了可以 `cp .backup` 还原
