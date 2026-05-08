/* ============================================
   AI 文案对话页（最大模块，含 3 列布局 + 对话 + 评分 + 背景知识）
   openAiChat / renderAi* / 顶栏评测·提交 / scoreAiMessage / renderBgKnowledge / Skills / 拖拽 / 收起等
   抽取自 创建需求-上传页面.html line 3158-4124
   ============================================ */

const bgKnowledgeExpanded = new Set();
const bgKnowledgeSelected = new Set(); // 元素是 "CODE|子项" 字符串

/** 评测弹框：关联的原文消息 id + 建议列表（用于「根据建议重新生成」） */
let aiScoreModalState = { sourceMessageId: null, suggestions: [] };
let aiSubmitModalState = { sourceMessageId: null };
const AI_CUSTOM_SKILLS_KEY = '__cursor_ai_custom_skills';
let aiCustomSkillsLoaded = false;
let skillHubState = { scope: 'all', category: 'all', query: '' };
const AI_STREAM_INTERVAL_MS = 24;
const AI_STREAM_CHUNK_SIZE = 5;
let aiStreamTimers = {};
let copyDraftPickerState = {
  row: null,
  drafts: [],
  selectedId: '',
  ratings: {},
  regenRound: 0,
};

function onAiScoreModalKeydown(e) {
  if (e.key === 'Escape') closeAiScoreModal();
}

function onAiSkillHubKeydown(e) {
  if (e.key === 'Escape') closeAiSkillHub();
}


// 历史对话示例数据


let aiChatState = {
  sku: '',
  productName: '',
  activeTaskIndex: null,
  activeSkill: '',
  leftTab: 'info',
  rightTab: 'knowledge',
  messages: [],
  outputs: [],
};

function openAiChat(sku, name, opts = {}) {
  // 隐藏其它视图
  document.getElementById('list-page').classList.remove('show');
  document.getElementById('wizard-main').style.display  = 'none';
  document.getElementById('result-main').style.display  = 'none';
  // 隐藏 topbar（与向导/结果页保持一致）
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'none';
  // 显示 AI 对话页
  const view = document.getElementById('ai-chat-view');
  view.style.display = 'flex';
  loadCustomAiSkills();
  // 写入上下文
  aiChatState.sku = sku || aiChatState.sku || 'PO17X4011';
  aiChatState.productName = name || aiChatState.productName || '7格便携药盒';
  syncAiTaskFromContext();
  if (opts.draft) {
    clearAiStreamTimers();
    aiChatState.messages = [];
    aiChatState.outputs = [];
  }
  // 副标题已移除
  // 顶部 / 侧栏图标
  const titleIcon = document.getElementById('aichat-title-icon');
  if (titleIcon) titleIcon.innerHTML = aiHeaderIconSvg();
  const leftTitle = document.getElementById('aichat-left-title');
  if (leftTitle) leftTitle.innerHTML = aiChatState.leftTab === 'history'
    ? `<span class="aichat-side-icon">${I('history', 14)}</span>历史对话`
    : `<span class="aichat-side-icon">${I('database', 14)}</span>待处理任务`;
  updateAiRightTitle();
  const newChatBtn = document.getElementById('aichat-newchat-btn');
  if (newChatBtn) newChatBtn.innerHTML = I('newChat', 14);
  const skillSettingsBtn = document.getElementById('aichat-skill-settings-btn');
  if (skillSettingsBtn) skillSettingsBtn.innerHTML = I('cog', 14);
  renderAiHeaderActions();
  // 渲染
  renderAiLeftPanel();
  renderAiSkills();
  renderAiMessages();
  renderAiRightPanel();
  if (opts.draft) {
    appendSelectedCopyDraft(opts.draft, opts.row || null);
  }
  // 持久化视图
  if (typeof saveView === 'function') saveView('ai-chat');
}

function closeAiChat() {
  closeAiScoreModal();
  closeAiSkillHub();
  clearAiStreamTimers();
  document.getElementById('ai-chat-view').style.display = 'none';
  // 回到列表页（保持 demand-mgr 视图）
  document.getElementById('list-page').classList.add('show');
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.style.display = 'flex';
  if (typeof showDemandMgrView === 'function') showDemandMgrView();
}

// ---- 文案生成：3 个候选初稿选择 ----
function getCopyDraftRowKey(row) {
  return [row.sku, row.type, row.submit_time].join('|');
}

function findCopyDraftRow(encodedKey) {
  const key = decodeURIComponent(encodedKey || '');
  const list = typeof COPY_LIST_DATA !== 'undefined' ? COPY_LIST_DATA : [];
  return list.find(row => getCopyDraftRowKey(row) === key) || null;
}

function openCopyDraftPicker(encodedKey) {
  const row = findCopyDraftRow(encodedKey);
  if (!row) {
    showToast('未找到对应文案需求', 'warning');
    return;
  }
  copyDraftPickerState = {
    row,
    drafts: buildCopyDraftCandidates(row, 0),
    selectedId: '',
    ratings: {},
    regenRound: 0,
  };
  const best = copyDraftPickerState.drafts.reduce((a, b) => (b.score > a.score ? b : a), copyDraftPickerState.drafts[0]);
  copyDraftPickerState.selectedId = best.id;
  renderCopyDraftPicker();
  const modal = document.getElementById('copy-draft-picker');
  if (modal) modal.classList.add('show');
}

function closeCopyDraftPicker() {
  const modal = document.getElementById('copy-draft-picker');
  if (modal) modal.classList.remove('show');
}

function regenerateCopyDrafts() {
  const row = copyDraftPickerState.row;
  if (!row) return;
  copyDraftPickerState.regenRound += 1;
  copyDraftPickerState.drafts = buildCopyDraftCandidates(row, copyDraftPickerState.regenRound);
  copyDraftPickerState.ratings = {};
  const best = copyDraftPickerState.drafts.reduce((a, b) => (b.score > a.score ? b : a), copyDraftPickerState.drafts[0]);
  copyDraftPickerState.selectedId = best.id;
  renderCopyDraftPicker();
  showToast('已重新生成 3 个候选版本', 'success');
}

function buildCopyDraftCandidates(row, round = 0) {
  const name = row.name || '产品';
  const brand = row.brand || 'AUVON';
  const site = row.site || 'US';
  const keyword = row.type && row.type.includes('Title') ? 'Title' : (row.type && row.type.includes('TD') ? 'TD' : 'Listing');
  const scoreShift = round % 3;
  return [
    {
      id: 'conversion',
      title: '转化导向版',
      tag: '推荐购买理由',
      score: 88 + scoreShift,
      content: `【Title】\n${brand} ${name}, Practical ${keyword} Copy for Daily Use, Portable and Easy to Understand\n\n【TD-1】\n突出用户最关心的使用场景：日常使用、便携收纳和快速识别，让用户第一眼知道产品解决什么问题。\n\n【TD-2】\n将容量、安全和使用便利性放在前 3 个卖点，降低用户决策成本。\n\n【TD-3】\n结尾强化适用人群与购买信心，适合 ${site} 站点用户的浏览习惯。`,
      reasons: ['卖点顺序清晰，先回答购买理由', '适合进入对话后继续补强场景细节', '关键词覆盖中等，后续可再加强 SEO'],
    },
    {
      id: 'seo',
      title: 'SEO 覆盖版',
      tag: '推荐搜索承接',
      score: 91 - scoreShift,
      content: `【Title】\n${brand} ${name}, Weekly Pill Organizer, 7 Day Pill Box, Portable Travel Medicine Case for Vitamins and Daily Use\n\n【TD-1】\n自然覆盖 weekly pill organizer、7 day pill box、travel medicine case 等核心搜索词。\n\n【TD-2】\n用标题前半段承接高意图关键词，Bullet 中补充容量、便携、安全等转化信息。\n\n【TD-3】\n整体结构适合作为第一版 Listing 初稿，再根据合规和品牌语气精修。`,
      reasons: ['核心关键词前置，搜索承接更强', 'Title 和 TD 结构完整，适合快速进入审核', '语言略偏功能型，可在对话中调得更自然'],
    },
    {
      id: 'geo',
      title: '本地化表达版',
      tag: '推荐语言自然度',
      score: 86 + (scoreShift > 1 ? 1 : 0),
      content: `【Title】\n${brand} ${name}, Easy Daily Organizer for Home, Office and Travel, Simple Storage for Vitamins and Medicine\n\n【TD-1】\nUse clear, direct wording that matches ${site} shoppers' reading habits and avoids exaggerated medical claims.\n\n【TD-2】\nFocus on practical benefits: easy planning, portable storage, clear compartments and daily convenience.\n\n【TD-3】\nKeep claims verifiable and friendly, making the copy easier to adapt for FAQ, image text and Rufus style answers.`,
      reasons: ['表达更自然，适合美区用户阅读', '合规风险较低，避免医疗功效承诺', 'SEO 强度略低，后续可补关键词'],
    },
  ];
}

function renderCopyDraftPicker() {
  const body = document.getElementById('copy-draft-body');
  const row = copyDraftPickerState.row;
  if (!body || !row) return;
  const esc = typeof escapeAiHtml === 'function' ? escapeAiHtml : (x) => String(x || '');
  body.innerHTML = `
    <div class="copy-draft-context">
      <span><b>SKU</b>${esc(row.sku)}</span>
      <span><b>产品</b>${esc(row.name)}</span>
      <span><b>需求类型</b>${esc(row.type)}</span>
      <span><b>站点</b>${esc(row.site)}</span>
      <span><b>优先级</b>${typeof getRowPriority === 'function' ? getRowPriority(row) : 'P1'}</span>
    </div>
    <div class="copy-draft-grid">
      ${copyDraftPickerState.drafts.map(draft => renderCopyDraftCard(draft, esc)).join('')}
    </div>
  `;
}

function renderCopyDraftCard(draft, esc) {
  const selected = copyDraftPickerState.selectedId === draft.id;
  const rating = copyDraftPickerState.ratings[draft.id] || '';
  const ratingBtns = ['好', '一般', '不可用'].map(item => `
    <button type="button" class="${rating === item ? 'active' : ''}" onclick="rateCopyDraft('${draft.id}', '${item}')">${item}</button>
  `).join('');
  return `
    <article class="copy-draft-card ${selected ? 'selected' : ''}" onclick="selectCopyDraft('${draft.id}')">
      <div class="copy-draft-card-head">
        <div>
          <h4>${esc(draft.title)}</h4>
          <p>${esc(draft.tag)}</p>
        </div>
        <div class="copy-draft-score">
          <strong>${draft.score}</strong>
          <span>/100</span>
        </div>
      </div>
      <div class="copy-draft-preview">${esc(draft.content)}</div>
      <div class="copy-draft-reasons">
        <div class="copy-draft-label">AI 自评理由</div>
        <ul>${draft.reasons.map(reason => `<li>${esc(reason)}</li>`).join('')}</ul>
      </div>
      <div class="copy-draft-rating" onclick="event.stopPropagation()">
        <span>人工评分</span>
        <div>${ratingBtns}</div>
      </div>
      <button type="button" class="copy-draft-select" onclick="event.stopPropagation();selectCopyDraft('${draft.id}')">
        ${selected ? '已选择' : '选择此版本'}
      </button>
    </article>
  `;
}

function selectCopyDraft(id) {
  copyDraftPickerState.selectedId = id;
  renderCopyDraftPicker();
}

function rateCopyDraft(id, rating) {
  copyDraftPickerState.ratings[id] = rating;
  renderCopyDraftPicker();
}

function enterAiChatWithSelectedDraft() {
  const row = copyDraftPickerState.row;
  const draft = copyDraftPickerState.drafts.find(item => item.id === copyDraftPickerState.selectedId);
  if (!row || !draft) {
    showToast('请先选择一个候选版本', 'warning');
    return;
  }
  closeCopyDraftPicker();
  openAiChat(row.sku, row.name, { row, draft });
}

function appendSelectedCopyDraft(draft, row) {
  const rating = copyDraftPickerState.ratings[draft.id] || '未评分';
  const text = `已选择：${draft.title} · AI 自评分 ${draft.score}\n人工评分：${rating}\n\n${draft.content}\n\n【AI 自评理由】\n${draft.reasons.map((reason, i) => `${i + 1}. ${reason}`).join('\n')}\n\n你可以继续告诉我：加强关键词、调整语气、降低合规风险，或改成更适合 ${row && row.site ? row.site : '目标站点'} 的表达。`;
  appendAiMessage('bot', text, { actions: ['copy', 'regen'], stream: false });
  aiChatState.outputs.unshift({
    title: `${draft.title} · 初稿`,
    body: draft.content,
  });
}

// ---- 左侧渲染 ----
function switchAiLeftTab(btn, tab) {
  document.querySelectorAll('#aichat-left .aichat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  aiChatState.leftTab = tab;
  const titleEl = document.getElementById('aichat-left-title');
  if (titleEl) {
    titleEl.innerHTML = tab === 'history'
      ? `<span class="aichat-side-icon">${I('history', 14)}</span>历史对话`
      : `<span class="aichat-side-icon">${I('database', 14)}</span>待处理任务`;
  }
  renderAiLeftPanel();
}

function renderAiLeftPanel() {
  const body = document.getElementById('aichat-left-body');
  if (!body) return;
  if (aiChatState.leftTab === 'history') {
    body.innerHTML = renderAiHistoryList();
    return;
  }
  const ed = (path, val) => `<span class="val" contenteditable="true" data-ai-path="${path}" oninput="onAiContextEdit(event)">${val || ''}</span>`;
  // 复用 MOCK_DATA
  const p = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.product) || {};
  const sell = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.selling) || { usp: [], ksp: [], osp: [] };
  const seo  = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.seo) || { rows: [] };
  const comp = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.competitor) || [];
  body.innerHTML = `
    ${renderAiTaskList()}
    ${aiSection('product', I('cube', 14), '产品信息', `
      <div class="ai-row"><span class="lab">产品图</span><span class="val">${p.image ? `<img src="${p.image}" style="width:64px;height:64px;object-fit:contain;border:1px solid var(--border);border-radius:4px;background:white;" />` : '—'}</span></div>
      <div class="ai-row"><span class="lab">SKU</span><span class="val"><span style="font-family:'SF Mono',Monaco,monospace;font-weight:600;color:var(--primary);">${aiChatState.sku || '—'}</span><span style="color:var(--text-muted);"> · </span>${aiChatState.productName || ''}</span></div>
      <div class="ai-row"><span class="lab">产品定位</span>${ed('product.positioning', p.positioning || '')}</div>
      <div class="ai-row"><span class="lab">适用病症</span><span class="val">${(p.indications || []).map(i => `<span class="ai-tag">${i}</span>`).join('') || '—'}</span></div>
    `)}
    ${aiSection('selling', I('target', 14), '卖点信息', aiSellingHtml(sell, ed))}
    ${aiSection('seo', I('search', 14), 'SEO 关键词表', `
      <table class="ai-mini-table">
        <thead><tr><th>关键词</th><th style="width:60px;text-align:right;">Rank</th><th style="width:50px;">相关</th></tr></thead>
        <tbody>
          ${(seo.rows || []).slice(0, 6).map((r, i) => `
            <tr>
              <td>${ed('seo.rows.' + i + '.keyword', r.keyword)}</td>
              <td style="text-align:right;">${r.rank}</td>
              <td><span class="ai-tag" style="background:#d1fae5;color:#065f46;">${r.relevance || '强'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `)}
    ${aiSection('comp', I('diff', 14), '竞品信息', comp.map((c, i) => `
      <div class="ai-comp-row">
        <img src="${c.image || ''}" alt="${c.brand || ''}" />
        <div style="flex:1;min-width:0;">
          <div class="ai-comp-name">${c.brand || ('竞品 ' + (i+1))}</div>
          <div class="ai-comp-asin">${c.asin || ''} ｜ ${c.rankSmall || ''}</div>
        </div>
      </div>
      <div class="ai-row" style="padding-left:0;"><span class="lab">Title</span>${ed('competitor.' + i + '.title', c.title || '')}</div>
    `).join('') || '<div style="color:var(--text-muted);font-size:12px;">暂无竞品数据</div>')}
  `;
}

function getAiPendingTasks() {
  if (typeof COPY_LIST_DATA === 'undefined') return [];
  return COPY_LIST_DATA.filter(row => row.status === '待处理');
}

function syncAiTaskFromContext() {
  const tasks = getAiPendingTasks();
  if (!tasks.length) {
    aiChatState.activeTaskIndex = null;
    return;
  }
  const idx = tasks.findIndex(row =>
    row.sku === aiChatState.sku &&
    (!aiChatState.productName || row.name === aiChatState.productName)
  );
  if (idx >= 0) {
    aiChatState.activeTaskIndex = idx;
    return;
  }
  aiChatState.activeTaskIndex = null;
}

function renderAiTaskList() {
  const esc = typeof escapeAiHtml === 'function' ? escapeAiHtml : (x) => String(x || '');
  const tasks = getAiPendingTasks();
  if (!tasks.length) {
    return `
      <div class="ai-task-panel">
        <div class="ai-task-head">
          <span class="ai-task-title">${I('basic', 14)}任务列表</span>
          <span class="ai-task-count">0</span>
        </div>
        <div class="ai-task-empty">暂无待处理文案任务</div>
      </div>`;
  }
  syncAiTaskFromContext();
  return `
    <div class="ai-task-panel">
      <div class="ai-task-head">
        <span class="ai-task-title">${I('basic', 14)}任务列表</span>
        <span class="ai-task-count">${tasks.length} 个待处理</span>
      </div>
      <div class="ai-task-list">
        ${tasks.map((row, idx) => `
          <button type="button" class="ai-task-item ${idx === aiChatState.activeTaskIndex ? 'active' : ''}" onclick="selectAiTask(${idx})">
            <span class="ai-task-main">
              <span class="ai-task-name">${esc(row.type)}：${esc(row.name)}</span>
              <span class="ai-task-meta">${esc(row.site)} · ${esc(row.brand)} · ${esc(row.sub)} · ${esc(row.date)}</span>
            </span>
            <span class="ai-task-sku">${esc(row.sku)}</span>
          </button>
        `).join('')}
      </div>
    </div>`;
}

function selectAiTask(idx) {
  const tasks = getAiPendingTasks();
  const row = tasks[idx];
  if (!row) return;
  aiChatState.activeTaskIndex = idx;
  aiChatState.sku = row.sku || aiChatState.sku;
  aiChatState.productName = row.name || aiChatState.productName;
  renderAiLeftPanel();
  renderAiMessages();
  showToast(`已切换任务：${row.type} · ${row.name}`, 'success');
}

function aiSellingHtml(sell, ed) {
  const groups = [
    { key: 'usp', code: 'USP', name: '独特卖点', color: '#6366f1' },
    { key: 'ksp', code: 'KSP', name: '核心卖点', color: '#ef4444' },
    { key: 'osp', code: 'OSP', name: '补充卖点', color: '#10b981' },
  ];
  return groups.map(g => `
    <div style="margin-bottom:10px;">
      <div style="font-size:12px;font-weight:600;color:${g.color};margin-bottom:4px;">${g.code} · ${g.name}</div>
      ${(sell[g.key] || []).map((s, i) => `
        <div class="ai-row" style="padding:2px 0;">
          <span class="lab">${i + 1}.</span>
          ${ed('selling.' + g.key + '.' + i + '.title', s.title)}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function aiSection(id, icon, title, body) {
  return `
    <div class="ai-section" id="ai-sec-${id}">
      <div class="ai-section-head" onclick="toggleAiSection('${id}')">
        <span class="ai-section-title"><span class="ai-section-icon">${icon}</span>${title}</span>
        <span class="ai-section-toggle">▼</span>
      </div>
      <div class="ai-section-body">${body}</div>
    </div>`;
}

function renderAiHistoryList() {
  if (!AI_CHAT_HISTORY.length) {
    return '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:30px 0;">暂无历史对话</div>';
  }
  return `
    <div class="ai-history-list">
      ${AI_CHAT_HISTORY.map(h => `
        <div class="ai-history-item ${h.sku === aiChatState.sku ? 'current-sku' : ''}" onclick="loadAiHistory('${h.id}')">
          <div class="ai-history-row1">
            <span class="ai-history-title">${h.title}</span>
            <span class="ai-history-time">${h.time}</span>
          </div>
          <div class="ai-history-preview">${h.preview}</div>
          <div class="ai-history-meta">
            <span class="ai-history-sku">${h.sku}</span>
            ${h.skill ? `<span class="ai-history-skill">${h.skill}</span>` : ''}
            <span class="ai-history-count">${h.count} 条消息</span>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// 顶部标题用的渐变 AI 芯片图标（科技感强）
function aiHeaderIconSvg() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aiHeaderG" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0"   stop-color="#6366f1"/>
        <stop offset="0.5" stop-color="#8b5cf6"/>
        <stop offset="1"   stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="url(#aiHeaderG)" stroke-width="1.6"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="url(#aiHeaderG)" opacity="0.95"/>
    <line x1="9" y1="1" x2="9" y2="4"   stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="15" y1="1" x2="15" y2="4" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="9" y1="20" x2="9" y2="23" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="15" y1="20" x2="15" y2="23" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="20" y1="9" x2="23" y2="9" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="20" y1="14" x2="23" y2="14" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="1" y1="9" x2="4" y2="9"   stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="1" y1="14" x2="4" y2="14" stroke="url(#aiHeaderG)" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

// 点击「基于上下文生成」卡片：直接生成 Amazon Title + 5 段 TD 示例
function generateAmazonTitleTD() {
  const sku  = aiChatState.sku || 'PO17X4011';
  const name = aiChatState.productName || '7格便携药盒';
  appendAiMessage('user', `基于左侧上下文，生成 Amazon Listing 的 Title 和 5 段 TD（${sku} · ${name}）`);
  setTimeout(() => {
    const reply =
`已基于左侧上下文（产品 / 卖点 / SEO / 竞品）生成 Amazon Listing 草稿：

【Title】
AUVON 7-Day Pill Organizer, BPA-Free Weekly Pill Box with 7 Compartments — Portable Pill Case for Vitamins, Supplements & Travel (Pink/Blue/Green/Purple/White)

【TD-1 · 7-DAY WEEKLY PLANNER】
Stay on track with 7 large daily compartments labeled MON–SUN. Each cell holds up to 25 aspirin-sized pills, perfect for managing chronic medications, daily vitamins, and supplements without the risk of missed or doubled doses.

【TD-2 · BPA-FREE FOOD-GRADE SAFETY】
Made of FDA-compliant, BPA-free polypropylene with FDA & CE certifications. Long-term safe contact with prescription pills, vitamins, and herbal supplements. Easy to wash and dishwasher safe.

【TD-3 · MOISTURE-PROOF SEALING】
Reinforced snap-shut lids paired with a soft silicone gasket form a 3-layer seal that locks out humidity, preserving the potency of your medications even when stored in a bathroom or kitchen.

【TD-4 · TRAVEL-FRIENDLY POCKET-SIZE】
Compact 20 cm slim profile fits inside any handbag, glove box, or carry-on. Includes a velvet drawstring travel pouch and shock-resistant outer shell so your pills stay organized on every trip.

【TD-5 · SENIOR-FRIENDLY DESIGN】
Bold high-contrast labels with extra-large typography and arthritis-friendly easy-open lids — designed with seniors in mind. Choose from 5 vibrant colors (Pink / Blue / Green / Purple / White) to color-code each family member.

— 你可以让我：
• 「换一个语气，重写 5 段 TD」
• 「针对 SEO 关键词 weekly pill organizer / 7 day pill case 调整密度」
• 「只生成 BP，去掉 Title」`;
    appendAiMessage('bot', reply, { actions: ['copy', 'regen'] });
  }, 500);
}

function startNewAiChat() {
  const ok = confirm('开启一个新的对话？\n当前的对话与已生成内容会被清空，但左侧上下文（产品 / 卖点 / SEO / 竞品）会保留。');
  if (!ok) return;
  clearAiStreamTimers();
  aiChatState.activeSkill = '';
  aiChatState.outputs = [];
  aiChatState.messages = [];
  renderAiSkills();
  renderAiMessages();
  renderAiRightPanel();
  showToast('已开启新对话', 'success');
}

function loadAiHistory(id) {
  const h = AI_CHAT_HISTORY.find(x => x.id === id);
  if (!h) return;
  showToast(`加载历史对话：${h.title}`, 'success');
  // 切回待处理任务 tab，并把示例消息 push 进当前对话
  appendAiMessage('bot', `已读取历史对话「${h.title}」（${h.sku}）的上下文，可继续基于其结果向我提问。\n\n摘要：${h.preview}`);
}

function toggleAiSection(id) {
  const el = document.getElementById('ai-sec-' + id);
  if (el) el.classList.toggle('collapsed');
}

function onAiContextEdit(e) {
  // 用户编辑左侧上下文时，可同步回 MOCK_DATA（沿用 result 页的 setByPath）
  const path = e.currentTarget.getAttribute('data-ai-path');
  if (typeof setByPath === 'function' && path) {
    setByPath(path, e.currentTarget.textContent);
  }
}

// ---- 右侧 ----
function renderAiRightPanel() {
  const body = document.getElementById('aichat-right-body');
  if (!body) return;
  if (aiChatState.rightTab === 'tools') {
    body.innerHTML = AI_TOOLS.map(t => `
      <div class="ai-tool-card" onclick="invokeAiTool('${t.id}')">
        <div class="ai-tool-head">
          <div class="ai-tool-icon" style="background:${t.color};">${I(t.iconKey, 16)}</div>
          <div class="ai-tool-title">${t.name}</div>
        </div>
        <div class="ai-tool-desc">${t.desc}</div>
      </div>
    `).join('');
  } else if (aiChatState.rightTab === 'knowledge') {
    body.innerHTML = renderBgKnowledge();
    // 搜索框聚焦保留
    const sk = document.getElementById('bg-knowledge-search');
    if (sk) sk.value = bgKnowledgeQuery;
  }
}

function renderBgKnowledge() {
  const q = bgKnowledgeQuery.trim().toLowerCase();
  const list = q
    ? BG_KNOWLEDGE.filter(item =>
        item.code.toLowerCase().includes(q) ||
        (item.children || []).some(c => c.toLowerCase().includes(q))
      )
    : BG_KNOWLEDGE;
  const selectedCount = bgKnowledgeSelected.size;
  return `
    <div class="bg-knowledge-search-bar">
      ${I('search', 14)}
      <input type="text" id="bg-knowledge-search" class="bg-knowledge-input"
             placeholder="搜索分类码或子项…"
             value="${bgKnowledgeQuery.replace(/"/g, '&quot;')}"
             oninput="onBgKnowledgeSearch(event)" />
      ${q ? `<button class="bg-knowledge-clear" onclick="clearBgKnowledge()" title="清除">${I('close', 12)}</button>` : ''}
    </div>
    <div class="bg-knowledge-toolbar">
      <span class="bg-knowledge-meta">共 ${list.length} 项${q ? ` / ${BG_KNOWLEDGE.length}` : ''}</span>
      <span class="bg-knowledge-selected-info">
        已选 <strong>${selectedCount}</strong>
        ${selectedCount ? `<button class="bg-k-mini-btn" onclick="clearBgSelected()">清空</button>
                          <button class="bg-k-mini-btn primary" onclick="applyBgSelected()">应用到对话</button>` : ''}
      </span>
    </div>
    <div class="bg-knowledge-list">
      ${list.length === 0
        ? '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:30px 0;">没有匹配的分类</div>'
        : list.map(item => {
            const expanded = bgKnowledgeExpanded.has(item.code);
            const total  = (item.children || []).length;
            const picked = (item.children || []).filter(c => bgKnowledgeSelected.has(item.code + '|' + c)).length;
            const cbState = picked === 0 ? '' : (picked === total ? 'checked' : 'indeterminate');
            return `
              <div class="bg-k-item ${expanded ? 'expanded' : ''}">
                <div class="bg-k-row" onclick="toggleBgKnowledge('${item.code}')">
                  <span class="bg-k-chevron">›</span>
                  <span class="bg-k-code">${highlightBg(item.code, q)}</span>
                  ${picked ? `<span class="bg-k-picked">${picked}/${total}</span>` : ''}
                </div>
                ${expanded ? `
                  <div class="bg-k-children">
                    ${(item.children || []).map(c => {
                      const key = item.code + '|' + c;
                      const checked = bgKnowledgeSelected.has(key);
                      return `
                        <label class="bg-k-child ${checked ? 'checked' : ''}">
                          <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleBgChild('${item.code}','${c.replace(/'/g,'\\\'')}', this.checked)" />
                          <span class="bg-k-cb-box"></span>
                          <span class="bg-k-child-text">${highlightBg(c, q)}</span>
                        </label>
                      `;
                    }).join('') || '<div class="bg-k-empty">无子项</div>'}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')
      }
    </div>
  `;
}

function highlightBg(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return text.substring(0, idx)
    + '<mark>' + text.substring(idx, idx + q.length) + '</mark>'
    + text.substring(idx + q.length);
}

function onBgKnowledgeSearch(e) {
  bgKnowledgeQuery = e.target.value;
  renderAiRightPanel();
  // 还原焦点（renderAiRightPanel 重建了 DOM）
  const sk = document.getElementById('bg-knowledge-search');
  if (sk) {
    sk.focus();
    sk.setSelectionRange(sk.value.length, sk.value.length);
  }
}

function clearBgKnowledge() {
  bgKnowledgeQuery = '';
  renderAiRightPanel();
}

function toggleBgKnowledge(code) {
  if (bgKnowledgeExpanded.has(code)) bgKnowledgeExpanded.delete(code);
  else bgKnowledgeExpanded.add(code);
  renderAiRightPanel();
}

function toggleBgChild(code, child, checked) {
  const key = code + '|' + child;
  if (checked) bgKnowledgeSelected.add(key);
  else         bgKnowledgeSelected.delete(key);
  renderAiRightPanel();
}

function toggleBgGroup(code, checked) {
  const item = BG_KNOWLEDGE.find(x => x.code === code);
  if (!item) return;
  (item.children || []).forEach(c => {
    const key = code + '|' + c;
    if (checked) bgKnowledgeSelected.add(key);
    else         bgKnowledgeSelected.delete(key);
  });
  renderAiRightPanel();
}

function clearBgSelected() {
  bgKnowledgeSelected.clear();
  renderAiRightPanel();
}

function applyBgSelected() {
  if (!bgKnowledgeSelected.size) return;
  // 按分类分组展示
  const grouped = {};
  bgKnowledgeSelected.forEach(k => {
    const [code, child] = k.split('|');
    if (!grouped[code]) grouped[code] = [];
    grouped[code].push(child);
  });
  const summary = Object.keys(grouped).map(code => `• ${code}：${grouped[code].join('、')}`).join('\n');
  appendAiMessage('user', `引用 ${bgKnowledgeSelected.size} 项背景知识：\n${summary}`);
  setTimeout(() => {
    appendAiMessage('bot', `已加入 ${bgKnowledgeSelected.size} 项背景知识参考：\n${summary}\n\n后续生成的文案会优先沿用上述子类的卖点结构与术语。`, { actions: ['copy'] });
  }, 300);
}

function switchAiRightTab(btn, tab) {
  document.querySelectorAll('#aichat-right .aichat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  aiChatState.rightTab = tab;
  updateAiRightTitle();
  renderAiRightPanel();
}

function updateAiRightTitle() {
  const el = document.getElementById('aichat-right-title');
  if (!el) return;
  const map = {
    knowledge: { icon: 'database', text: '背景知识' },
  };
  const cfg = map[aiChatState.rightTab] || map.knowledge;
  el.innerHTML = `<span class="aichat-side-icon">${I(cfg.icon, 14)}</span>${cfg.text}`;
}

function invokeAiTool(id) {
  const t = AI_TOOLS.find(x => x.id === id);
  if (!t) return;
  appendAiMessage('user', `调用工具：${t.name}`);
  setTimeout(() => {
    const sample = `已通过 [${t.name}] 完成调用：\n\n• 检索范围：与当前 SKU ${aiChatState.sku} 相关\n• 处理时间：≈ 2.3s\n• 结果已附加到上下文，可继续对话`;
    appendAiMessage('bot', sample, { actions: ['copy', 'regen'] });
  }, 400);
}

function removeAiOutput(idx) {
  aiChatState.outputs.splice(idx, 1);
  renderAiRightPanel();
}

// ---- Skills Hub 设置 ----
function loadCustomAiSkills() {
  if (aiCustomSkillsLoaded) return;
  aiCustomSkillsLoaded = true;
  try {
    const raw = sessionStorage.getItem(AI_CUSTOM_SKILLS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return;
    list.forEach(item => {
      if (!item || !item.id || AI_SKILLS.some(s => s.id === item.id)) return;
      AI_SKILLS.push(Object.assign({ custom: true, iconKey: 'sparkles', category: 'copywriting', visibility: '私有', version: 'v1', uses: 0 }, item));
    });
  } catch (e) {}
}

function saveCustomAiSkills() {
  try {
    const custom = AI_SKILLS.filter(s => s.custom).map(s => ({
      id: s.id,
      name: s.name,
      iconKey: s.iconKey || 'sparkles',
      desc: s.desc || '',
      category: s.category || 'copywriting',
      visibility: s.visibility || '私有',
      version: s.version || 'v1',
      uses: s.uses || 0,
      custom: true,
    }));
    sessionStorage.setItem(AI_CUSTOM_SKILLS_KEY, JSON.stringify(custom));
  } catch (e) {}
}

function getAiSkillCategory(skill) {
  if (skill.category) return skill.category;
  if (['package', 'manual', 'listing', 'titletd', 'faq', 'grass', 'news'].includes(skill.id)) return 'copywriting';
  if (['ad', 'video'].includes(skill.id)) return 'marketing';
  return 'general';
}

function getAiSkillMeta(skill, idx) {
  const cat = getAiSkillCategory(skill);
  const labels = { copywriting: 'copywriting', marketing: 'marketing', general: 'general' };
  return {
    category: cat,
    categoryLabel: labels[cat] || 'general',
    visibility: skill.visibility || '公开',
    version: skill.version || (skill.custom ? 'v1' : `v${(idx % 4) + 1}`),
    uses: typeof skill.uses === 'number' ? skill.uses : (idx * 17 + 31),
  };
}

function openAiSkillHub() {
  loadCustomAiSkills();
  const root = document.getElementById('skill-hub-modal');
  if (!root) return;
  root.classList.add('show');
  document.addEventListener('keydown', onAiSkillHubKeydown);
  renderAiSkillHub();
}

function closeAiSkillHub() {
  document.removeEventListener('keydown', onAiSkillHubKeydown);
  const root = document.getElementById('skill-hub-modal');
  if (root) root.classList.remove('show');
}

function renderAiSkillHub() {
  const body = document.getElementById('skill-hub-body');
  if (!body) return;
  const esc = typeof escapeAiHtml === 'function' ? escapeAiHtml : (x) => String(x || '');
  const attr = (x) => esc(x).replace(/"/g, '&quot;');
  const q = (skillHubState.query || '').trim().toLowerCase();
  const skills = AI_SKILLS.map((skill, idx) => Object.assign({}, skill, getAiSkillMeta(skill, idx)))
    .filter(skill => {
      if (skillHubState.scope === 'mine' && !skill.custom) return false;
      if (skillHubState.scope === 'public' && skill.visibility !== '公开') return false;
      if (skillHubState.category !== 'all' && skill.category !== skillHubState.category) return false;
      if (q && !`${skill.name} ${skill.desc} ${skill.categoryLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });

  body.innerHTML = `
    <div class="skill-hub-nav">
      <button class="skill-hub-nav-item active">${I('bolt', 13)}<span>Skills</span></button>
    </div>
    <div class="skill-hub-scope">
      ${[
        ['all', '全部'],
        ['mine', '我的 Skill'],
        ['public', '公共 Skill'],
      ].map(([key, label]) => `<button class="${skillHubState.scope === key ? 'active' : ''}" onclick="setSkillHubScope('${key}')">${label}</button>`).join('')}
    </div>
    <div class="skill-hub-toolbar">
      <input class="skill-hub-search" value="${attr(skillHubState.query)}" placeholder="搜索 Skills..." oninput="setSkillHubQuery(this.value)" />
      <select class="skill-hub-select" onchange="setSkillHubCategory(this.value)">
        <option value="all" ${skillHubState.category === 'all' ? 'selected' : ''}>全部分类</option>
        <option value="copywriting" ${skillHubState.category === 'copywriting' ? 'selected' : ''}>copywriting</option>
        <option value="marketing" ${skillHubState.category === 'marketing' ? 'selected' : ''}>marketing</option>
        <option value="general" ${skillHubState.category === 'general' ? 'selected' : ''}>general</option>
      </select>
      <button type="button" class="skill-hub-new-btn" onclick="createAiCustomSkill()">${I('plus', 13)}新增 Skill</button>
    </div>
    <div class="skill-hub-grid">
      ${skills.map(skill => renderAiSkillHubCard(skill, esc)).join('') || '<div class="skill-hub-empty">暂无匹配的 Skill</div>'}
    </div>
  `;
}

function renderAiSkillHubCard(skill, esc) {
  const canEdit = !!skill.custom;
  return `
    <div class="skill-card">
      <div class="skill-card-head">
        <h3>${esc(skill.name)}</h3>
        <div class="skill-card-badges">
          <span class="skill-card-public">${esc(skill.visibility)}</span>
          <span class="skill-card-version">${esc(skill.version)}</span>
        </div>
      </div>
      <p>${esc(skill.desc)}</p>
      <div class="skill-card-foot">
        <span class="skill-card-cat">${esc(skill.categoryLabel)}</span>
        <span class="skill-card-usage">${I('eye', 11)}${skill.uses}</span>
        <span class="skill-card-actions">
          <button type="button" title="应用" onclick="selectAiSkill('${skill.id}');closeAiSkillHub();">${I('check', 12)}</button>
          <button type="button" title="${canEdit ? '编辑' : '公共 Skill 不可编辑'}" ${canEdit ? `onclick="editAiCustomSkill('${skill.id}')"` : 'disabled'}>${I('edit', 12)}</button>
          <button type="button" title="${canEdit ? '删除' : '公共 Skill 不可删除'}" ${canEdit ? `onclick="deleteAiCustomSkill('${skill.id}')"` : 'disabled'}>${I('close', 12)}</button>
        </span>
      </div>
    </div>`;
}

function setSkillHubScope(scope) {
  skillHubState.scope = scope;
  renderAiSkillHub();
}

function setSkillHubCategory(category) {
  skillHubState.category = category;
  renderAiSkillHub();
}

function setSkillHubQuery(query) {
  skillHubState.query = query || '';
  renderAiSkillHub();
}

function createAiCustomSkill() {
  const name = prompt('请输入 Skill 名称');
  if (!name || !name.trim()) return;
  const desc = prompt('请输入 Skill 描述', '自定义文案生成能力') || '自定义文案生成能力';
  const id = 'custom-' + Date.now().toString(36);
  AI_SKILLS.unshift({
    id,
    name: name.trim(),
    iconKey: 'sparkles',
    desc: desc.trim(),
    category: 'copywriting',
    visibility: '私有',
    version: 'v1',
    uses: 0,
    custom: true,
  });
  saveCustomAiSkills();
  renderAiSkills();
  renderAiSkillHub();
  showToast('已新增 Skill', 'success');
}

function editAiCustomSkill(id) {
  const skill = AI_SKILLS.find(s => s.id === id && s.custom);
  if (!skill) return;
  const name = prompt('修改 Skill 名称', skill.name);
  if (!name || !name.trim()) return;
  const desc = prompt('修改 Skill 描述', skill.desc || '') || skill.desc || '';
  skill.name = name.trim();
  skill.desc = desc.trim();
  saveCustomAiSkills();
  renderAiSkills();
  renderAiSkillHub();
  showToast('已更新 Skill', 'success');
}

function deleteAiCustomSkill(id) {
  const idx = AI_SKILLS.findIndex(s => s.id === id && s.custom);
  if (idx < 0) return;
  if (!confirm('确认删除这个自定义 Skill？')) return;
  AI_SKILLS.splice(idx, 1);
  if (aiChatState.activeSkill === id) aiChatState.activeSkill = '';
  saveCustomAiSkills();
  renderAiSkills();
  renderAiSkillHub();
  showToast('已删除 Skill', 'success');
}

// ---- Skills ----
function renderAiSkills() {
  const wrap = document.getElementById('aichat-skills');
  if (!wrap) return;
  wrap.innerHTML = AI_SKILLS.map(s => `
    <button class="ai-skill ${aiChatState.activeSkill === s.id ? 'active' : ''}" onclick="selectAiSkill('${s.id}')" title="${s.desc}">
      <span class="ai-skill-icon">${I(s.iconKey, 13)}</span><span>${s.name}</span>
    </button>
  `).join('');
}

function selectAiSkill(id) {
  aiChatState.activeSkill = (aiChatState.activeSkill === id) ? '' : id;
  renderAiSkills();
}

// ---- Messages ----

// AI 头像（白色线框 · 神经网络 · 科技感）
function aiBotAvatarSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7"/>
    <circle cx="12" cy="12" r="2.2" fill="white" stroke="none"/>
    <circle cx="7"  cy="9"  r="1" fill="white" stroke="none"/>
    <circle cx="17" cy="9"  r="1" fill="white" stroke="none"/>
    <circle cx="7"  cy="15" r="1" fill="white" stroke="none"/>
    <circle cx="17" cy="15" r="1" fill="white" stroke="none"/>
    <line x1="7"  y1="9"  x2="12" y2="12"/>
    <line x1="17" y1="9"  x2="12" y2="12"/>
    <line x1="7"  y1="15" x2="12" y2="12"/>
    <line x1="17" y1="15" x2="12" y2="12"/>
  </svg>`;
}

function renderAiMessages() {
  const wrap = document.getElementById('aichat-messages');
  if (!wrap) return;
  if (!aiChatState.messages.length) {
    wrap.innerHTML = renderAiWelcome();
    wrap.scrollTop = 0;
    updateAiChatGlobalActions();
    return;
  }
  const userInitial = getCurrentUserInitial();
  const botSvg = aiBotAvatarSvg();
  const html = aiChatState.messages.map(m => `
    <div class="aichat-msg ${m.role}" data-msg-id="${m.id}">
      <div class="aichat-avatar">${m.role === 'user' ? userInitial : botSvg}</div>
      <div class="aichat-bubble">
        ${m.score ? renderAiScoreCard(m.score) : `<div style="white-space:pre-wrap;">${escapeAiHtml(m.text)}${m.streaming ? '<span class="ai-stream-cursor">▋</span>' : ''}</div>`}
        <div class="msg-meta">${m.time || ''}</div>
        ${renderAiMsgActions(m)}
      </div>
    </div>
  `).join('');
  wrap.innerHTML = html;
  wrap.scrollTop = wrap.scrollHeight;
  updateAiChatGlobalActions();
}

function renderAiMsgActions(m) {
  if (m.streaming) return '';
  if (!m.actions || !m.actions.length) return '';
  const map = {
    copy:   `<button class="msg-action-btn" onclick="copyAiMessage('${m.id}')">${I('copy',12)}<span>复制</span></button>`,
    regen:  `<button class="msg-action-btn" onclick="regenerateAi('${m.id}')">${I('refresh',12)}<span>重新生成</span></button>`,
  };
  return `<div class="msg-actions">${m.actions.map(a => map[a] || '').join('')}</div>`;
}

/** 顶部公共操作：评测 / 提交针对「最近一条可操作的 AI 正文」 */
function renderAiHeaderActions() {
  const wrap = document.getElementById('aichat-header-actions');
  if (!wrap) return;
  wrap.innerHTML = `
    <span class="aichat-action-hint" id="aichat-action-hint"></span>
    <button type="button" class="aichat-header-action-btn primary" id="aichat-btn-score" onclick="scoreCurrentAiOutput()">${I('checkc', 12)}<span>AI 评测打分</span></button>
    <button type="button" class="aichat-header-action-btn success" id="aichat-btn-submit" onclick="submitCurrentAiOutput()">${I('check', 12)}<span>提交审核</span></button>
  `;
  updateAiChatGlobalActions();
}

function getAiActionTargetMessage() {
  for (let i = aiChatState.messages.length - 1; i >= 0; i--) {
    const m = aiChatState.messages[i];
    if (m.role !== 'bot') continue;
    if (m.score) continue;
    if (m.streaming) continue;
    const t = (m.text || '').trim();
    if (t.length < 12) continue;
    if (t === '已完成 AI 评测') continue;
    if (/^✅ 已提交审核/.test(t)) continue;
    return m;
  }
  return null;
}

function updateAiChatGlobalActions() {
  const hint = document.getElementById('aichat-action-hint');
  const scoreBtn = document.getElementById('aichat-btn-score');
  const submitBtn = document.getElementById('aichat-btn-submit');
  if (!scoreBtn || !submitBtn) return;
  const m = getAiActionTargetMessage();
  if (!m) {
    scoreBtn.disabled = true;
    submitBtn.disabled = true;
    if (hint) hint.textContent = '暂无可评测 / 提交的 AI 正文，请先生成文案';
    return;
  }
  scoreBtn.disabled = false;
  submitBtn.disabled = false;
  if (hint) {
    const one = (m.text || '').replace(/\s+/g, ' ').trim();
    const preview = one.slice(0, 32);
    hint.textContent = one.length > 32 ? `对象：${preview}…` : `对象：${preview || '（空）'}`;
  }
}

function scoreCurrentAiOutput() {
  const m = getAiActionTargetMessage();
  if (!m) {
    showToast('暂无可评测的 AI 产出，请先生成文案', 'warning');
    return;
  }
  scoreAiMessage(m.id);
}

function submitCurrentAiOutput() {
  const m = getAiActionTargetMessage();
  if (!m) {
    showToast('暂无可提交的 AI 产出，请先生成文案', 'warning');
    return;
  }
  openAiSubmitModal(m.id);
}

// ===== AI 评测打分（弹框展示） =====

function computeAiScorePayload(messageId) {
  const m = aiChatState.messages.find(x => x.id === messageId);
  if (!m) return null;
  const text = m.text || '';
  const length = text.length;
  const seoKws = ['pill organizer', '7 day', 'weekly', 'BPA', 'medicine', 'vitamin'];
  const kwHits = seoKws.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
  const tdCount = (text.match(/【TD-\d+/g) || []).length;
  const banned = ['cure', 'best in the world', '100% safe', 'guaranteed'].filter(b => text.toLowerCase().includes(b.toLowerCase()));

  const items = SCORE_RULES.map(rule => {
    let s = 80;
    if (rule.key === 'title') {
      const title = (text.match(/【Title】[\s\S]*?(?=\n\n|【)/) || [''])[0].replace('【Title】', '').trim();
      const len = title.length;
      s = len >= 150 && len <= 200 ? 95 : (len > 80 ? 80 : 60);
    } else if (rule.key === 'keyword') {
      s = Math.min(100, 60 + kwHits * 8);
    } else if (rule.key === 'selling') {
      s = tdCount >= 5 ? 92 : (tdCount >= 3 ? 78 : 60);
    } else if (rule.key === 'geo') {
      const lower = text.toLowerCase();
      const geoSignals = ['us', 'amazon', 'travel', 'daily', 'senior', 'vitamin', 'supplement'].filter(k => lower.includes(k));
      const sensitiveSignals = ['culturally insensitive', 'offensive', 'misleading'].filter(k => lower.includes(k));
      s = Math.min(96, 72 + geoSignals.length * 4) - sensitiveSignals.length * 10;
    } else if (rule.key === 'compliance') {
      s = banned.length === 0 ? 100 : Math.max(50, 100 - banned.length * 15);
    } else if (rule.key === 'readable') {
      const avgSeg = length / (tdCount || 1);
      s = avgSeg > 200 && avgSeg < 600 ? 88 : 75;
    }
    const status = s >= 90 ? 'great' : (s >= 75 ? 'good' : (s >= 60 ? 'warn' : 'bad'));
    return Object.assign({}, rule, { score: s, status });
  });
  const total = Math.round(items.reduce((sum, it) => sum + it.score * it.weight / 100, 0));
  const grade = total >= 90 ? 'S' : (total >= 80 ? 'A' : (total >= 70 ? 'B' : 'C'));
  const summary =
    total >= 90 ? '🎉 整体质量很高，可以直接提交审核。' :
    total >= 80 ? '✅ 质量良好，建议小幅微调后提交。' :
    total >= 70 ? '⚠️ 基础合格，建议针对低分项进行优化后再提交。' :
                  '❗ 多项不达标，建议重新生成或人工大幅修改。';
  const suggestions = items.filter(i => i.score < 90).slice(0, 3).map(i => `• 【${i.name}】当前 ${i.score} 分，建议：${i.ideal}`);
  if (banned.length) suggestions.unshift(`• 【合规性】检测到风险词：${banned.join('、')}，请替换为合规表达`);

  return { total, grade, items, summary, suggestions, sourceId: messageId };
}

function scoreAiMessage(messageId) {
  const payload = computeAiScorePayload(messageId);
  if (!payload) return;
  openAiScoreModal(payload);
}

function openAiScoreModal(payload) {
  aiScoreModalState = {
    sourceMessageId: payload.sourceId,
    suggestions: Array.isArray(payload.suggestions) ? payload.suggestions.slice() : [],
  };
  const body = document.getElementById('aichat-score-modal-body');
  const root = document.getElementById('aichat-score-modal');
  if (!body || !root) return;
  body.innerHTML = renderAiScoreCard(payload);
  root.classList.add('show');
  document.addEventListener('keydown', onAiScoreModalKeydown);
}

function closeAiScoreModal() {
  document.removeEventListener('keydown', onAiScoreModalKeydown);
  const root = document.getElementById('aichat-score-modal');
  if (root) root.classList.remove('show');
  aiScoreModalState = { sourceMessageId: null, suggestions: [] };
}

/** 弹框内：根据评测建议插入一条用户指令并触发重新生成 */
function regenerateFromAiScoreModal() {
  const mid = aiScoreModalState.sourceMessageId;
  const suggestions = aiScoreModalState.suggestions ? aiScoreModalState.suggestions.slice() : [];
  closeAiScoreModal();
  if (!mid) return;
  const recap = suggestions.length
    ? suggestions.join('\n')
    : '请在不改变事实的前提下优化结构、关键词与合规表达。';
  appendAiMessage('user', `[按 AI 评测建议优化并重写]\n${recap}`);
  showToast('正在根据建议重新生成…', 'success');
  setTimeout(() => {
    appendAiMessage('bot', `（已按评测建议调整）\n\n${makeFakeAiReply('结合上文评测中的低分维度与合规要点，输出优化版 Listing 文案')}`, { actions: ['copy', 'regen'] });
  }, 650);
}

function renderAiScoreCard(s) {
  const esc = typeof escapeAiHtml === 'function' ? escapeAiHtml : (x) => String(x || '');
  const gradeCls = s.grade === 'S' ? 'grade-s' : (s.grade === 'A' ? 'grade-a' : (s.grade === 'B' ? 'grade-b' : 'grade-c'));
  const statusColor = { great: '#10b981', good: '#3b82f6', warn: '#f59e0b', bad: '#ef4444' };
  return `
    <div class="ai-score-card">
      <div class="ai-score-header">
        <div class="ai-score-total">
          <div class="score-num">${s.total}</div>
          <div class="score-grade ${gradeCls}">${esc(s.grade)}</div>
        </div>
        <div class="ai-score-summary">
          <div class="ai-score-title">综合评分</div>
          <div class="ai-score-desc">${esc(s.summary)}</div>
        </div>
      </div>
      <div class="ai-score-items">
        ${s.items.map(it => `
          <div class="ai-score-item">
            <div class="ai-score-item-row">
              <span class="ai-score-name">${esc(it.name)}</span>
              <span class="ai-score-weight">权重 ${it.weight}%</span>
              <span class="ai-score-val" style="color:${statusColor[it.status]};">${it.score}</span>
            </div>
            <div class="ai-score-bar">
              <div class="ai-score-bar-fill" style="width:${it.score}%;background:${statusColor[it.status]};"></div>
            </div>
          </div>
        `).join('')}
      </div>
      ${s.suggestions && s.suggestions.length ? `
        <div class="ai-score-suggest">
          <div class="ai-score-suggest-title">📝 优化建议</div>
          <div class="ai-score-suggest-list">${s.suggestions.map(t => `<div>${esc(t)}</div>`).join('')}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function ensureAiSubmitModal() {
  let root = document.getElementById('aichat-submit-modal');
  if (root) return root;
  root = document.createElement('div');
  root.className = 'aichat-submit-modal-overlay';
  root.id = 'aichat-submit-modal';
  root.setAttribute('onclick', 'if(event.target===this)closeAiSubmitModal()');
  root.innerHTML = `
    <div class="aichat-submit-modal-box" onclick="event.stopPropagation()">
      <div class="aichat-submit-modal-head">
        <div>
          <h3>提交审核</h3>
          <p>确认提交前可自由编辑 Title 和 5 条 TD</p>
        </div>
        <button type="button" class="aichat-submit-modal-close" onclick="closeAiSubmitModal()" title="关闭">×</button>
      </div>
      <div class="aichat-submit-modal-body" id="aichat-submit-modal-body"></div>
      <div class="aichat-submit-modal-foot">
        <button type="button" class="btn btn-secondary" onclick="closeAiSubmitModal()">取消</button>
        <button type="button" class="btn btn-primary" onclick="confirmAiSubmitReview()">确认提交审核</button>
      </div>
    </div>`;
  document.body.appendChild(root);
  return root;
}

function parseAiListingDraft(text) {
  const raw = String(text || '');
  const sku = aiChatState.sku || 'PO17X4011';
  const name = aiChatState.productName || '7格便携药盒';
  let title = '';
  const titleMatch = raw.match(/【Title】\s*([\s\S]*?)(?=\n\s*【TD-\d+|$)/);
  if (titleMatch) title = titleMatch[1].trim();
  if (!title) {
    const bulletTitle = raw.match(/•\s*([A-Z0-9][^\n]{40,220})/);
    if (bulletTitle) title = bulletTitle[1].trim();
  }
  if (!title) {
    title = `AUVON ${name}, BPA-Free Weekly Pill Organizer, Portable Travel Pill Case for Vitamins, Supplements and Daily Medication`;
  }

  const tds = [];
  const tdReg = /【TD-\d+[^】]*】\s*([\s\S]*?)(?=\n\s*【TD-\d+|(?:\n\s*—\s*你可以让我)|$)/g;
  let m;
  while ((m = tdReg.exec(raw)) && tds.length < 5) {
    const td = m[1].trim();
    if (td) tds.push(td);
  }
  const fallback = [
    `7-Day Medication Planning: Clearly separated compartments help organize a full week of pills for ${sku}.`,
    'Portable Daily Use: Compact design fits bags, drawers and travel kits for home, office and travel.',
    'BPA-Free Material: Food-grade material supports safe storage for vitamins, supplements and daily medication.',
    'Secure Snap Lids: Reinforced lids help prevent accidental spills while remaining easy to open.',
    'Clear Visual Labels: High-contrast marks make daily medication routines easier for seniors and caregivers.',
  ];
  while (tds.length < 5) tds.push(fallback[tds.length]);
  return { title, tds: tds.slice(0, 5) };
}

function openAiSubmitModal(messageId) {
  const m = aiChatState.messages.find(x => x.id === messageId);
  if (!m) return;
  aiSubmitModalState = { sourceMessageId: messageId };
  const draft = parseAiListingDraft(m.text || '');
  const root = ensureAiSubmitModal();
  const body = document.getElementById('aichat-submit-modal-body');
  if (!body) return;
  body.innerHTML = `
    <div class="aichat-submit-context">
      <span>需求类型：新品 Listing</span>
      <span>SKU：${escapeAiHtml(aiChatState.sku || 'PO17X4011')}</span>
      <span>产品：${escapeAiHtml(aiChatState.productName || '7格便携药盒')}</span>
    </div>
    <div class="aichat-submit-field">
      <label for="submit-title">Title</label>
      <textarea id="submit-title" rows="3">${escapeAiHtml(draft.title)}</textarea>
    </div>
    <div class="aichat-submit-td-list">
      ${draft.tds.map((td, idx) => `
        <div class="aichat-submit-field">
          <label for="submit-td-${idx}">TD-${idx + 1}</label>
          <textarea id="submit-td-${idx}" rows="4">${escapeAiHtml(td)}</textarea>
        </div>
      `).join('')}
    </div>`;
  root.classList.add('show');
}

function closeAiSubmitModal() {
  const root = document.getElementById('aichat-submit-modal');
  if (root) root.classList.remove('show');
  aiSubmitModalState = { sourceMessageId: null };
}

function confirmAiSubmitReview() {
  const titleEl = document.getElementById('submit-title');
  const title = titleEl ? titleEl.value.trim() : '';
  const tds = Array.from({ length: 5 }, (_, i) => {
    const el = document.getElementById(`submit-td-${i}`);
    return el ? el.value.trim() : '';
  });
  if (!title) {
    showToast('请先填写 Title', 'warning');
    if (titleEl) titleEl.focus();
    return;
  }
  const emptyIdx = tds.findIndex(v => !v);
  if (emptyIdx >= 0) {
    showToast(`请先填写 TD-${emptyIdx + 1}`, 'warning');
    const el = document.getElementById(`submit-td-${emptyIdx}`);
    if (el) el.focus();
    return;
  }
  const sourceId = aiSubmitModalState.sourceMessageId;
  closeAiSubmitModal();
  submitAiMessage(sourceId, { title, tds });
}

function submitAiMessage(messageId, payload = null) {
  const m = aiChatState.messages.find(x => x.id === messageId);
  if (!m) return;
  showToast('已提交审核，审核结果会以站内通知反馈', 'success');
  const text = payload
    ? `✅ 已提交审核\n\nSKU：${aiChatState.sku}\n提交人：${getCurrentUserInitial()}（Mason）\n时间：${new Date().toLocaleString('zh-CN')}\n\n【Title】\n${payload.title}\n\n${payload.tds.map((td, i) => `【TD-${i + 1}】\n${td}`).join('\n\n')}\n\n你可以继续在此对话中迭代新版本，或返回「文案管理」列表查看审核进度。`
    : `✅ 已提交审核\n\nSKU：${aiChatState.sku}\n提交人：${getCurrentUserInitial()}（Mason）\n时间：${new Date().toLocaleString('zh-CN')}\n\n你可以继续在此对话中迭代新版本，或返回「文案管理」列表查看审核进度。`;
  appendAiMessage('bot', text, { stream: false });
}

function copyAiMessage(messageId) {
  const m = aiChatState.messages.find(x => x.id === messageId);
  if (!m) return;
  try { navigator.clipboard.writeText(m.text || ''); showToast('已复制到剪贴板', 'success'); }
  catch (e) { showToast('复制失败', 'error'); }
}

function regenerateAi(messageId) {
  const m = aiChatState.messages.find(x => x.id === messageId);
  if (!m) return;
  showToast('正在重新生成…', 'success');
  // 找上一条用户消息作为重生 prompt
  const idx = aiChatState.messages.findIndex(x => x.id === messageId);
  let prompt = '';
  for (let i = idx - 1; i >= 0; i--) {
    if (aiChatState.messages[i].role === 'user') { prompt = aiChatState.messages[i].text; break; }
  }
  setTimeout(() => {
    appendAiMessage('bot', `（重新生成）${makeFakeAiReply(prompt || '生成 Listing')}`, { actions: ['copy', 'regen'] });
  }, 500);
}

function renderAiWelcome() {
  const sku = aiChatState.sku || '';
  const name = aiChatState.productName || '';
  return `
    <div class="ai-welcome">
      <div class="ai-welcome-icon" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="aiGrad1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0"   stop-color="#6366f1"/>
              <stop offset="0.5" stop-color="#8b5cf6"/>
              <stop offset="1"   stop-color="#06b6d4"/>
            </linearGradient>
            <linearGradient id="aiGrad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#f0abfc"/>
              <stop offset="1" stop-color="#67e8f9"/>
            </linearGradient>
            <radialGradient id="aiGlow" cx="40" cy="40" r="36" gradientUnits="userSpaceOnUse">
              <stop offset="0"   stop-color="#a78bfa" stop-opacity="0.45"/>
              <stop offset="0.6" stop-color="#a78bfa" stop-opacity="0.10"/>
              <stop offset="1"   stop-color="#a78bfa" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <!-- 外层光晕 -->
          <circle cx="40" cy="40" r="36" fill="url(#aiGlow)">
            <animate attributeName="r" values="34;38;34" dur="2.6s" repeatCount="indefinite"/>
          </circle>
          <!-- 旋转外环 -->
          <g style="transform-origin:40px 40px;animation:aiRingSpin 9s linear infinite;">
            <circle cx="40" cy="40" r="30" fill="none" stroke="url(#aiGrad1)" stroke-width="1.4" stroke-dasharray="4 6" opacity="0.55"/>
          </g>
          <!-- 反向旋转内环 -->
          <g style="transform-origin:40px 40px;animation:aiRingSpinR 7s linear infinite;">
            <circle cx="40" cy="40" r="22" fill="none" stroke="url(#aiGrad2)" stroke-width="1" stroke-dasharray="2 4" opacity="0.7"/>
          </g>
          <!-- 中央 sparkle 主体 -->
          <g style="transform-origin:40px 40px;animation:aiSparklePulse 2.4s ease-in-out infinite;">
            <path d="M40 14 L46 34 L66 40 L46 46 L40 66 L34 46 L14 40 L34 34 Z" fill="url(#aiGrad1)" stroke="#fff" stroke-width="0.6" stroke-linejoin="round"/>
          </g>
          <!-- 副 sparkle -->
          <g style="transform-origin:40px 40px;animation:aiSparkleFloat 3.6s ease-in-out infinite;">
            <path d="M62 18 L64 24 L70 26 L64 28 L62 34 L60 28 L54 26 L60 24 Z" fill="url(#aiGrad2)" opacity="0.85"/>
            <path d="M14 56 L15.5 60.5 L20 62 L15.5 63.5 L14 68 L12.5 63.5 L8 62 L12.5 60.5 Z" fill="url(#aiGrad2)" opacity="0.85"/>
          </g>
          <!-- 中心高光点 -->
          <circle cx="40" cy="40" r="3" fill="white" opacity="0.95">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <h2 class="ai-welcome-title">AI 文案生成助手</h2>
      <div class="ai-welcome-sub">
        ${sku ? `当前SKU：${sku}·${name}<br>` : ''}
        已读取左侧上下文（产品信息/卖点/SEO/竞品），可以基于它为你生成包装盒、说明书、图片、视频脚本、FQA等文案。
      </div>

      <div class="ai-welcome-features">
        <div class="ai-welcome-feature clickable" onclick="generateAmazonTitleTD()" title="点击：基于上下文生成 Amazon Title + 5 段 TD">
          <div class="feat-icon" style="background:#eef2ff;color:#6366f1;">${I('database', 18)}</div>
          <div class="feat-text">
            <div class="feat-title">基于上下文生成</div>
            <div class="feat-desc">自动引用产品 / 卖点 / SEO / 竞品资料</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function useAiExample(text) {
  const input = document.getElementById('aichat-input');
  if (input) {
    input.value = text;
    input.focus();
  }
  // 直接触发发送
  sendAiMessage();
}


function appendAiMessage(role, text, opts = {}) {
  const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const shouldStream = role === 'bot' && opts.stream !== false && !opts.score;
  aiChatState.messages.push({
    id,
    role,
    text: shouldStream ? '' : text,
    fullText: shouldStream ? text : '',
    streaming: shouldStream,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    actions: shouldStream ? null : (opts.actions || null),    // 气泡内：copy / regen；评测与提交在顶栏
    pendingActions: shouldStream ? (opts.actions || null) : null,
    score:   opts.score   || null,    // 评分详情（评测时附带）
  });
  renderAiMessages();
  if (shouldStream) startAiMessageStream(id);
  return id;
}

function clearAiStreamTimers() {
  Object.values(aiStreamTimers).forEach(timer => clearInterval(timer));
  aiStreamTimers = {};
}

function startAiMessageStream(messageId) {
  const msg = aiChatState.messages.find(m => m.id === messageId);
  if (!msg || !msg.streaming) return;
  if (aiStreamTimers[messageId]) clearInterval(aiStreamTimers[messageId]);
  let cursor = 0;
  const fullText = msg.fullText || '';
  aiStreamTimers[messageId] = setInterval(() => {
    const current = aiChatState.messages.find(m => m.id === messageId);
    if (!current) {
      clearInterval(aiStreamTimers[messageId]);
      delete aiStreamTimers[messageId];
      return;
    }
    cursor = Math.min(fullText.length, cursor + getAiStreamChunkSize(fullText, cursor));
    current.text = fullText.slice(0, cursor);
    if (cursor >= fullText.length) {
      current.text = fullText;
      current.streaming = false;
      current.actions = current.pendingActions || null;
      current.pendingActions = null;
      clearInterval(aiStreamTimers[messageId]);
      delete aiStreamTimers[messageId];
    }
    renderAiMessages();
  }, AI_STREAM_INTERVAL_MS);
}

function getAiStreamChunkSize(text, index) {
  const next = text.slice(index, index + AI_STREAM_CHUNK_SIZE);
  return /[。！？.!?\n]$/.test(next) ? 1 : AI_STREAM_CHUNK_SIZE;
}

function onAiInputKey(e) {
  // Enter 直接发送；Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    sendAiMessage();
  }
}

function toggleAiFeature(btn, name) {
  if (!btn) return;
  btn.classList.toggle('active');
  const on = btn.classList.contains('active');
  showToast(`${name === 'research' ? '深度研究' : '生成图片'}：${on ? '已开启' : '已关闭'}`, on ? 'success' : 'warning');
}

function toggleAiModelMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('aichat-model-menu');
  if (menu) menu.classList.toggle('show');
}

function selectAiModel(name, desc) {
  document.getElementById('aichat-model-name').textContent = name;
  document.getElementById('aichat-model-menu').classList.remove('show');
  showToast(`已切换模型：${name}（${desc}）`, 'success');
}

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('#ai-chat-view .aichat-model-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const menu = document.getElementById('aichat-model-menu');
    if (menu) menu.classList.remove('show');
  }
});

function onAiImageUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  appendAiMessage('user', `📎 已上传图片：${file.name}（${(file.size / 1024).toFixed(1)} KB）`);
  e.target.value = '';
  setTimeout(() => {
    appendAiMessage('bot', `图片已收到，我已基于图片内容初步识别为「${aiChatState.productName || '产品'}」相关素材。请告诉我你想基于这张图做什么？\n\n• 文案配图描述\n• A+ 模块场景文案\n• 主图卖点提取\n• 竞品对比`, { actions: ['copy', 'regen'] });
  }, 400);
}

function sendAiMessage() {
  const input = document.getElementById('aichat-input');
  const text = (input.value || '').trim();
  if (!text) return;
  let prefix = '';
  if (aiChatState.activeSkill) {
    const s = AI_SKILLS.find(x => x.id === aiChatState.activeSkill);
    if (s) prefix = `[Skill · ${s.name}] `;
  }
  appendAiMessage('user', prefix + text);
  input.value = '';

  const btn = document.getElementById('aichat-send-btn');
  if (btn) btn.disabled = true;
  setTimeout(() => {
    const reply = makeFakeAiReply(prefix + text);
    appendAiMessage('bot', reply, { actions: ['copy', 'regen'] });
    // 同步追加到「已生成」
    aiChatState.outputs.unshift({
      title: aiChatState.activeSkill
        ? (AI_SKILLS.find(x => x.id === aiChatState.activeSkill) || {}).name + ' · 输出'
        : 'AI 输出 · ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      body: reply,
    });
    if (aiChatState.rightTab === 'outputs') renderAiRightPanel();
    else document.getElementById('aichat-out-count').textContent = aiChatState.outputs.length;
    if (btn) btn.disabled = false;
  }, 600);
}

function makeFakeAiReply(prompt) {
  const sku = aiChatState.sku;
  const name = aiChatState.productName;
  if (/title|标题/i.test(prompt)) {
    return `根据 ${sku} ${name}，结合 SEO 高热词「pill organizer / weekly pill case」生成 1 版标题：\n\n• AUVON 7-Day Portable Pill Organizer with BPA-Free Compartments — Weekly Pill Box for Travel & Daily Vitamins\n\n• 字符 124，已自然嵌入 3 个高热关键词。`;
  }
  if (/bp|bullet|5\s*段/i.test(prompt)) {
    return `5 段式 Bullet Point 草稿：\n\n• ✅ WEEKLY PLANNER — 7 个独立隔层，按日清晰标记，避免漏服或重复服药。\n• ✅ TRAVEL-FRIENDLY — 紧凑 20 cm 外形 + 防摔结构 + 配套收纳袋，居家与出行无忧。\n• ✅ FOOD-GRADE SAFE — BPA-Free PP 食品级材质，FDA / CE 双认证，长期接触药品安心。\n• ✅ MOISTURE-PROOF — 加固卡扣 + 防潮内衬，避免药品受潮变质。\n• ✅ EASY TO USE — 大字号标签 + 高对比配色，老花眼友好，单手轻松开启。`;
  }
  if (/seo|关键词/i.test(prompt)) {
    return `已按相关性排序，建议优先嵌入：\n\n1. pill organizer（高热）\n2. 7 day pill box（高热）\n3. weekly pill case（高热）\n4. medicine organizer\n5. travel pill case\n\n建议在标题嵌入 1、Title 后段嵌入 2、BP1 中嵌入 3。`;
  }
  return `已收到：${prompt}\n\n基于左侧产品信息、卖点和竞品差异，可输出以下方向：\n• 一段 100 字内的产品概述\n• 5 段式 BP\n• A+ 模块文案 (Hero / Comparison / Lifestyle)\n\n你想从哪个方向先开始？`;
}

// ---- 收起 / 展开 ----
function toggleAiPanel(side) {
  const layout = document.getElementById('aichat-layout');
  const cls = side + '-collapsed';
  layout.classList.toggle(cls);
  // 清掉拖拽产生的内联 gridTemplateColumns，确保 CSS 类生效
  // 收起后让对应一侧变 0，未收起一侧保持各自宽度，中间始终 1fr
  const leftCollapsed  = layout.classList.contains('left-collapsed');
  const rightCollapsed = layout.classList.contains('right-collapsed');
  // 若先前拖拽过，记录当前的左/右像素，之后展开时还原；这里用 dataset 缓存
  const computed = layout.style.gridTemplateColumns
    ? layout.style.gridTemplateColumns.split(' ')
    : null;
  if (computed && computed.length === 5) {
    if (parseFloat(computed[0]) > 0) layout.dataset.leftWidth  = computed[0];
    if (parseFloat(computed[4]) > 0) layout.dataset.rightWidth = computed[4];
  }
  const leftW  = layout.dataset.leftWidth  || '320px';
  const rightW = layout.dataset.rightWidth || '320px';
  layout.style.gridTemplateColumns =
    `${leftCollapsed ? '0px' : leftW} ${leftCollapsed ? '0px' : '6px'} minmax(0, 1fr) ${rightCollapsed ? '0px' : '6px'} ${rightCollapsed ? '0px' : rightW}`;

  document.getElementById('aichat-toggle-' + side).style.display =
    layout.classList.contains(cls) ? 'flex' : 'none';
}

// ---- 拖拽改变宽度 ----
let aiResizeState = null;
function startAiResize(e, side) {
  e.preventDefault();
  const layout = document.getElementById('aichat-layout');
  const rect = layout.getBoundingClientRect();
  const computed = getComputedStyle(layout).gridTemplateColumns.split(' ');
  aiResizeState = {
    side,
    startX: e.clientX,
    leftPx:  parseFloat(computed[0]) || 320,
    rightPx: parseFloat(computed[4]) || 320,
    layoutWidth: rect.width,
  };
  document.body.style.cursor = 'col-resize';
  document.addEventListener('mousemove', onAiResize);
  document.addEventListener('mouseup', stopAiResize);
}
function onAiResize(e) {
  if (!aiResizeState) return;
  const dx = e.clientX - aiResizeState.startX;
  let left  = aiResizeState.leftPx;
  let right = aiResizeState.rightPx;
  if (aiResizeState.side === 'left')  left  = Math.min(560, Math.max(220, aiResizeState.leftPx + dx));
  if (aiResizeState.side === 'right') right = Math.min(560, Math.max(220, aiResizeState.rightPx - dx));
  const layout = document.getElementById('aichat-layout');
  layout.style.gridTemplateColumns = `${left}px 6px 1fr 6px ${right}px`;
}
function stopAiResize() {
  aiResizeState = null;
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onAiResize);
  document.removeEventListener('mouseup', stopAiResize);
}

// 行内操作（按状态决定按钮）
function renderRowActions(r, rowIdx) {
  const sku = r.sku;
  const idx = rowIdx != null ? rowIdx : -1;
  const div = `<span class="row-action-divider"></span>`;
  const detailBtn = `<button class="row-action-btn" onclick="rowAction('detail','${sku}')">详情</button>`;
  let extra = '';
  switch (r.status) {
    case '待审核':
      return `<div class="row-actions"><button class="row-action-btn warn" onclick="rowAction('change','${sku}',${idx})">变更</button></div>`;
    case '已驳回':
      return `<div class="row-actions"><button class="row-action-btn danger" onclick="rowAction('reject_log','${sku}')">驳回记录</button></div>`;
    case '已通过':
      extra = `${div}<button class="row-action-btn" onclick="rowAction('reject_log_readonly','${sku}')">驳回记录</button>`;
      break;
    case '待处理':
      return `<div class="row-actions"><button class="row-action-btn warn" onclick="event.stopPropagation();openAiChat('${sku}', '')">文案生成</button></div>`;
    case '处理中':
      extra = '';
      break;
    case '已完成':
      return `<div class="row-actions"><button class="row-action-btn success" onclick="rowAction('view_copy','${sku}')">查看文案</button></div>`;
  }
  return `<div class="row-actions">${detailBtn}${extra}</div>`;
}

function rowAction(act, sku, rowIdx) {
  if (act === 'reject_log' && typeof openReviewRejectRecordBySku === 'function') {
    openReviewRejectRecordBySku(sku);
    return;
  }
  if (act === 'reject_log_readonly' && typeof openReviewRejectRecordBySku === 'function') {
    openReviewRejectRecordBySku(sku, { showEdit: false });
    return;
  }
  if (act === 'change') {
    openChangeModal(sku, rowIdx);
    return;
  }
  const messages = {
    detail: `查看需求详情：${sku}`,
    reject_log: `查看驳回记录：${sku}`,
    reject_log_readonly: `查看驳回记录：${sku}`,
    view_copy: `查看已生成的文案：${sku}`,
    copy_copy: `文案已复制到剪贴板：${sku}`,
  };
  const types = {
    detail: 'success', reject_log: 'warning',
    view_copy: 'success', copy_copy: 'success'
  };
  if (act === 'copy_copy') {
    try { navigator.clipboard.writeText(`【${sku}】文案内容`); } catch(e) {}
  }
  showToast(messages[act] || act, types[act] || 'success');
}

// ===== 变更需求弹窗 =====
const TYPE_TO_RESULT_KEY = {
  '新品Listing':   'new-titletd-titletd',
  '新品Title':     'new-titletd-title',
  '新品TD':        'new-titletd-td',
  '新品Title TD':  'new-titletd-titletd',
  '新品图片文案':  'new-listing7',
  '新品FAQ':       'new-faq',
  '新品卖点视频':  'new-video-selling',
  '新品操作视频':  'new-video-operation',
  '老品Title':     'old-titletd-title',
  '老品TD':        'old-titletd-td',
  '老品Title TD':  'old-titletd-titletd',
};

let _changeRowRef = null;

function openChangeModal(sku, rowIdx) {
  const row = (rowIdx >= 0 && LIST_DATA[rowIdx])
           ? LIST_DATA[rowIdx]
           : LIST_DATA.find(r => r.sku === sku && r.status === '待审核') || LIST_DATA.find(r => r.sku === sku);
  if (!row) { showToast('未找到需求数据', 'warning'); return; }
  _changeRowRef = row;

  document.getElementById('change-modal-subtitle').textContent = `${row.type} · ${sku}`;
  document.getElementById('cm-type-label').textContent = row.type;
  document.getElementById('cm-sku-label').textContent = sku;

  const siteSelect = document.getElementById('cm-site');
  siteSelect.value = (row.site || '').toLowerCase();

  const subSel = document.getElementById('cm-subcategory');
  const cats = typeof subCategoriesData !== 'undefined' ? subCategoriesData : [];
  subSel.innerHTML = cats.map(s => `<option value="${s.value}">${s.label}</option>`).join('');
  const matchedSub = cats.find(s => s.label === row.sub);
  if (matchedSub) subSel.value = matchedSub.value;

  document.getElementById('cm-date').value = (row.date || '').replace(/\//g, '-');

  const needLaunch = /新品.*(Listing|图片文案|卖点视频|操作视频)/.test(row.type) || row.type === '新品Listing';
  const launchRow = document.getElementById('cm-launch-row');
  launchRow.style.display = needLaunch ? '' : 'none';
  if (needLaunch) {
    document.getElementById('cm-launch-date').value = (row.launch_date || '').replace(/\//g, '-');
  }

  document.getElementById('cm-reason').value = '';

  _renderChangeModules(row.type);

  const modal = document.getElementById('change-modal');
  modal.style.display = 'flex';
}

function _renderChangeModules(type) {
  const container = document.getElementById('cm-modules');
  const resultKey = TYPE_TO_RESULT_KEY[type];
  if (!resultKey || typeof getActiveResultModules !== 'function' || typeof renderModuleCard !== 'function') {
    container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">该需求类型暂无解析内容</div>';
    return;
  }

  const reqTypeEl = document.getElementById('req-type');
  const savedVal = reqTypeEl ? reqTypeEl.value : '';

  if (reqTypeEl) reqTypeEl.value = resultKey;

  try {
    const modules = getActiveResultModules();
    container.innerHTML = modules.map(m => renderModuleCard(m)).join('');
  } catch (e) {
    container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">渲染失败</div>';
  }

  if (reqTypeEl) reqTypeEl.value = savedVal;
}

function closeChangeModal() {
  document.getElementById('change-modal').style.display = 'none';
  _changeRowRef = null;
}

function submitChangeModal() {
  if (!_changeRowRef) return;
  const row = _changeRowRef;

  const siteVal = document.getElementById('cm-site').value;
  const subSel = document.getElementById('cm-subcategory');
  const subLabel = subSel.options[subSel.selectedIndex] ? subSel.options[subSel.selectedIndex].text : row.sub;
  const dateVal = document.getElementById('cm-date').value.replace(/-/g, '/');
  const launchRow = document.getElementById('cm-launch-row');
  const showLaunch = launchRow.style.display !== 'none';
  const launchVal = showLaunch ? document.getElementById('cm-launch-date').value.replace(/-/g, '/') : undefined;

  row.site = siteVal.toUpperCase();
  row.sub = subLabel;
  row.date = dateVal;
  if (showLaunch && launchVal) row.launch_date = launchVal;

  if (typeof renderListTable === 'function') renderListTable();
  closeChangeModal();
  showToast('需求变更已保存', 'success');
}

function changePage(dir) {
  showToast(dir > 0 ? '下一页' : '上一页', 'success');
}
function changePageSize() {
  showToast('每页数量已调整', 'success');
}

// 列表页 / 向导页 切换


// ============================================
// ===== 视图状态持久化（livereload 友好） =====
// ============================================





// ===== Toast =====

