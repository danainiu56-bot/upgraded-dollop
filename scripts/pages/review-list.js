/* ============================================
   需求审核列表（独立筛选与渲染，所有函数前缀 rv*）
   ============================================ */

let rvFilterSkuValue = '';
let rvFilterSkuQuery = '';
let reviewCurrentFilters = {};
let reviewCurrentListData = [];
const REVIEW_DECISIONS_KEY = '__cursor_review_decisions';

function getReviewRowKey(row, idx) {
  return [idx, row.sku, row.type, row.submit_time || ''].join('|');
}

function readReviewDecisions() {
  try {
    const raw = sessionStorage.getItem(REVIEW_DECISIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeReviewDecisions(data) {
  try { sessionStorage.setItem(REVIEW_DECISIONS_KEY, JSON.stringify(data || {})); } catch (e) {}
}

function findReviewRowByKey(key) {
  return getReviewListData().find(row => row.review_key === key) || null;
}

function decodeReviewKey(encodedKey) {
  try { return decodeURIComponent(encodedKey); } catch (e) { return encodedKey; }
}

function getReviewListData() {
  const statusMap = {
    '待处理': '待审核',
    '待审核': '待审核',
    '已驳回': '已驳回',
    '已通过': '已通过',
  };
  const decisions = readReviewDecisions();
  return (typeof COPY_LIST_DATA !== 'undefined' ? COPY_LIST_DATA : []).map((row, idx) => {
    const normalized = {
      ...row,
      submit_time: row.submit_time || '2026/02/12 12:23:43',
      reviewer: ['Suki', 'Susie', 'Tammy', '主管审核组'][idx % 4],
    };
    const reviewKey = getReviewRowKey(normalized, idx);
    const decision = decisions[reviewKey];
    const history = decision ? _normalizeDecisionHistory(decision) : [];
    const latestEntry = history.length ? history[history.length - 1] : null;
    const fallbackRecord = (!decision && Array.isArray(row.reject_history) && row.reject_history.length)
      ? { status: row.review_status || row.status, history: row.reject_history }
      : null;
    return {
      ...normalized,
      review_key: reviewKey,
      review_status: decision ? decision.status : (statusMap[row.status] || '待审核'),
      review_time: latestEntry ? latestEntry.time : (decision ? decision.time : (row.review_time || '—')),
      reject_reason: latestEntry ? (latestEntry.reason || '') : (decision ? (decision.reason || '') : ''),
      decision_record: decision || fallbackRecord,
    };
  });
}

function renderReviewMgrView() {
  const root = document.getElementById('review-mgr-view');
  if (!root) return;
  if (!root.dataset.ready) {
    root.innerHTML = reviewMgrTemplate();
    root.dataset.ready = '1';
    renderRvPersonValueOptions('writer');
    updateRvFilterSkuTrigger();
  }
  applyReviewFilters();
}

function reviewMgrTemplate() {
  return `
    <div class="list-filter-bar">
      <div class="list-filter-row">
        <div class="filter-group">
          <select class="filter-select" id="rv-req-type" onchange="applyReviewFilters()">
            <option value="">全部需求类型</option>
            <option value="新品Listing">新品 Listing</option>
            <option value="老品Title">老品 Title</option>
            <option value="老品TD">老品 TD</option>
            <option value="老品Title TD">老品 Title TD</option>
            <option value="新品Title">新品 Title</option>
            <option value="新品TD">新品 TD</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="rv-site" onchange="applyReviewFilters()">
            <option value="">全部站点</option>
            <option value="US">🇺🇸 US</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="DE">🇩🇪 DE</option>
            <option value="JP">🇯🇵 JP</option>
            <option value="CA">🇨🇦 CA</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="rv-brand" onchange="applyReviewFilters()">
            <option value="">全部品牌</option>
            <option value="AUVON">AUVON</option>
            <option value="ZIKEE">ZIKEE</option>
            <option value="AMOOS">AMOOS</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="rv-subcategory" onchange="applyReviewFilters()">
            <option value="">全部子品类</option>
            <option value="药盒">药盒</option>
            <option value="电疗">电疗</option>
            <option value="贴片">贴片</option>
            <option value="夜灯">夜灯</option>
          </select>
        </div>
        <div class="filter-group filter-sku-wrap" data-rv="1">
          <button type="button" class="filter-select filter-sku-trigger" id="rv-sku-trigger" onclick="toggleRvFilterSkuDropdown(event)">
            <span id="rv-sku-text" class="f-sku-placeholder">SKU</span>
          </button>
          <div class="f-sku-dropdown" id="rv-sku-dropdown">
            <div class="f-sku-search-bar">
              <input
                type="text"
                class="f-sku-search-input"
                id="rv-sku-search"
                placeholder="🔍 搜索 SKU 编号或名称..."
                oninput="filterRvSkuDropdownOptions()"
                onclick="event.stopPropagation()"
              />
            </div>
            <div class="f-sku-toolbar">
              <span style="font-size:12px;color:var(--text-muted);">共 <span id="rv-sku-total">0</span> 个</span>
              <button type="button" class="sku-toolbar-btn" onclick="clearRvFilterSku(event)">清除</button>
            </div>
            <div class="f-sku-list" id="rv-sku-list"></div>
          </div>
        </div>
        <div class="filter-group filter-group-wide">
          <div class="combo-select">
            <select class="combo-select-left" id="rv-person-type" onchange="onRvPersonTypeChange()">
              <option value="writer">文案人员</option>
              <option value="op">需求提交人</option>
            </select>
            <select class="combo-select-right" id="rv-person-value" onchange="applyReviewFilters()"></select>
          </div>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="rv-status" onchange="applyReviewFilters()">
            <option value="">全部状态</option>
            <option value="待审核">待审核</option>
            <option value="已驳回">已驳回</option>
            <option value="已通过">已通过</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="filter-btn" onclick="resetReviewFilters()">重置</button>
        </div>
      </div>
      <div class="filter-applied" id="rv-applied"></div>
    </div>

    <div class="list-table-wrap">
      <table class="list-data-table review-data-table">
        <thead>
          <tr>
            <th style="width:120px;">需求类型</th>
            <th style="width:60px;">站点</th>
            <th style="width:100px;">品牌</th>
            <th style="width:80px;">子品类</th>
            <th style="width:170px;">产品名称</th>
            <th style="width:120px;">SKU</th>
            <th style="width:80px;">优先级</th>
            <th style="width:100px;">需求提交人</th>
            <th style="width:100px;">文案人员</th>
            <th style="width:120px;">开卖时间</th>
            <th style="width:120px;">期望交付时间</th>
            <th style="width:160px;">提交审核时间</th>
            <th style="width:160px;">审核时间</th>
            <th style="width:90px;">审核状态</th>
            <th style="width:160px;">操作</th>
          </tr>
        </thead>
        <tbody id="rv-tbody"></tbody>
      </table>
    </div>

    <div class="list-pagination">
      <span>共 <strong id="rv-pg-total">0</strong> 条</span>
      <button class="pg-btn">‹</button>
      <button class="pg-btn active">2</button>
      <span>/ 15</span>
      <button class="pg-btn">›</button>
      <select class="pg-size">
        <option value="20">20条/页</option>
        <option value="50">50条/页</option>
        <option value="100">100条/页</option>
      </select>
    </div>

    <div class="review-audit-overlay" id="review-audit-modal" onclick="if(event.target===this)closeReviewAuditModal()">
      <div class="review-audit-box" onclick="event.stopPropagation()">
        <div class="review-audit-head">
          <div>
            <h3 id="review-audit-title">需求审核</h3>
            <p id="review-audit-subtitle"></p>
          </div>
          <button type="button" class="review-audit-close" onclick="closeReviewAuditModal()">×</button>
        </div>
        <div class="review-audit-body" id="review-audit-body"></div>
        <div class="review-audit-foot" id="review-audit-foot"></div>
      </div>
    </div>
  `;
}

function onRvPersonTypeChange() {
  const type = document.getElementById('rv-person-type').value;
  renderRvPersonValueOptions(type);
  applyReviewFilters();
}

function renderRvPersonValueOptions(type) {
  const sel = document.getElementById('rv-person-value');
  if (!sel) return;
  const opt = PERSON_OPTIONS[type] || PERSON_OPTIONS.writer;
  sel.innerHTML = `<option value="">全部</option>` +
    opt.items.map(it => `<option value="${it}">${it}</option>`).join('');
}

function toggleRvFilterSkuDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('rv-sku-dropdown');
  if (!dd) return;
  if (dd.classList.contains('show')) closeRvFilterSkuDropdown();
  else openRvFilterSkuDropdown();
}

function openRvFilterSkuDropdown() {
  const dd = document.getElementById('rv-sku-dropdown');
  if (!dd) return;
  dd.classList.add('show');
  document.getElementById('rv-sku-total').textContent = FILTER_SKU_POOL.length;
  renderRvFilterSkuList();
  setTimeout(() => {
    const search = document.getElementById('rv-sku-search');
    if (search) search.focus();
  }, 50);
}

function closeRvFilterSkuDropdown() {
  const dd = document.getElementById('rv-sku-dropdown');
  if (dd) dd.classList.remove('show');
}

function filterRvSkuDropdownOptions() {
  rvFilterSkuQuery = document.getElementById('rv-sku-search').value.trim().toLowerCase();
  renderRvFilterSkuList();
}

function renderRvFilterSkuList() {
  const list = document.getElementById('rv-sku-list');
  if (!list) return;
  const q = rvFilterSkuQuery;
  const filtered = q
    ? FILTER_SKU_POOL.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : FILTER_SKU_POOL;
  if (!filtered.length) {
    list.innerHTML = `<div class="f-sku-empty">没有匹配的 SKU</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => `
    <div class="f-sku-item ${rvFilterSkuValue === s.code ? 'selected' : ''}" onclick="selectRvFilterSku('${s.code}')">
      <div class="f-sku-radio"></div>
      <div class="f-sku-info">
        <div class="f-sku-code">${s.code}</div>
        <div class="f-sku-name">${s.name}</div>
      </div>
    </div>
  `).join('');
}

function selectRvFilterSku(code) {
  rvFilterSkuValue = code;
  updateRvFilterSkuTrigger();
  closeRvFilterSkuDropdown();
  applyReviewFilters();
}

function clearRvFilterSku(e) {
  if (e) e.stopPropagation();
  rvFilterSkuValue = '';
  rvFilterSkuQuery = '';
  const search = document.getElementById('rv-sku-search');
  if (search) search.value = '';
  updateRvFilterSkuTrigger();
  renderRvFilterSkuList();
  applyReviewFilters();
}

function updateRvFilterSkuTrigger() {
  const text = document.getElementById('rv-sku-text');
  if (!text) return;
  if (rvFilterSkuValue) {
    const sku = FILTER_SKU_POOL.find(s => s.code === rvFilterSkuValue);
    text.className = 'f-sku-selected';
    text.innerHTML = `<span style="font-family:'SF Mono',Monaco,monospace;">${rvFilterSkuValue}</span>`
      + (sku ? `<span style="color:var(--text-muted);font-size:11px;">${sku.name}</span>` : '');
  } else {
    text.className = 'f-sku-placeholder';
    text.textContent = 'SKU';
  }
}

function applyReviewFilters() {
  const personType = document.getElementById('rv-person-type') ? document.getElementById('rv-person-type').value : 'writer';
  const personValue = document.getElementById('rv-person-value') ? document.getElementById('rv-person-value').value : '';
  reviewCurrentFilters = {
    type: document.getElementById('rv-req-type').value,
    site: document.getElementById('rv-site').value,
    brand: document.getElementById('rv-brand').value,
    sub: document.getElementById('rv-subcategory').value,
    sku: rvFilterSkuValue,
    person: personValue,
    personType,
    status: document.getElementById('rv-status').value,
  };
  reviewCurrentListData = getReviewListData().filter(row => {
    const f = reviewCurrentFilters;
    if (f.type && row.type !== f.type) return false;
    if (f.site && row.site !== f.site) return false;
    if (f.brand && row.brand !== f.brand) return false;
    if (f.sub && row.sub !== f.sub) return false;
    if (f.sku && row.sku !== f.sku) return false;
    if (f.person) {
      if (personType === 'writer' && row.writer !== f.person) return false;
      if (personType === 'op' && row.op !== f.person) return false;
      if (personType === 'bu' && (row.bu || '') !== f.person) return false;
      if (personType === 'bu_lead' && (row.bu_lead || '') !== f.person) return false;
    }
    if (f.status && row.review_status !== f.status) return false;
    return true;
  });
  const order = { '待审核': 1, '已驳回': 2, '已通过': 3 };
  reviewCurrentListData.sort((a, b) => (order[a.review_status] || 99) - (order[b.review_status] || 99));
  renderReviewListTable();
  renderReviewAppliedFilters();
}

function resetReviewFilters() {
  ['rv-req-type', 'rv-site', 'rv-brand', 'rv-subcategory', 'rv-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  rvFilterSkuValue = '';
  rvFilterSkuQuery = '';
  const sk = document.getElementById('rv-sku-search');
  if (sk) sk.value = '';
  updateRvFilterSkuTrigger();
  const pt = document.getElementById('rv-person-type');
  if (pt) pt.value = 'writer';
  renderRvPersonValueOptions('writer');
  const pv = document.getElementById('rv-person-value');
  if (pv) pv.value = '';
  applyReviewFilters();
}

function renderReviewAppliedFilters() {
  const wrap = document.getElementById('rv-applied');
  if (!wrap) return;
  const labels = { type: '需求类型', site: '站点', brand: '品牌', sub: '子品类', sku: 'SKU', status: '状态' };
  const chips = [];
  Object.keys(labels).forEach(k => {
    if (reviewCurrentFilters[k]) {
      chips.push(`<span class="filter-chip">
        <span class="chip-label">${labels[k]}：</span>
        <span class="chip-val">${reviewCurrentFilters[k]}</span>
        <span class="chip-close" onclick="clearReviewFilter('${k}')">×</span>
      </span>`);
    }
  });
  if (reviewCurrentFilters.person) {
    const typeLabel = (PERSON_OPTIONS[reviewCurrentFilters.personType] || {}).label || '人员';
    chips.push(`<span class="filter-chip">
      <span class="chip-label">${typeLabel}：</span>
      <span class="chip-val">${reviewCurrentFilters.person}</span>
      <span class="chip-close" onclick="clearReviewFilter('person')">×</span>
    </span>`);
  }
  if (!chips.length) {
    wrap.innerHTML = '';
    return;
  }
  chips.push(`<a class="chip-clear-all" onclick="resetReviewFilters()">清除全部</a>`);
  wrap.innerHTML = chips.join('');
}

function clearReviewFilter(key) {
  if (key === 'sku') {
    clearRvFilterSku();
    return;
  }
  if (key === 'person') {
    const pv = document.getElementById('rv-person-value');
    if (pv) pv.value = '';
    applyReviewFilters();
    return;
  }
  const idMap = { type: 'rv-req-type', site: 'rv-site', brand: 'rv-brand', sub: 'rv-subcategory', status: 'rv-status' };
  const el = document.getElementById(idMap[key]);
  if (el) el.value = '';
  applyReviewFilters();
}

function renderReviewListTable() {
  const tbody = document.getElementById('rv-tbody');
  if (!tbody) return;
  if (!reviewCurrentListData.length) {
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;padding:60px 16px;color:var(--text-light);">
      <div style="font-size:28px;margin-bottom:8px;">📭</div>
      <div>没有匹配的数据</div>
    </td></tr>`;
    document.getElementById('rv-pg-total').textContent = 0;
    return;
  }
  tbody.innerHTML = reviewCurrentListData.map(row => {
    const typeCls = REQ_TYPE_STYLES[row.type] || 'req-type-listing';
    const brandCls = row.brand === 'ZIKEE' ? 'brand-zikee' : (row.brand === 'AMOOS' ? 'brand-amoos' : '');
    const statusCls = row.review_status === '已通过' ? 'status-pass' : (row.review_status === '已驳回' ? 'status-reject' : 'status-review');
    const key = encodeURIComponent(row.review_key);
    return `<tr onclick="openReviewAuditModal('${key}', 'detail')">
      <td><span class="req-type-pill ${typeCls}">${row.type}</span></td>
      <td>${row.site}</td>
      <td><span class="brand-tag ${brandCls}">${row.brand}</span></td>
      <td>${row.sub}</td>
      <td title="${row.name}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">${row.name}</td>
      <td><span class="sku-cell">${row.sku}</span></td>
      <td>${renderPriorityTag(row)}</td>
      <td><span class="person-cell">${row.op || '—'}</span></td>
      <td><span class="person-cell">${row.writer || '—'}</span></td>
      <td>${renderLaunchDate(row)}</td>
      <td>${row.date || '—'}</td>
      <td><span class="submit-time-cell">${row.submit_time || '—'}</span></td>
      <td><span class="submit-time-cell">${row.review_time || '—'}</span></td>
      <td><span class="status-pill ${statusCls}">${row.review_status}</span></td>
      <td onclick="event.stopPropagation()">${renderReviewRowActions(row)}</td>
    </tr>`;
  }).join('');
  document.getElementById('rv-pg-total').textContent = reviewCurrentListData.length;
}

function renderReviewRowActions(row) {
  const sku = row.sku;
  const key = encodeURIComponent(row.review_key);
  const div = `<span class="row-action-divider"></span>`;
  const detail = `<button class="row-action-btn" onclick="event.stopPropagation();openReviewAuditModal('${key}', 'detail')">详情</button>`;
  const audit = `<button class="row-action-btn warn" onclick="event.stopPropagation();openReviewAuditModal('${key}', 'audit')">审核</button>`;
  const rejectLog = `<button class="row-action-btn danger" onclick="event.stopPropagation();openReviewRejectRecord('${key}')">驳回记录</button>`;
  if (row.review_status === '待审核') return `<div class="row-actions">${audit}</div>`;
  if (row.review_status === '已驳回') return `<div class="row-actions">${rejectLog}</div>`;
  return `<div class="row-actions">${detail}</div>`;
}

function ensureReviewAuditModal() {
  let modal = document.getElementById('review-audit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'review-audit-overlay';
    modal.id = 'review-audit-modal';
    modal.setAttribute('onclick', 'if(event.target===this)closeReviewAuditModal()');
    modal.innerHTML = `
      <div class="review-audit-box" onclick="event.stopPropagation()">
        <div class="review-audit-head">
          <div>
            <h3 id="review-audit-title">需求审核</h3>
            <p id="review-audit-subtitle"></p>
          </div>
          <button type="button" class="review-audit-close" onclick="closeReviewAuditModal()">×</button>
        </div>
        <div class="review-audit-body" id="review-audit-body"></div>
        <div class="review-audit-foot" id="review-audit-foot"></div>
      </div>`;
  }
  if (modal.parentElement !== document.body) document.body.appendChild(modal);
  return modal;
}

function closeReviewAuditModal() {
  const modal = ensureReviewAuditModal();
  if (modal) modal.classList.remove('show');
}

function reviewEscape(value) {
  const text = String(value ?? '');
  return typeof escapeAiHtml === 'function'
    ? escapeAiHtml(text)
    : text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function renderReviewDetail(row) {
  const esc = reviewEscape;
  const data = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA : {};
  return renderReviewModuleBrowser(data, row, esc);
}

function renderReviewModuleBrowser(data, row, esc) {
  const modules = [
    ['review-basic', '基础信息', 'basic'],
    ['review-product', '产品信息', 'cube'],
    ['review-seo', 'SEO 信息', 'keyword'],
    ['review-competitor', '竞对信息', 'swords'],
    ['review-selling', '卖点信息', 'bullets'],
    ['review-audience', '目标人群', 'target'],
    ['review-pain', '用户痛点', 'sparkles'],
    ['review-stp', '产品 STP', 'target'],
  ];
  return `
    <div class="review-module-browser">
      <aside class="review-module-outline">
        <div class="review-outline-head">
          <span class="review-outline-title">
            <span class="review-outline-icon">${I('listChecks', 16)}</span>
            <strong>内容大纲</strong>
          </span>
          <button type="button" class="review-outline-collapse" onclick="toggleReviewOutline()" title="收起/展开">${I('arrowL', 14)}</button>
        </div>
        ${modules.map(([id, label, icon]) => `
          <button type="button" class="review-outline-item" onclick="scrollReviewModule('${id}')" title="${esc(label)}">
            <span class="review-outline-item-icon">${I(icon, 16)}</span>
            <span class="review-outline-item-text">${esc(label)}</span>
          </button>
        `).join('')}
      </aside>
      <div class="review-module-content">
        ${renderReviewBasicModule(data.basic || [], row, esc)}
        ${renderReviewProductModule(data.product || {}, esc)}
        ${renderReviewSeoModule(data.seo || { rows: [] }, esc)}
        ${renderReviewCompetitorModule(data.competitor || [], esc)}
        ${renderReviewSellingModule(data.selling || {}, esc)}
        ${renderReviewAudienceModule(data.audience || {}, esc)}
        ${renderReviewPainModule(data.pain || [], esc)}
        ${renderReviewStpModule(data.stp || { columns: [], rows: [] }, esc)}
      </div>
    </div>`;
}

function toggleReviewOutline() {
  const outline = document.querySelector('#review-audit-modal .review-module-outline');
  if (!outline) return;
  outline.classList.toggle('collapsed');
  const browser = outline.closest('.review-module-browser');
  if (browser) browser.classList.toggle('outline-collapsed', outline.classList.contains('collapsed'));
}

function scrollReviewModule(id) {
  const modalBody = document.getElementById('review-audit-body');
  const el = document.getElementById(id);
  if (!modalBody || !el) return;
  modalBody.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
}

function reviewModuleCard(id, title, body) {
  return `
    <section class="review-module-card" id="${id}">
      <div class="review-module-head">
        <h4>${title}</h4>
      </div>
      <div class="review-module-body">${body}</div>
    </section>`;
}

function renderReviewBasicModule(basic, row, esc) {
  const needLaunch = /新品.*(Listing|Title|TD|图片文案|卖点视频|操作视频)/.test(row.type);
  const merged = [
    ['需求类型', row.type],
    ['站点', row.site],
    ['子品类', row.sub],
    ['SKU', row.sku],
    ['产品名称', row.name],
    ['品牌', row.brand],
    ['需求提交人', row.op || '—'],
    ['文案人员', row.writer || '—'],
    ['期望交付时间', row.date || '—'],
    ...(needLaunch ? [['产品开卖时间', row.launch_date || '—']] : []),
    ['提交审核时间', row.submit_time || '—'],
    ...basic.filter(item => !['文案需求类型', '站点', '子品类', 'SKU', '产品名称', '品牌', '文案人员'].includes(item.label)).map(item => [item.label, item.value]),
  ];
  return reviewModuleCard('review-basic', '基础信息', `
    <div class="review-info-grid">
      ${merged.map(([label, value]) => `
        <div class="review-info-cell">
          <span>${esc(label)}</span>
          <strong>${esc(value || '—')}</strong>
        </div>
      `).join('')}
    </div>`);
}

function renderReviewProductModule(product, esc) {
  return reviewModuleCard('review-product', '产品信息', `
    <div class="review-product-layout">
      <div class="review-product-img">
        ${product.image ? `<img src="${esc(product.image)}" alt="${esc(product.imageAlt || '')}" />` : '<div>暂无产品图</div>'}
        <span>${esc(product.imageAlt || '产品图')}</span>
      </div>
      <div class="review-product-main">
        <div class="review-block-title">产品定位</div>
        <p>${esc(product.positioning || '—')}</p>
        <div class="review-chip-row">${(product.indications || []).map(i => `<span>${esc(i)}</span>`).join('')}</div>
      </div>
    </div>
    <div class="review-two-col">
      <div>
        <div class="review-block-title">产品信用状</div>
        ${(product.credentials || []).map(i => `<div class="review-kv"><span>${esc(i.label)}</span><strong>${esc(i.value)}</strong></div>`).join('')}
      </div>
      <div>
        <div class="review-block-title">K 好信息字段</div>
        ${(product.kInfo || []).map(i => `<div class="review-kv"><span>${esc(i.label)}</span><strong>${esc(i.value)}</strong></div>`).join('')}
      </div>
    </div>`);
}

function renderReviewSeoModule(seo, esc) {
  return reviewModuleCard('review-seo', 'SEO 信息', `
    <div class="review-table-wrap">
      <table class="review-mini-table">
        <thead><tr><th>SEO</th><th>Search Frequency Rank</th><th>相关性</th></tr></thead>
        <tbody>${(seo.rows || []).map(r => `
          <tr><td>${esc(r.keyword)}</td><td>${esc(r.rank)}</td><td><span class="review-rel-pill">${esc(r.relevance || '—')}</span></td></tr>
        `).join('')}</tbody>
      </table>
    </div>`);
}

function renderReviewCompetitorModule(list, esc) {
  return reviewModuleCard('review-competitor', '竞对信息', `
    <div class="review-competitor-grid">
      ${list.map((c, idx) => `
        <div class="review-comp-card">
          <div class="review-comp-top">
            <img src="${esc(c.image || '')}" alt="${esc(c.brand || '')}" onerror="this.style.display='none'" />
            <div>
              <span>竞品 ${idx + 1}</span>
              <strong>${esc(c.brand || '—')}</strong>
              <code>${esc(c.asin || '—')}</code>
            </div>
          </div>
          <div class="review-kv"><span>销售大类排名</span><strong>${esc(c.rankBig || '—')}</strong></div>
          <div class="review-kv"><span>销售小类排名</span><strong>${esc(c.rankSmall || '—')}</strong></div>
          <div class="review-kv"><span>总变体销量</span><strong>${esc(c.totalVariantSales || '—')}</strong></div>
          <div class="review-kv"><span>主体销量</span><strong>${esc(c.mainSales || '—')}</strong></div>
          <p class="review-comp-title">${esc(c.title || '—')}</p>
          <ol>${(c.tds || []).map(t => `<li>${esc(t)}</li>`).join('')}</ol>
        </div>
      `).join('')}
    </div>`);
}

function renderReviewSellingModule(selling, esc) {
  const groups = [
    ['usp', 'USP · 独特卖点'],
    ['ksp', 'KSP · 核心卖点'],
    ['osp', 'OSP · 补充卖点'],
  ];
  return reviewModuleCard('review-selling', '卖点信息', `
    <div class="review-selling-grid">
      ${groups.map(([key, title]) => `
        <div class="review-selling-group">
          <h5>${title}</h5>
          ${(selling[key] || []).map((item, idx) => `
            <div class="review-selling-item">
              <span>${idx + 1}</span>
              <div><strong>${esc(item.title)}</strong><p>${esc(item.desc)}</p></div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>`);
}

function renderReviewAudienceModule(audience, esc) {
  const top = [
    ['性别', audience.gender],
    ['年龄', audience.age],
    ['社会地位', audience.socialStatus],
    ['身份认同', audience.identity],
  ];
  return reviewModuleCard('review-audience', '目标人群', `
    <div class="review-info-grid">
      ${top.map(([label, value]) => `<div class="review-info-cell wide"><span>${label}</span><strong>${esc(value || '—')}</strong></div>`).join('')}
    </div>
    <div class="review-two-col audience-info">
      ${(audience.userInfo || []).map(i => `<div class="review-kv"><span>${esc(i.label)}</span><strong>${esc(i.value)}</strong></div>`).join('')}
    </div>`);
}

function renderReviewPainModule(pain, esc) {
  return reviewModuleCard('review-pain', '用户痛点', `
    <div class="review-pain-list">
      ${pain.map((item, idx) => `
        <div class="review-pain-item"><span>痛点 ${idx + 1}</span><strong>${esc(item.pain)}</strong></div>
      `).join('')}
    </div>`);
}

function renderReviewStpModule(stp, esc) {
  return reviewModuleCard('review-stp', '产品 STP 信息', `
    <div class="review-table-wrap stp">
      <table class="review-mini-table review-stp-table">
        <thead>
          <tr><th>关键拼比项</th>${(stp.columns || []).map(c => `<th>${esc(c.name)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</th>`).join('')}</tr>
        </thead>
        <tbody>
          <tr><td>图片</td>${(stp.columns || []).map(c => `<td><img class="review-stp-img" src="${esc(c.image || '')}" alt="${esc(c.name || '')}" onerror="this.style.display='none'" /></td>`).join('')}</tr>
          ${(stp.rows || []).map(r => `<tr><td>${esc(r.label)}</td>${(r.values || []).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>`);
}

function openReviewAuditModal(encodedKey, mode = 'audit') {
  const key = decodeReviewKey(encodedKey);
  const row = findReviewRowByKey(key);
  if (!row) {
    showToast('未找到审核数据', 'warning');
    return;
  }
  const modal = ensureReviewAuditModal();
  const title = document.getElementById('review-audit-title');
  const subtitle = document.getElementById('review-audit-subtitle');
  const body = document.getElementById('review-audit-body');
  const foot = document.getElementById('review-audit-foot');
  if (!modal || !body || !foot) return;
  title.textContent = mode === 'audit' ? '需求审核' : '查看详情';
  subtitle.textContent = `${row.type} · ${row.sku} · ${row.name}`;
  body.innerHTML = '<div class="review-loading">正在加载审核内容...</div>';
  foot.innerHTML = mode === 'audit' && row.review_status === '待审核'
    ? `<div class="review-audit-panel">
         <label for="review-reject-reason">驳回理由（点击驳回时必填）</label>
         <textarea id="review-reject-reason" placeholder="请填写驳回原因，例如：SKU 信息不完整、产品资料缺失、需求类型不匹配等"></textarea>
       </div>
       <div class="review-audit-actions">
         <button type="button" class="btn btn-secondary" onclick="closeReviewAuditModal()">取消</button>
         <button type="button" class="btn btn-danger" onclick="rejectReviewDemand('${encodedKey}')">驳回</button>
         <button type="button" class="btn btn-primary" onclick="approveReviewDemand('${encodedKey}')">通过</button>
       </div>`
    : '';
  modal.classList.add('show');
  try {
    body.innerHTML = (row.review_status === '已驳回' ? renderReviewRecordBlock(row) : '') + renderReviewDetail(row);
  } catch (e) {
    console.error('[review] render audit detail failed:', e);
    body.innerHTML = renderReviewFallbackDetail(row);
    showToast('审核详情模块加载异常，已展示基础信息', 'warning');
  }
}

function renderReviewFallbackDetail(row) {
  const esc = reviewEscape;
  const fields = [
    ['需求类型', row.type],
    ['站点', row.site],
    ['品牌', row.brand],
    ['子品类', row.sub],
    ['产品名称', row.name],
    ['SKU', row.sku],
    ['审核状态', row.review_status],
    ['运营人员', row.op || '—'],
    ['文案人员', row.writer || '—'],
    ['期望交付时间', row.date || '—'],
    ['提交审核时间', row.submit_time || '—'],
    ['审核时间', row.review_time || '—'],
  ];
  return `<div class="review-detail-summary"><div class="review-detail-grid">
    ${fields.map(([label, value]) => `<div class="review-detail-item"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`).join('')}
  </div></div>`;
}

function renderReviewRecordBlock(row, opts = {}) {
  const esc = reviewEscape;
  const record = row.decision_record || {};
  const encodedKey = encodeURIComponent(row.review_key || getReviewRowKey(row, 0));
  const showEdit = opts.showEdit !== false;

  let history = _normalizeDecisionHistory(record);
  if (history.length === 0) {
    history = [{ reason: row.reject_reason || '', time: row.review_time || '—', reviewer: row.reviewer || 'Mason' }];
  }
  const reversed = history.slice().reverse();
  const total = reversed.length;

  return `
    <div class="review-record-card">
      <div class="review-record-title">
        <span>驳回记录 <span class="review-record-badge">${total}</span></span>
        ${showEdit ? `<button type="button" class="review-record-edit-btn" onclick="goToReviewRejectedEdit('${encodedKey}')">去修改</button>` : ''}
      </div>
      <div class="review-record-timeline">
        ${reversed.map((item, i) => {
          const seq = total - i;
          const isLatest = i === 0;
          return `<div class="review-record-item ${isLatest ? 'latest' : ''}">
            <div class="review-record-dot"></div>
            <div class="review-record-body">
              <div class="review-record-head">
                <span class="review-record-seq">第${seq}次驳回</span>
                <span class="review-record-reviewer">${esc(item.reviewer || '—')}</span>
                <span class="review-record-time">${esc(item.time || '—')}</span>
              </div>
              <div class="review-record-reason">${esc(item.reason || '暂无驳回理由')}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function _normalizeDecisionHistory(decision) {
  if (!decision) return [];
  if (Array.isArray(decision.history)) return decision.history;
  if (decision.time) return [{ reason: decision.reason || '', time: decision.time, reviewer: decision.reviewer || '' }];
  return [];
}

function saveReviewDecision(encodedKey, status, reason = '') {
  const key = decodeReviewKey(encodedKey);
  const row = findReviewRowByKey(key);
  if (!row) return null;
  const decisions = readReviewDecisions();
  const now = new Date().toLocaleString('zh-CN');
  const existing = decisions[key];
  const history = _normalizeDecisionHistory(existing);
  history.push({ reason, time: now, reviewer: 'Mason' });
  decisions[key] = {
    status,
    sku: row.sku,
    type: row.type,
    name: row.name,
    submit_time: row.submit_time,
    history,
  };
  writeReviewDecisions(decisions);
  syncReviewDecisionToMockData(row, status, now);
  return decisions[key];
}

function syncReviewDecisionToMockData(row, status, time) {
  const patch = item => item && item.sku === row.sku && item.type === row.type && item.submit_time === row.submit_time;
  if (typeof COPY_LIST_DATA !== 'undefined') {
    const item = COPY_LIST_DATA.find(patch);
    if (item) {
      item.status = status;
      item.review_time = time;
    }
  }
  if (typeof LIST_DATA !== 'undefined') {
    const item = LIST_DATA.find(patch);
    if (item) {
      item.status = status;
    }
  }
}

function approveReviewDemand(encodedKey) {
  const record = saveReviewDecision(encodedKey, '已通过');
  if (!record) return;
  closeReviewAuditModal();
  applyReviewFilters();
  if (typeof applyFilters === 'function') applyFilters();
  if (typeof applyCopyFilters === 'function') applyCopyFilters();
  showToast('审核已通过', 'success');
}

function rejectReviewDemand(encodedKey) {
  const textarea = document.getElementById('review-reject-reason');
  const reason = (textarea && textarea.value ? textarea.value.trim() : '');
  if (!reason) {
    showToast('请先填写驳回理由', 'warning');
    if (textarea) textarea.focus();
    return;
  }
  const record = saveReviewDecision(encodedKey, '已驳回', reason);
  if (!record) return;
  closeReviewAuditModal();
  applyReviewFilters();
  if (typeof applyFilters === 'function') applyFilters();
  if (typeof applyCopyFilters === 'function') applyCopyFilters();
  showToast('已驳回并保存驳回记录', 'warning');
}

function openReviewRejectRecord(encodedKey, opts = {}) {
  const key = decodeReviewKey(encodedKey);
  const row = findReviewRowByKey(key);
  if (!row) {
    showToast('未找到驳回记录', 'warning');
    return;
  }
  const modal = ensureReviewAuditModal();
  const title = document.getElementById('review-audit-title');
  const subtitle = document.getElementById('review-audit-subtitle');
  const body = document.getElementById('review-audit-body');
  const foot = document.getElementById('review-audit-foot');
  if (!modal || !body || !foot) return;
  title.textContent = '驳回记录';
  subtitle.textContent = `${row.type} · ${row.sku} · ${row.name}`;
  body.innerHTML = renderReviewRecordBlock(row, opts) + renderReviewDetail(row);
  foot.innerHTML = '';
  modal.classList.add('show');
}

function goToReviewRejectedEdit(encodedKey) {
  const key = decodeReviewKey(encodedKey);
  const row = findReviewRowByKey(key);
  closeReviewAuditModal();
  if (typeof goToCreate === 'function') goToCreate({ skipSetStep: true, silent: true });
  if (typeof buildSummaryTags === 'function') buildSummaryTags();
  if (typeof setStep === 'function') setStep(2);
  if (typeof showResultPage === 'function') showResultPage();
  showToast(`进入修改页：${row ? row.sku : '已驳回需求'}`, 'success');
}

function openReviewRejectRecordBySku(sku, opts = {}) {
  const decisions = readReviewDecisions();
  const match = Object.entries(decisions).find(([, record]) => record && record.sku === sku && record.status === '已驳回');
  if (match) {
    openReviewRejectRecord(encodeURIComponent(match[0]), opts);
    return;
  }
  const row = getReviewListData().find(item => item.sku === sku && item.review_status === '已驳回');
  if (row) {
    openReviewRejectRecord(encodeURIComponent(row.review_key), opts);
    return;
  }
  showToast(`暂无驳回记录：${sku}`, 'warning');
}

// 明确暴露给 inline onclick，避免局部作用域或缓存场景导致点击无响应
window.openReviewAuditModal = openReviewAuditModal;
window.closeReviewAuditModal = closeReviewAuditModal;
window.approveReviewDemand = approveReviewDemand;
window.rejectReviewDemand = rejectReviewDemand;
window.openReviewRejectRecord = openReviewRejectRecord;
window.openReviewRejectRecordBySku = openReviewRejectRecordBySku;
window.toggleReviewOutline = toggleReviewOutline;
window.goToReviewRejectedEdit = goToReviewRejectedEdit;
