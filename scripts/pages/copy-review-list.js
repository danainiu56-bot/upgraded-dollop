/* ============================================
   文案审核列表（独立数据与筛选，函数前缀 cr*）
   ============================================ */

let crFilterSkuValue = '';
let crFilterSkuQuery = '';
let copyReviewCurrentFilters = {};
let copyReviewCurrentListData = [];
let copyAuditIssueMarks = [];
const COPY_REVIEW_DECISIONS_KEY = '__cursor_copy_review_decisions';

const COPY_REVIEW_LIST_DATA = [
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '药盒', name: '7格大容量粉色',       sku: 'PO17X4011', review_status: '待审核', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  launch_date: '2026/02/20', date: '2026/02/12', submit_time: '2026/02/08 10:15:42', review_time: '—' },
  { type: '新品图片文案', site: 'US', brand: 'AUVON', sub: '电疗', name: '伤口贴 10pack',       sku: 'PO17X4011', review_status: '待审核', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  launch_date: '2026/02/22', date: '2026/02/12', submit_time: '2026/02/07 14:20:33', review_time: '—' },
  { type: '新品图片文案', site: 'US', brand: 'AUVON', sub: '贴片', name: '针形贴片 20pack',     sku: 'PO17X4011', review_status: '待审核', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  launch_date: '2026/02/21', date: '2026/02/12', submit_time: '2026/02/09 08:55:21', review_time: '—' },
  { type: '新品FAQ',     site: 'US', brand: 'ZIKEE', sub: '贴片', name: '医疗款 TENS',         sku: 'PO17X4011', review_status: '待审核', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', launch_date: '2026/02/24', date: '2026/02/12', submit_time: '2026/02/09 16:08:52', review_time: '—' },
  { type: '新品FAQ',     site: 'US', brand: 'ZIKEE', sub: '贴片', name: '背光小夜灯',          sku: 'PO17X4011', review_status: '待审核', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', launch_date: '2026/02/25', date: '2026/02/12', submit_time: '2026/02/10 09:18:37', review_time: '—' },
  { type: '新品Listing', site: 'UK', brand: 'AUVON', sub: '药盒', name: '7格旅行药盒（粉色）', sku: 'PO19A2210', review_status: '待审核', bu: '物理治疗', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  launch_date: '2026/02/26', date: '2026/02/14', submit_time: '2026/02/11 08:42:55', review_time: '—' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '银色 TENS 套装',      sku: 'PO17X4011', review_status: '已驳回', bu: '北美市场', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  launch_date: '2026/02/23', date: '2026/02/12', submit_time: '2026/02/09 13:42:08', review_time: '2026/02/10 10:08:55', reject_history: [{ reason: 'Title 核心关键词 weekly pill organizer 位置靠后，建议前置到前 80 字符以内。', time: '2026/02/10 10:08:55', reviewer: 'Suki' }, { reason: '卖点排序偏功能罗列，Bullet 1 应优先回答容量与防洒便携等购买决策点。', time: '2026/02/12 15:22:10', reviewer: 'Susie' }, { reason: 'TD 描述缺少场景化表达，建议补充 travel / daily routine 使用场景。', time: '2026/02/15 09:41:33', reviewer: 'Susie' }] },
  { type: '老品TD',      site: 'UK', brand: 'ZIKEE', sub: '电疗', name: '理疗仪豪华版',        sku: 'PO19B5621', review_status: '已驳回', bu: '北美市场', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  date: '2026/02/14', submit_time: '2026/02/11 15:33:04', review_time: '2026/02/12 09:48:21', reject_history: [{ reason: '产品参数描述不准确，需核实 TENS 频率范围与 FDA 认证编号。', time: '2026/02/12 09:48:21', reviewer: 'Tammy' }, { reason: '竞品差异化卖点表述不足，建议增加与 iReliev 和 HealthmateForever 的对比说明。', time: '2026/02/14 11:15:08', reviewer: 'Suki' }] },
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '药盒', name: '7格弹跳药盒',         sku: 'PO17X4011', review_status: '已通过', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  launch_date: '2026/02/20', date: '2026/02/12', submit_time: '2026/02/08 09:32:14', review_time: '2026/04/27 18:27:30' },
  { type: '老品TD',      site: 'US', brand: 'AUVON', sub: '药盒', name: '透明外壳药盒',         sku: 'PO17X4011', review_status: '已通过', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  date: '2026/02/12', submit_time: '2026/02/08 11:48:09', review_time: '2026/02/09 09:25:33' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '黑色外壳药盒',         sku: 'PO17X4011', review_status: '已通过', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', launch_date: '2026/02/26', date: '2026/02/12', submit_time: '2026/02/10 11:25:46', review_time: '2026/02/11 14:32:08' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '背光小夜灯',           sku: 'PO17X4011', review_status: '已通过', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', launch_date: '2026/02/27', date: '2026/02/12', submit_time: '2026/02/10 14:50:11', review_time: '2026/02/11 16:18:49' },
  { type: '新品Title',   site: 'DE', brand: 'AMOOS', sub: '夜灯', name: '玫瑰金小夜灯（暖光）', sku: 'PO20A1101', review_status: '已通过', bu: '家居关怀', bu_lead: 'Suki', op: 'Sam',   writer: 'Mike',  date: '2026/02/15', submit_time: '2026/02/12 10:08:36', review_time: '2026/04/27 18:27:34' },
];

function getCopyReviewRowKey(row, idx) {
  return [idx, row.sku, row.type, row.submit_time || ''].join('|');
}

function readCopyReviewDecisions() {
  try {
    const raw = sessionStorage.getItem(COPY_REVIEW_DECISIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeCopyReviewDecisions(data) {
  try { sessionStorage.setItem(COPY_REVIEW_DECISIONS_KEY, JSON.stringify(data || {})); } catch (e) {}
}

function getCopyReviewListData() {
  const decisions = readCopyReviewDecisions();
  return COPY_REVIEW_LIST_DATA.map((row, idx) => {
    const reviewKey = getCopyReviewRowKey(row, idx);
    const decision = decisions[reviewKey];
    return {
      ...row,
      review_key: reviewKey,
      review_status: decision ? decision.status : row.review_status,
      review_time: decision ? decision.time : row.review_time,
      reject_reason: decision ? (decision.reason || '') : (row.reject_reason || ''),
      decision_record: decision || null,
    };
  });
}

function findCopyReviewRowByKey(key) {
  return getCopyReviewListData().find(row => row.review_key === key) || null;
}

function decodeCopyReviewKey(encodedKey) {
  try { return decodeURIComponent(encodedKey); } catch (e) { return encodedKey; }
}

function copyReviewEscape(value) {
  const text = String(value ?? '');
  return typeof escapeAiHtml === 'function'
    ? escapeAiHtml(text)
    : text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function renderCopyReviewView() {
  const root = document.getElementById('copy-review-view');
  if (!root) return;
  if (!root.dataset.ready) {
    root.innerHTML = copyReviewTemplate();
    root.dataset.ready = '1';
    renderCrPersonValueOptions('writer');
    updateCrFilterSkuTrigger();
  }
  applyCopyReviewFilters();
}

function copyReviewTemplate() {
  return `
    <div class="list-filter-bar">
      <div class="list-filter-row">
        <div class="filter-group">
          <select class="filter-select" id="cr-req-type" onchange="applyCopyReviewFilters()">
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
          <select class="filter-select" id="cr-site" onchange="applyCopyReviewFilters()">
            <option value="">全部站点</option>
            <option value="US">🇺🇸 US</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="DE">🇩🇪 DE</option>
            <option value="JP">🇯🇵 JP</option>
            <option value="CA">🇨🇦 CA</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="cr-brand" onchange="applyCopyReviewFilters()">
            <option value="">全部品牌</option>
            <option value="AUVON">AUVON</option>
            <option value="ZIKEE">ZIKEE</option>
            <option value="AMOOS">AMOOS</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="cr-subcategory" onchange="applyCopyReviewFilters()">
            <option value="">全部子品类</option>
            <option value="药盒">药盒</option>
            <option value="电疗">电疗</option>
            <option value="贴片">贴片</option>
            <option value="夜灯">夜灯</option>
          </select>
        </div>
        <div class="filter-group filter-sku-wrap" data-cr="1">
          <button type="button" class="filter-select filter-sku-trigger" id="cr-sku-trigger" onclick="toggleCrFilterSkuDropdown(event)">
            <span id="cr-sku-text" class="f-sku-placeholder">SKU</span>
          </button>
          <div class="f-sku-dropdown" id="cr-sku-dropdown">
            <div class="f-sku-search-bar">
              <input type="text" class="f-sku-search-input" id="cr-sku-search" placeholder="🔍 搜索 SKU 编号或名称..." oninput="filterCrSkuDropdownOptions()" onclick="event.stopPropagation()" />
            </div>
            <div class="f-sku-toolbar">
              <span style="font-size:12px;color:var(--text-muted);">共 <span id="cr-sku-total">0</span> 个</span>
              <button type="button" class="sku-toolbar-btn" onclick="clearCrFilterSku(event)">清除</button>
            </div>
            <div class="f-sku-list" id="cr-sku-list"></div>
          </div>
        </div>
        <div class="filter-group filter-group-wide">
          <div class="combo-select">
            <select class="combo-select-left" id="cr-person-type" onchange="onCrPersonTypeChange()">
              <option value="writer">文案人员</option>
              <option value="op">需求提交人</option>
              <option value="bu">事业部</option>
              <option value="bu_lead">BU长</option>
            </select>
            <select class="combo-select-right" id="cr-person-value" onchange="applyCopyReviewFilters()"></select>
          </div>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="cr-status" onchange="applyCopyReviewFilters()">
            <option value="">全部状态</option>
            <option value="待审核">待审核</option>
            <option value="已驳回">已驳回</option>
            <option value="已通过">已通过</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="filter-btn" onclick="resetCopyReviewFilters()">重置</button>
        </div>
      </div>
      <div class="filter-applied" id="cr-applied"></div>
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
            <th style="width:110px;">事业部</th>
            <th style="width:80px;">BU长</th>
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
        <tbody id="cr-tbody"></tbody>
      </table>
    </div>

    <div class="list-pagination">
      <span>共 <strong id="cr-pg-total">0</strong> 条</span>
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

    <div class="review-audit-overlay" id="copy-audit-modal" onclick="if(event.target===this)closeCopyAuditModal()">
      <div class="review-audit-box copy-audit-box" onclick="event.stopPropagation()">
        <div class="review-audit-head">
          <div>
            <h3 id="copy-audit-title">文案审核</h3>
            <p id="copy-audit-subtitle"></p>
          </div>
          <button type="button" class="review-audit-close" onclick="closeCopyAuditModal()">×</button>
        </div>
        <div class="review-audit-body" id="copy-audit-body"></div>
        <div class="review-audit-foot" id="copy-audit-foot"></div>
      </div>
    </div>
  `;
}

function onCrPersonTypeChange() {
  const type = document.getElementById('cr-person-type').value;
  renderCrPersonValueOptions(type);
  applyCopyReviewFilters();
}

function renderCrPersonValueOptions(type) {
  const sel = document.getElementById('cr-person-value');
  if (!sel) return;
  const opt = PERSON_OPTIONS[type] || PERSON_OPTIONS.writer;
  sel.innerHTML = `<option value="">全部</option>` +
    opt.items.map(it => `<option value="${it}">${it}</option>`).join('');
}

function toggleCrFilterSkuDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('cr-sku-dropdown');
  if (!dd) return;
  if (dd.classList.contains('show')) closeCrFilterSkuDropdown();
  else openCrFilterSkuDropdown();
}

function openCrFilterSkuDropdown() {
  const dd = document.getElementById('cr-sku-dropdown');
  if (!dd) return;
  dd.classList.add('show');
  document.getElementById('cr-sku-total').textContent = FILTER_SKU_POOL.length;
  renderCrFilterSkuList();
  setTimeout(() => {
    const search = document.getElementById('cr-sku-search');
    if (search) search.focus();
  }, 50);
}

function closeCrFilterSkuDropdown() {
  const dd = document.getElementById('cr-sku-dropdown');
  if (dd) dd.classList.remove('show');
}

function filterCrSkuDropdownOptions() {
  crFilterSkuQuery = document.getElementById('cr-sku-search').value.trim().toLowerCase();
  renderCrFilterSkuList();
}

function renderCrFilterSkuList() {
  const list = document.getElementById('cr-sku-list');
  if (!list) return;
  const q = crFilterSkuQuery;
  const filtered = q
    ? FILTER_SKU_POOL.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : FILTER_SKU_POOL;
  if (!filtered.length) {
    list.innerHTML = `<div class="f-sku-empty">没有匹配的 SKU</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => `
    <div class="f-sku-item ${crFilterSkuValue === s.code ? 'selected' : ''}" onclick="selectCrFilterSku('${s.code}')">
      <div class="f-sku-radio"></div>
      <div class="f-sku-info">
        <div class="f-sku-code">${s.code}</div>
        <div class="f-sku-name">${s.name}</div>
      </div>
    </div>
  `).join('');
}

function selectCrFilterSku(code) {
  crFilterSkuValue = code;
  updateCrFilterSkuTrigger();
  closeCrFilterSkuDropdown();
  applyCopyReviewFilters();
}

function clearCrFilterSku(e) {
  if (e) e.stopPropagation();
  crFilterSkuValue = '';
  crFilterSkuQuery = '';
  const search = document.getElementById('cr-sku-search');
  if (search) search.value = '';
  updateCrFilterSkuTrigger();
  renderCrFilterSkuList();
  applyCopyReviewFilters();
}

function updateCrFilterSkuTrigger() {
  const text = document.getElementById('cr-sku-text');
  if (!text) return;
  if (crFilterSkuValue) {
    const sku = FILTER_SKU_POOL.find(s => s.code === crFilterSkuValue);
    text.className = 'f-sku-selected';
    text.innerHTML = `<span style="font-family:'SF Mono',Monaco,monospace;">${crFilterSkuValue}</span>`
      + (sku ? `<span style="color:var(--text-muted);font-size:11px;">${sku.name}</span>` : '');
  } else {
    text.className = 'f-sku-placeholder';
    text.textContent = 'SKU';
  }
}

function applyCopyReviewFilters() {
  const personType = document.getElementById('cr-person-type') ? document.getElementById('cr-person-type').value : 'writer';
  const personValue = document.getElementById('cr-person-value') ? document.getElementById('cr-person-value').value : '';
  copyReviewCurrentFilters = {
    type: document.getElementById('cr-req-type').value,
    site: document.getElementById('cr-site').value,
    brand: document.getElementById('cr-brand').value,
    sub: document.getElementById('cr-subcategory').value,
    sku: crFilterSkuValue,
    person: personValue,
    personType,
    status: document.getElementById('cr-status').value,
  };
  copyReviewCurrentListData = getCopyReviewListData().filter(row => {
    const f = copyReviewCurrentFilters;
    if (f.type && row.type !== f.type) return false;
    if (f.site && row.site !== f.site) return false;
    if (f.brand && row.brand !== f.brand) return false;
    if (f.sub && row.sub !== f.sub) return false;
    if (f.sku && row.sku !== f.sku) return false;
    if (f.person) {
      if (personType === 'writer' && row.writer !== f.person) return false;
      if (personType === 'op' && row.op !== f.person) return false;
      if (personType === 'bu' && getCopyReviewBu(row) !== f.person) return false;
      if (personType === 'bu_lead' && 'Suki' !== f.person) return false;
    }
    if (f.status && row.review_status !== f.status) return false;
    return true;
  });
  const order = { '待审核': 1, '已驳回': 2, '已通过': 3 };
  copyReviewCurrentListData.sort((a, b) => (order[a.review_status] || 99) - (order[b.review_status] || 99));
  renderCopyReviewTable();
  renderCopyReviewAppliedFilters();
}

function getCopyReviewBu(row) {
  if (row.bu) return row.bu;
  if (row.brand === 'ZIKEE') return '北美市场';
  if (row.brand === 'AMOOS') return '家居关怀';
  return '物理治疗';
}

function resetCopyReviewFilters() {
  ['cr-req-type', 'cr-site', 'cr-brand', 'cr-subcategory', 'cr-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  crFilterSkuValue = '';
  crFilterSkuQuery = '';
  const sk = document.getElementById('cr-sku-search');
  if (sk) sk.value = '';
  updateCrFilterSkuTrigger();
  const pt = document.getElementById('cr-person-type');
  if (pt) pt.value = 'writer';
  renderCrPersonValueOptions('writer');
  const pv = document.getElementById('cr-person-value');
  if (pv) pv.value = '';
  applyCopyReviewFilters();
}

function getCopyReviewPersonLabel(type) {
  if (type === 'op') return '需求提交人';
  return (PERSON_OPTIONS[type] || {}).label || '人员';
}

function renderCopyReviewAppliedFilters() {
  const wrap = document.getElementById('cr-applied');
  if (!wrap) return;
  const labels = { type: '需求类型', site: '站点', brand: '品牌', sub: '子品类', sku: 'SKU', status: '状态' };
  const chips = [];
  Object.keys(labels).forEach(k => {
    if (copyReviewCurrentFilters[k]) {
      chips.push(`<span class="filter-chip">
        <span class="chip-label">${labels[k]}：</span>
        <span class="chip-val">${copyReviewCurrentFilters[k]}</span>
        <span class="chip-close" onclick="clearCopyReviewFilter('${k}')">×</span>
      </span>`);
    }
  });
  if (copyReviewCurrentFilters.person) {
    chips.push(`<span class="filter-chip">
      <span class="chip-label">${getCopyReviewPersonLabel(copyReviewCurrentFilters.personType)}：</span>
      <span class="chip-val">${copyReviewCurrentFilters.person}</span>
      <span class="chip-close" onclick="clearCopyReviewFilter('person')">×</span>
    </span>`);
  }
  if (!chips.length) {
    wrap.innerHTML = '';
    return;
  }
  chips.push(`<a class="chip-clear-all" onclick="resetCopyReviewFilters()">清除全部</a>`);
  wrap.innerHTML = chips.join('');
}

function clearCopyReviewFilter(key) {
  if (key === 'sku') {
    clearCrFilterSku();
    return;
  }
  if (key === 'person') {
    const pv = document.getElementById('cr-person-value');
    if (pv) pv.value = '';
    applyCopyReviewFilters();
    return;
  }
  const idMap = { type: 'cr-req-type', site: 'cr-site', brand: 'cr-brand', sub: 'cr-subcategory', status: 'cr-status' };
  const el = document.getElementById(idMap[key]);
  if (el) el.value = '';
  applyCopyReviewFilters();
}

function renderCopyReviewTable() {
  const tbody = document.getElementById('cr-tbody');
  if (!tbody) return;
  if (!copyReviewCurrentListData.length) {
    tbody.innerHTML = `<tr><td colspan="17" style="text-align:center;padding:60px 16px;color:var(--text-light);">
      <div style="font-size:28px;margin-bottom:8px;">📭</div>
      <div>没有匹配的数据</div>
    </td></tr>`;
    document.getElementById('cr-pg-total').textContent = 0;
    return;
  }
  tbody.innerHTML = copyReviewCurrentListData.map(row => {
    const typeCls = REQ_TYPE_STYLES[row.type] || 'req-type-listing';
    const brandCls = row.brand === 'ZIKEE' ? 'brand-zikee' : (row.brand === 'AMOOS' ? 'brand-amoos' : '');
    const statusCls = row.review_status === '已通过' ? 'status-pass' : (row.review_status === '已驳回' ? 'status-reject' : 'status-review');
    const key = encodeURIComponent(row.review_key);
    return `<tr onclick="openCopyAuditModal('${key}', 'detail', { auditView: true })">
      <td><span class="req-type-pill ${typeCls}">${row.type}</span></td>
      <td>${row.site}</td>
      <td><span class="brand-tag ${brandCls}">${row.brand}</span></td>
      <td>${row.sub}</td>
      <td title="${row.name}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">${row.name}</td>
      <td><span class="sku-cell">${row.sku}</span></td>
      <td>${renderPriorityTag(row)}</td>
      <td><span style="color:var(--text);font-size:12px;">${row.bu || getCopyReviewBu(row)}</span></td>
      <td><span class="person-cell">${row.bu_lead || 'Suki'}</span></td>
      <td><span class="person-cell">${row.op || '—'}</span></td>
      <td><span class="person-cell">${row.writer || '—'}</span></td>
      <td>${renderLaunchDate(row)}</td>
      <td>${row.date || '—'}</td>
      <td><span class="submit-time-cell">${row.submit_time || '—'}</span></td>
      <td><span class="submit-time-cell">${row.review_time || '—'}</span></td>
      <td><span class="status-pill ${statusCls}">${row.review_status}</span></td>
      <td onclick="event.stopPropagation()">${renderCopyReviewActions(row)}</td>
    </tr>`;
  }).join('');
  document.getElementById('cr-pg-total').textContent = copyReviewCurrentListData.length;
}

function renderCopyReviewActions(row) {
  const key = encodeURIComponent(row.review_key);
  const detail = `<button class="row-action-btn" onclick="event.stopPropagation();openCopyAuditModal('${key}', 'detail', { auditView: true })">详情</button>`;
  const audit = `<button class="row-action-btn warn" onclick="event.stopPropagation();openCopyAuditModal('${key}', 'audit', { auditView: true })">审核</button>`;
  const rejectLog = `<button class="row-action-btn danger" onclick="event.stopPropagation();openCopyAuditRecord('${key}')">驳回记录</button>`;
  if (row.review_status === '待审核') return `<div class="row-actions">${audit}</div>`;
  if (row.review_status === '已驳回') return `<div class="row-actions">${rejectLog}</div>`;
  return `<div class="row-actions">${detail}</div>`;
}

function closeCopyAuditModal() {
  const modal = ensureCopyAuditModal();
  if (modal) modal.classList.remove('show', 'copy-audit-drawer-mode');
  stopCopyAuditResize();
}

function ensureCopyAuditModal() {
  let modal = document.getElementById('copy-audit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'review-audit-overlay';
    modal.id = 'copy-audit-modal';
    modal.setAttribute('onclick', 'if(event.target===this)closeCopyAuditModal()');
    modal.innerHTML = `
      <div class="review-audit-box copy-audit-box" onclick="event.stopPropagation()">
        <div class="review-audit-head">
          <div>
            <h3 id="copy-audit-title">文案审核</h3>
            <p id="copy-audit-subtitle"></p>
          </div>
          <button type="button" class="review-audit-close" onclick="closeCopyAuditModal()">×</button>
        </div>
        <div class="review-audit-body" id="copy-audit-body"></div>
        <div class="review-audit-foot" id="copy-audit-foot"></div>
      </div>`;
  }
  if (modal.parentElement !== document.body) document.body.appendChild(modal);
  return modal;
}

function openCopyAuditModal(encodedKey, mode = 'audit', opts = {}) {
  const key = decodeCopyReviewKey(encodedKey);
  const row = findCopyReviewRowByKey(key);
  if (!row) {
    showToast('未找到文案审核数据', 'warning');
    return;
  }
  const modal = ensureCopyAuditModal();
  const title = document.getElementById('copy-audit-title');
  const subtitle = document.getElementById('copy-audit-subtitle');
  const body = document.getElementById('copy-audit-body');
  const foot = document.getElementById('copy-audit-foot');
  if (!modal || !body || !foot) return;
  modal.classList.remove('copy-audit-drawer-mode');
  copyAuditIssueMarks = [];
  title.textContent = opts.title || (mode === 'audit' ? '文案审核' : '查看详情');
  const auditPayload = getCopyAuditPayload(row);
  subtitle.innerHTML = renderCopyAuditHeaderSummary(row, auditPayload);
  let showRejectEdit;
  if (opts.auditView) {
    showRejectEdit = false;
  } else if (opts.callerStatus) {
    showRejectEdit = opts.callerStatus === '已驳回';
  } else {
    showRejectEdit = row.review_status === '已驳回';
  }
  body.innerHTML = (row.review_status === '已驳回' ? renderCopyAuditRecord(row, showRejectEdit) : '') + renderCopyAuditDetail(row, { hideInfo: opts.hideInfo === true, payload: auditPayload });
  foot.innerHTML = mode === 'audit' && row.review_status === '待审核'
    ? `<div class="review-audit-panel">
         <div class="copy-quick-review">
           <span>5. 审核结论</span>
           <em>已标记 <strong id="copy-marked-count">0</strong> 个问题</em>
           <button type="button" onclick="selectCopyQuickReview('通过')">通过</button>
           <button type="button" onclick="selectCopyQuickReview('因果链不完整')">因果链不完整</button>
           <button type="button" onclick="selectCopyQuickReview('卖点没有表达出来')">卖点没有表达出来</button>
           <button type="button" onclick="selectCopyQuickReview('信息错误')">信息错误</button>
           <button type="button" onclick="selectCopyQuickReview('其他')">其他</button>
         </div>
         <div class="copy-reject-reason-wrap" id="copy-reject-reason-wrap">
           <label for="copy-audit-reject-reason">驳回理由（点击驳回时必填）</label>
           <textarea id="copy-audit-reject-reason" placeholder="请填写驳回原因，例如：Title 关键词堆砌、TD 证据不足、竞品对比结论不准确等"></textarea>
         </div>
       </div>
       <div class="review-audit-actions">
         <button type="button" class="btn btn-secondary" onclick="closeCopyAuditModal()">取消</button>
         <button type="button" class="btn btn-danger" onclick="rejectCopyAudit('${encodedKey}')">驳回</button>
         <button type="button" class="btn btn-primary" onclick="approveCopyAudit('${encodedKey}')">通过</button>
       </div>`
    : '';
  resetCopyAuditSplit();
  modal.classList.add('show');
}

function openCopyAuditRecord(encodedKey) {
  const key = decodeCopyReviewKey(encodedKey);
  const row = findCopyReviewRowByKey(key);
  if (!row) {
    showToast('未找到驳回记录', 'warning');
    return;
  }
  openCopyAuditModal(encodedKey, 'detail', { title: '驳回记录', hideInfo: true, auditView: true });
}

function openCopyAuditRecordBySku(sku, callerStatus) {
  const list = getCopyReviewListData();
  const row = list.find(item => item.sku === sku && item.review_status === '已驳回')
    || list.find(item => item.sku === sku)
    || list[0];
  if (!row) {
    showToast(`暂无文案审核记录：${sku}`, 'warning');
    return;
  }
  openCopyAuditModal(encodeURIComponent(row.review_key), 'detail', { title: '驳回记录', hideInfo: true, callerStatus: callerStatus });
}

function getCopyAuditPayload(row) {
  const product = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.product) || {};
  const seo = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.seo) || { rows: [] };
  const competitors = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.competitor) || [];
  const title = `${row.brand} ${row.name}, BPA-Free Weekly Pill Organizer, Portable Travel Pill Case for Vitamins, Supplements and Daily Medication`;
  const tds = [
    '7-Day Medication Planning: Clearly separated compartments help users organize a full week of pills and reduce missed doses.',
    'Portable Daily Use: Compact case fits handbag, backpack or bedside drawer, suitable for home, office and travel scenarios.',
    'BPA-Free Material: Food-grade PP material supports safe long-term contact with vitamins, supplements and daily medication.',
    'Secure Snap Lids: Reinforced lids help prevent accidental spills while remaining easy for seniors to open.',
    'Clear Visual Labels: High-contrast day marks make medication routines easier for elderly users and family caregivers.',
  ];
  return {
    title,
    tds,
    score: {
      total: 86,
      items: [
        ['SEO 覆盖', 88, '核心词 pill organizer / weekly pill case 已自然覆盖，建议补充 travel pill case。'],
        ['卖点表达', 84, '安全材质、便携、老年友好表达清晰，可加强防潮/密封证据。'],
        ['GEO 本地化', 82, '整体符合美国站表达习惯；可进一步强化 travel / daily medication 的搜索意图匹配。'],
        ['合规风险', 91, '未出现治疗承诺，整体安全；注意避免暗示治愈或替代医嘱。'],
        ['竞品差异', 80, '已体现便携和清晰标签，但与 EZY DOSE 的差异还可更直接。'],
      ],
      suggestions: [
        'GEO：Title 与 TD 可补充美国站常用的 travel / daily routine 场景表达。',
        'Title 后半段加入 “Travel Pill Case” 提升长尾词覆盖。',
        'TD-3 增加 BPA-Free 证据来源或材质说明，降低审核争议。',
        'TD-5 可加入 “senior-friendly” 但避免医疗疗效化表达。',
      ],
    },
    modules: [
      {
        id: 'copy-cat',
        title: '品类信息',
        icon: 'database',
        body: [
          ['文案需求类型', row.type],
          ['站点',         row.site],
          ['品牌',         row.brand],
          ['子品类',       row.sub],
          ['SKU',          row.sku],
          ['优先级',       row.priority || '—'],
          ['文案人员',     row.writer],
        ],
      },
      {
        id: 'copy-bsr',
        title: 'BSR 全景',
        icon: 'target',
        body: [['大类排名区间', 'Health & Personal Care · #1,200 - #3,800'], ['小类排名区间', 'Pill Organizers · #18 - #56'], ['近 30 天销量', '8,300 - 12,500 / 月'], ['价格带', '$8.99 - $15.99']],
      },
      {
        id: 'copy-comp-analysis',
        title: '竞对分析',
        icon: 'swords',
        body: [['主要竞品', 'EZY DOSE / Sukuos / Sagely'], ['共性卖点', '7 天管理、便携、BPA-Free、大容量'], ['机会点', '突出日历式管理、老人友好和旅行场景'], ['风险点', '竞品长期占据高频关键词，Title 需更聚焦']],
      },
      {
        id: 'copy-comp-copy',
        title: '竞对文案',
        icon: 'keyword',
        competitors,
      },
      {
        id: 'copy-product',
        title: '产品信息',
        icon: 'cube',
        product,
      },
      {
        id: 'copy-seo',
        title: 'SEO 关键词',
        icon: 'search',
        seo,
      },
      {
        id: 'copy-brand',
        title: '品牌信息',
        icon: 'sparkles',
        body: [['品牌', row.brand], ['品牌定位', '可靠、易用、面向家庭健康管理的 Amazon 健康护理品牌'], ['表达语气', '专业可信、清晰直给、避免夸大医疗承诺'], ['审核重点', '事实证据、关键词自然度、合规边界']],
      },
    ],
  };
}

function getCopyAuditRiskMeta(payload) {
  const total = payload && payload.score ? payload.score.total : 0;
  if (total >= 90) return { text: '低风险', cls: 'low' };
  if (total >= 82) return { text: '中风险', cls: 'mid' };
  return { text: '高风险', cls: 'high' };
}

function renderCopyAuditHeaderSummary(row, payload) {
  const esc = copyReviewEscape;
  const risk = getCopyAuditRiskMeta(payload);
  const priority = typeof getRowPriority === 'function' ? getRowPriority({ type: row.type }) : 'P1';
  const isImageCopy = /图片文案/.test(row.type || '');
  const isFaq = !isImageCopy && /FAQ/.test(row.type || '');
  return `
    <span class="copy-audit-head-summary">
      <span>${esc(row.type)} · ${esc(row.sku)} · ${esc(row.name)}</span>
      <span>站点 ${esc(row.site || '—')}</span>
      <span>优先级 ${esc(priority)}</span>
      <span>文案 ${esc(row.writer || '—')}</span>
      <span>交付 ${esc(row.date || '—')}</span>
      <span>AI ${esc(payload.score.total)} 分</span>
      <span class="risk-${risk.cls}">${risk.text}</span>
      ${isImageCopy ? '<span id="image-copy-progress" class="image-copy-progress">已标 0/7 张图 · 共 0 项问题</span>' : ''}
      ${isFaq ? '<span id="faq-copy-progress" class="image-copy-progress">已审 0/5 · 已标 0 项</span>' : ''}
    </span>
  `;
}

function renderCopyAuditDetail(row, opts = {}) {
  const esc = copyReviewEscape;
  const payload = opts.payload || getCopyAuditPayload(row);
  const isImageCopy = /图片文案/.test(row.type || '');
  const isFaq = !isImageCopy && /FAQ/.test(row.type || '');
  const categoryModule = payload.modules.find(m => m.id === 'copy-cat');
  const backgroundModules = payload.modules.filter(m => m.id !== 'copy-cat');
  const resizerHTML = opts.hideInfo ? '' : '<div class="copy-audit-resizer" title="拖动调整左右宽度" onmousedown="startCopyAuditResize(event)" ondblclick="resetCopyAuditSplit()"></div>';
  if (isImageCopy) {
    return `
      <div class="copy-audit-layout ${opts.hideInfo ? 'copy-audit-layout-single' : ''}">
        ${renderImageCopyAuditLeft(row, payload, opts)}
        ${resizerHTML}
        ${renderImageCopyAuditRight(row, payload)}
      </div>`;
  }
  if (isFaq) {
    return `
      <div class="copy-audit-layout ${opts.hideInfo ? 'copy-audit-layout-single' : ''}">
        ${renderFaqCopyAuditLeft(row, payload)}
        ${resizerHTML}
        ${renderFaqCopyAuditRight(row, payload)}
      </div>`;
  }
  return `
    <div class="copy-audit-layout ${opts.hideInfo ? 'copy-audit-layout-single' : ''}">
      <section class="copy-audit-left">
        ${categoryModule ? `<div class="copy-audit-card">
          <div class="copy-audit-card-title">1. 基础信息</div>
          <div class="review-info-grid copy-info-grid">
            ${categoryModule.body.map(([label, value]) => `<div class="review-info-cell"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`).join('')}
          </div>
        </div>` : ''}
        <div class="copy-audit-card">
          <div class="copy-audit-card-title">2. AI 评测打分</div>
          <div class="copy-audit-ai-score">${renderAiScoreCardLite(buildListingDemoScore())}</div>
        </div>
        ${opts.hideInfo ? '' : renderCopyAuditModuleBrowser(backgroundModules, esc)}
      </section>
      ${resizerHTML}
      <section class="copy-audit-right copy-audit-submission">
        <div class="copy-audit-card copy-submission-card">
          <div class="copy-audit-card-title">2. 提交内容：Title</div>
          <div class="copy-title-text">${esc(payload.title)}</div>
          ${renderCopyAuditIssueButtons('Title', 'Title')}
        </div>
        <div class="copy-audit-card copy-submission-card">
          <div class="copy-audit-card-title">2. 提交内容：TD</div>
          <div class="copy-td-review-list">
            ${payload.tds.map((td, i) => `
              <div class="copy-td-review-item">
                <div class="copy-td-index">TD-${i + 1}</div>
                <div class="copy-td-text">${esc(td)}</div>
                ${renderCopyAuditIssueButtons(`TD-${i + 1}`, `TD-${i + 1}`)}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>`;
}

function renderImageCopyAuditLeft(row, payload, opts) {
  const esc = copyReviewEscape;
  const md = (typeof MOCK_DATA !== 'undefined') ? MOCK_DATA : {};
  const categoryModule = payload.modules.find(m => m.id === 'copy-cat');
  const selling = md.selling || { usp: [], ksp: [], osp: [] };
  const gallery = (md.imageCreative && md.imageCreative.gallery) || [];
  const competitors = (md.product && md.product.productCompetitors) || [];
  const sellGroups = [
    { key: 'usp', code: 'USP', name: '独特卖点' },
    { key: 'ksp', code: 'KSP', name: '核心卖点' },
    { key: 'osp', code: 'OSP', name: '补充卖点' },
  ];
  return `
    <section class="copy-audit-left">
      ${categoryModule ? `<div class="copy-audit-card">
        <div class="copy-audit-card-title">1. 基础信息</div>
        <div class="review-info-grid copy-info-grid">
          ${categoryModule.body.map(([label, value]) => `<div class="review-info-cell"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`).join('')}
        </div>
      </div>` : ''}

      <div class="copy-audit-card">
        <div class="copy-audit-card-title">2. AI 评测打分</div>
        <div class="copy-audit-ai-score">${renderAiScoreCardLite(buildImageCopyDemoScore())}</div>
      </div>

      <div class="copy-audit-card">
        <div class="copy-audit-card-title">3. 卖点信息</div>
        <div class="image-copy-selling-list">
          ${sellGroups.map(g => `
            <div class="image-copy-selling-group">
              <div class="image-copy-selling-head">
                <span class="image-copy-selling-badge image-copy-selling-${g.key}">${g.code}</span>
                <span>${g.name} <em>(${(selling[g.key] || []).length} 条)</em></span>
              </div>
              <ul>
                ${(selling[g.key] || []).map(it => `
                  <li><strong>${esc(it.title || '')}</strong><span>${esc(it.desc || '')}</span></li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="copy-audit-card">
        <div class="copy-audit-card-title">4. 卖点创意</div>
        <ul class="image-copy-gallery-list">
          ${gallery.map((it, i) => `
            <li>
              <span class="image-copy-gallery-index">${esc(it.image || ('图' + (i + 1)))}</span>
              <span class="image-copy-gallery-text">${esc(it.productPoint || '')}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="copy-audit-card">
        <div class="copy-audit-card-title">5. 竞对信息</div>
        <div class="image-copy-comp-list">
          ${competitors.map((c, ci) => `
            <div class="image-copy-comp-card">
              <div class="image-copy-comp-head">
                <span class="image-copy-comp-index">竞对${['一','二','三','四','五'][ci] || ci + 1}</span>
                <strong>${esc(c.name || '')}</strong>
                <span class="image-copy-comp-asin">ASIN：<code>${esc(c.asin || '')}</code></span>
                <a class="image-copy-comp-link" href="${esc(c.link || '#')}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Amazon
                </a>
              </div>
              <div class="image-copy-listing-strip">
                ${(c.listingImages || []).map((url, ii) => `
                  <figure class="image-copy-listing-item" onclick="window.open('${esc(url)}','_blank')">
                    <img src="${esc(url)}" alt="${esc(c.name)}图${ii + 1}" loading="lazy">
                    <figcaption>${ii === 0 ? '主图' : '图' + (ii + 1)}</figcaption>
                  </figure>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function renderImageCopyAuditRight(row, payload) {
  const esc = copyReviewEscape;
  const md = (typeof MOCK_DATA !== 'undefined') ? MOCK_DATA : {};
  const gallery = (md.imageCreative && md.imageCreative.gallery) || [];
  return `
    <section class="copy-audit-right copy-audit-submission">
      <div class="image-copy-chip-bar" id="image-copy-chip-bar">
        ${gallery.map((it, i) => {
          const label = it.image || ('图' + (i + 1));
          return `<button type="button" class="image-copy-chip" data-img-target="${esc(label)}" data-img-idx="${i}" onclick="scrollToImageCopyCard(${i})">
            <span class="image-copy-chip-label">${esc(label)}</span>
            <span class="image-copy-chip-dot"></span>
          </button>`;
        }).join('')}
      </div>
      <div class="copy-audit-card copy-submission-card">
        <div class="copy-audit-card-title">2. 提交内容：7 张图文案</div>
        <div class="image-copy-submit-list">
          ${gallery.map((it, i) => {
            const label = it.image || ('图' + (i + 1));
            const creativeText = it.productPoint || '';
            const englishCopy = it.imageCopy || '';
            return `
              <div class="image-copy-submit-card" id="image-copy-card-${i}" data-img-target="${esc(label)}">
                <div class="image-copy-submit-title">${esc(label)}</div>
                <div class="image-copy-intent">
                  <span class="image-copy-intent-label">卖点创意</span>
                  <span class="image-copy-intent-text">${esc(creativeText)}</span>
                </div>
                <div class="image-copy-en-block">
                  <div class="image-copy-en-text">${esc(englishCopy)}</div>
                </div>
                ${renderImageCopyIssueButtons(label, label)}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>`;
}

function renderImageCopyIssueButtons(target, label) {
  const issues = ['图文不符', '卖点缺失', '同质重复', '关键词缺失', '排序错位', '合规风险'];
  return `<div class="copy-issue-actions image-copy-issue-actions" data-target="${copyReviewEscape(target)}">
    <span>${copyReviewEscape(label)} 快捷标记</span>
    ${issues.map(issue => `<button type="button" onclick="toggleCopyAuditIssue(this, '${copyReviewEscape(target)}', '${copyReviewEscape(issue)}')">${copyReviewEscape(issue)}</button>`).join('')}
  </div>`;
}

function scrollToImageCopyCard(idx) {
  const right = document.querySelector('#copy-audit-modal .copy-audit-right');
  const card = document.getElementById('image-copy-card-' + idx);
  if (!right || !card) return;
  const chipBar = document.getElementById('image-copy-chip-bar');
  const offset = chipBar ? chipBar.offsetHeight + 8 : 8;
  const top = card.offsetTop - offset;
  right.scrollTo({ top, behavior: 'smooth' });
  syncImageCopyChipActive(idx);
}

function syncImageCopyChipActive(idx) {
  const bar = document.getElementById('image-copy-chip-bar');
  if (!bar) return;
  bar.querySelectorAll('.image-copy-chip').forEach(c => c.classList.remove('active'));
  const target = bar.querySelector(`.image-copy-chip[data-img-idx="${idx}"]`);
  if (target) target.classList.add('active');
}

function syncImageCopyChipMarks() {
  const bar = document.getElementById('image-copy-chip-bar');
  if (!bar) return;
  const counts = {};
  copyAuditIssueMarks.forEach(m => {
    counts[m.target] = (counts[m.target] || 0) + 1;
  });
  bar.querySelectorAll('.image-copy-chip').forEach(chip => {
    const t = chip.getAttribute('data-img-target');
    const c = counts[t] || 0;
    chip.classList.toggle('marked', c > 0);
    const dot = chip.querySelector('.image-copy-chip-dot');
    if (dot) dot.textContent = c > 0 ? c : '';
  });
}

function syncImageCopyProgress() {
  const el = document.getElementById('image-copy-progress');
  if (!el) return;
  const targets = new Set(copyAuditIssueMarks.map(m => m.target));
  const total = copyAuditIssueMarks.length;
  el.textContent = `已标 ${targets.size}/7 张图 · 共 ${total} 项问题`;
  el.classList.toggle('image-copy-progress-active', total > 0);
}

// ============================================
// 新品 FAQ 类型审核 -- 左右两侧 + 子控件
// ============================================

function renderFaqCopyAuditLeft(row, payload) {
  const esc = copyReviewEscape;
  const basics = [
    ['需求类型', row.type || '新品 FAQ'],
    ['站点',     row.site || '—'],
    ['品牌',     row.brand || '—'],
    ['子品类',   row.subcategory || row.sub_category || '—'],
    ['SKU',      row.sku || '—'],
    ['优先级',   row.priority || '—'],
    ['文案人员', row.copywriter || '—'],
    ['期望交付', row.expected_delivery || row.due_date || '—'],
  ];
  const score = buildFaqDemoScore();
  const toReadOnly = html => html.replace(/contenteditable="true"/g, 'contenteditable="false"');
  const competitorsHtml = (typeof renderFaqCompetitor === 'function') ? toReadOnly(renderFaqCompetitor()) : '';
  const painHtml = (typeof renderPain === 'function') ? toReadOnly(renderPain()) : '';
  return `
    <section class="copy-audit-left copy-audit-left-readonly">
      <div class="copy-audit-card">
        <div class="copy-audit-card-title">1. 基础信息</div>
        <div class="review-info-grid copy-info-grid">
          ${basics.map(([k, v]) => `<div class="review-info-cell"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}
        </div>
      </div>
      <div class="copy-audit-card">
        <div class="copy-audit-card-title">2. AI 评测打分</div>
        <div class="copy-audit-ai-score">${renderAiScoreCardLite(score)}</div>
      </div>
      <div class="copy-audit-card">
        <div class="copy-audit-card-title">3. 竞对信息</div>
        <div class="copy-audit-faq-comp">${competitorsHtml}</div>
      </div>
      <div class="copy-audit-card">
        <div class="copy-audit-card-title">4. 用户痛点</div>
        <div class="copy-audit-faq-pain">${painHtml}</div>
      </div>
    </section>`;
}

function buildListingDemoScore() {
  const items = [
    { key: 'seo',        name: 'SEO 覆盖',   weight: 25, score: 88, ideal: '核心词 pill organizer / weekly pill case 自然覆盖' },
    { key: 'selling',    name: '卖点表达',   weight: 25, score: 84, ideal: '安全材质、便携、老年友好表达清晰' },
    { key: 'geo',        name: 'GEO 本地化', weight: 15, score: 82, ideal: '符合美国站习惯，可加强场景化表达' },
    { key: 'compliance', name: '合规风险',   weight: 20, score: 91, ideal: '未出现治疗承诺，整体安全' },
    { key: 'diff',       name: '竞品差异',   weight: 15, score: 80, ideal: '便携标签已体现，可更直接对比 EZY DOSE' },
  ].map(r => ({ ...r, status: r.score >= 90 ? 'great' : r.score >= 75 ? 'good' : r.score >= 60 ? 'warn' : 'bad' }));
  const total = Math.round(items.reduce((s, i) => s + i.score * i.weight / 100, 0));
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : 'C';
  return {
    total, grade, items,
    summary: 'Title 与 TD 整体表达清晰，建议加强 GEO 场景化覆盖与竞品差异化表达。',
    suggestions: items.filter(i => i.score < 90).slice(0, 3)
      .map(i => `• 【${i.name}】当前 ${i.score} 分，建议：${i.ideal}`),
  };
}

function buildImageCopyDemoScore() {
  const items = [
    { key: 'consistency', name: '图文一致性', weight: 25, score: 85, ideal: '图片内容与文案描述高度对应' },
    { key: 'selling',     name: '卖点突出度', weight: 25, score: 82, ideal: '核心卖点在首屏清晰呈现' },
    { key: 'visual',      name: '视觉层级',   weight: 15, score: 78, ideal: '主次信息层级分明，字号对比合理' },
    { key: 'compliance',  name: '合规性',     weight: 20, score: 90, ideal: '无医疗承诺，无虚假对比' },
    { key: 'conversion',  name: '转化力',     weight: 15, score: 80, ideal: '包含场景化使用图、痛点共鸣表达' },
  ].map(r => ({ ...r, status: r.score >= 90 ? 'great' : r.score >= 75 ? 'good' : r.score >= 60 ? 'warn' : 'bad' }));
  const total = Math.round(items.reduce((s, i) => s + i.score * i.weight / 100, 0));
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : 'C';
  return {
    total, grade, items,
    summary: '图文整体一致性良好，建议提升视觉层级清晰度与卖点首屏突出度。',
    suggestions: items.filter(i => i.score < 90).slice(0, 3)
      .map(i => `• 【${i.name}】当前 ${i.score} 分，建议：${i.ideal}`),
  };
}

function buildFaqDemoScore() {
  const rules = (typeof SCORE_RULES !== 'undefined' && Array.isArray(SCORE_RULES) && SCORE_RULES.length) ? SCORE_RULES : [
    { key: 'q-clarity',  name: 'Q 表达清晰度',   weight: 20, ideal: '问题表达直接，贴近用户搜索习惯' },
    { key: 'a-coverage', name: 'A 信息覆盖度',   weight: 25, ideal: '答案覆盖容量、安全、合规、场景四要素' },
    { key: 'keyword',    name: '关键词覆盖',     weight: 15, ideal: '自然嵌入核心 SEO 关键词' },
    { key: 'compliance', name: '合规性',         weight: 15, ideal: '避免医疗承诺词，使用 organize / store 等表达' },
    { key: 'geo',        name: 'GEO 本地化',     weight: 10, ideal: '使用美区用户偏好的短句和场景化表达' },
    { key: 'readability',name: '可读性',         weight: 15, ideal: '句长适中，避免长难句' },
  ];
  const presetScores = [88, 76, 82, 90, 85, 79];
  const items = rules.slice(0, 6).map((r, i) => {
    const s = presetScores[i] != null ? presetScores[i] : 80;
    const status = s >= 90 ? 'great' : (s >= 75 ? 'good' : (s >= 60 ? 'warn' : 'bad'));
    return Object.assign({}, r, { score: s, status });
  });
  const total = Math.round(items.reduce((sum, it) => sum + it.score * (it.weight || 0) / 100, 0));
  const grade = total >= 90 ? 'S' : (total >= 80 ? 'A' : (total >= 70 ? 'B' : 'C'));
  const suggestions = items.filter(i => i.score < 90).slice(0, 3)
    .map(i => `• 【${i.name}】当前 ${i.score} 分，建议：${i.ideal || '优化对应维度表达'}`);
  return {
    total, grade, items,
    summary: '本次 FAQ 整体表达清晰，建议加强 A 答案的信息覆盖与本地化短句使用。',
    suggestions,
  };
}

function renderAiScoreCardLite(s) {
  const esc = copyReviewEscape;
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
          <div class="ai-score-suggest-title">优化建议</div>
          <div class="ai-score-suggest-list">${s.suggestions.map(t => `<div>${esc(t)}</div>`).join('')}</div>
        </div>` : ''}
    </div>`;
}

function renderFaqCopyAuditRight(row, payload) {
  const esc = copyReviewEscape;
  const list = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.faqSubmission) || [];
  const chipBar = `
    <div class="faq-copy-chip-bar">
      ${list.map((it, i) => `
        <button type="button" class="faq-copy-chip ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="scrollToFaqCard(${i})">
          <span class="faq-copy-chip-dot" data-idx="${i}"></span>
          FAQ ${i + 1}
        </button>
      `).join('')}
    </div>`;
  const cards = list.map((it, i) => `
    <div class="copy-audit-card faq-copy-submit-card" id="faq-copy-card-${i}" data-faq-target="FAQ-${i + 1}">
      <div class="faq-copy-submit-title">FAQ ${i + 1}</div>
      <div class="faq-copy-q-block">
        <span class="faq-copy-q-label">Q</span>
        <div class="faq-copy-q-text">${esc(it.q)}</div>
      </div>
      <div class="faq-copy-a-block">
        <span class="faq-copy-a-label">A</span>
        <div class="faq-copy-a-text">${esc(it.a)}</div>
      </div>
      ${renderFaqIssueButtons(`FAQ-${i + 1}`, `FAQ ${i + 1}`)}
    </div>
  `).join('');
  return `
    <section class="copy-audit-right copy-audit-submission">
      <div class="copy-audit-card copy-submission-card">
        <div class="copy-audit-card-title">5. 提交内容：${list.length} 条 FAQ 问答</div>
        ${chipBar}
        <div class="faq-copy-submit-list">${cards}</div>
      </div>
    </section>`;
}

function renderFaqIssueButtons(target, label) {
  const issues = ['表达不清', '事实错误', '答非所问', '合规风险', '关键词缺失', '重复问题'];
  return `<div class="copy-issue-actions faq-copy-issue-actions" data-target="${copyReviewEscape(target)}">
    <span>${copyReviewEscape(label)} 快捷标记</span>
    ${issues.map(issue => `<button type="button" onclick="toggleCopyAuditIssue(this, '${copyReviewEscape(target)}', '${copyReviewEscape(issue)}')">${copyReviewEscape(issue)}</button>`).join('')}
  </div>`;
}

function scrollToFaqCard(idx) {
  const el = document.getElementById(`faq-copy-card-${idx}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('audited');
  syncFaqChipActive(idx);
  syncFaqProgress();
}

function syncFaqChipActive(idx) {
  document.querySelectorAll('.faq-copy-chip').forEach(b => {
    b.classList.toggle('active', String(b.dataset.idx) === String(idx));
  });
}

function syncFaqChipMarks() {
  document.querySelectorAll('.faq-copy-chip').forEach(b => {
    const idx = b.dataset.idx;
    const card = document.getElementById(`faq-copy-card-${idx}`);
    const has = card && card.querySelector('.faq-copy-issue-actions button.active');
    const dot = b.querySelector('.faq-copy-chip-dot');
    if (dot) dot.classList.toggle('marked', !!has);
  });
}

function syncFaqProgress() {
  const el = document.getElementById('faq-copy-progress');
  if (!el) return;
  const total = ((typeof MOCK_DATA !== 'undefined' && MOCK_DATA.faqSubmission) || []).length;
  if (!total) { el.style.display = 'none'; return; }
  const marks = document.querySelectorAll('.faq-copy-issue-actions button.active').length;
  const seen = document.querySelectorAll('.faq-copy-submit-card.audited').length;
  el.style.display = '';
  el.textContent = `已审 ${seen}/${total} · 已标 ${marks} 项`;
  el.classList.toggle('image-copy-progress-active', marks > 0 || seen > 0);
}

function renderCopyAuditIssueButtons(target, label) {
  const issues = ['表达不清', '信息错误', '关键词问题', '证据不足', '合规风险'];
  return `<div class="copy-issue-actions" data-target="${copyReviewEscape(target)}">
    <span>${copyReviewEscape(label)} 快捷标记</span>
    ${issues.map(issue => `<button type="button" onclick="toggleCopyAuditIssue(this, '${copyReviewEscape(target)}', '${copyReviewEscape(issue)}')">${copyReviewEscape(issue)}</button>`).join('')}
  </div>`;
}

let copyAuditResizeState = null;

function startCopyAuditResize(e) {
  const layout = document.querySelector('#copy-audit-modal .copy-audit-layout');
  if (!layout || layout.classList.contains('copy-audit-layout-single')) return;
  e.preventDefault();
  const rect = layout.getBoundingClientRect();
  copyAuditResizeState = { layout, left: rect.left, width: rect.width };
  document.body.classList.add('copy-audit-resizing');
  document.addEventListener('mousemove', onCopyAuditResizeMove);
  document.addEventListener('mouseup', stopCopyAuditResize);
}

function onCopyAuditResizeMove(e) {
  if (!copyAuditResizeState) return;
  const { layout, left, width } = copyAuditResizeState;
  const minLeft = 320;
  const minRight = 460;
  const resizer = 10;
  const rawLeft = e.clientX - left;
  const nextLeft = Math.max(minLeft, Math.min(rawLeft, width - minRight - resizer));
  const nextRight = Math.max(minRight, width - nextLeft - resizer);
  layout.style.gridTemplateColumns = `${nextLeft}px ${resizer}px ${nextRight}px`;
}

function stopCopyAuditResize() {
  if (!copyAuditResizeState) return;
  copyAuditResizeState = null;
  document.body.classList.remove('copy-audit-resizing');
  document.removeEventListener('mousemove', onCopyAuditResizeMove);
  document.removeEventListener('mouseup', stopCopyAuditResize);
}

function resetCopyAuditSplit() {
  const layout = document.querySelector('#copy-audit-modal .copy-audit-layout');
  if (!layout) return;
  layout.style.gridTemplateColumns = '';
}

function renderCopyAuditModuleBrowser(modules, esc) {
  return `
    <div class="review-module-browser copy-module-browser">
      <aside class="review-module-outline">
        <div class="review-outline-head">
          <span class="review-outline-title">
            <span class="review-outline-icon">${I('listChecks', 16)}</span>
            <strong>5. 背景资料</strong>
          </span>
          <button type="button" class="review-outline-collapse" onclick="toggleCopyAuditOutline()" title="收起/展开">${I('arrowR', 14)}</button>
        </div>
        ${modules.map(m => `
          <button type="button" class="review-outline-item" onclick="scrollCopyAuditModule('${m.id}')" title="${esc(m.title)}">
            <span class="review-outline-item-icon">${I(m.icon, 16)}</span>
            <span class="review-outline-item-text">${esc(m.title)}</span>
          </button>
        `).join('')}
      </aside>
      <div class="review-module-content">
        ${modules.map(m => renderCopyAuditModule(m, esc)).join('')}
      </div>
    </div>`;
}

function renderCopyAuditModule(module, esc) {
  let body = '';
  if (module.body) {
    body = `<div class="review-info-grid copy-info-grid">
      ${module.body.map(([label, value]) => `<div class="review-info-cell"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`).join('')}
    </div>`;
  } else if (module.seo) {
    body = `<div class="review-table-wrap"><table class="review-mini-table">
      <thead><tr><th>关键词</th><th>Search Frequency Rank</th><th>相关性</th></tr></thead>
      <tbody>${(module.seo.rows || []).slice(0, 6).map(r => `<tr><td>${esc(r.keyword)}</td><td>${esc(r.rank)}</td><td>${esc(r.relevance)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  } else if (module.competitors) {
    body = `<div class="copy-competitor-list">
      ${module.competitors.slice(0, 3).map(c => `<div>
        <strong>${esc(c.brand)} · ${esc(c.asin)}</strong>
        <p>${esc(c.title)}</p>
        <ol>${(c.tds || []).slice(0, 3).map(td => `<li>${esc(td)}</li>`).join('')}</ol>
      </div>`).join('')}
    </div>`;
  } else if (module.product) {
    body = `<div class="review-product-layout">
      <div class="review-product-img">${module.product.image ? `<img src="${esc(module.product.image)}" alt="${esc(module.product.imageAlt || '')}" />` : '<div>暂无产品图</div>'}<span>${esc(module.product.imageAlt || '产品图')}</span></div>
      <div class="review-product-main">
        <div class="review-block-title">产品定位</div>
        <p>${esc(module.product.positioning || '—')}</p>
        <div class="review-chip-row">${(module.product.indications || []).map(i => `<span>${esc(i)}</span>`).join('')}</div>
      </div>
    </div>`;
  }
  return `<section class="review-module-card" id="${module.id}">
    <div class="review-module-head"><h4>${esc(module.title)}</h4></div>
    <div class="review-module-body">${body}</div>
  </section>`;
}

function scrollCopyAuditModule(id) {
  const body = document.getElementById('copy-audit-body');
  const el = document.getElementById(id);
  if (!body || !el) return;
  const leftPane = document.querySelector('#copy-audit-modal .copy-audit-left');
  if (leftPane && leftPane.contains(el)) {
    leftPane.scrollTo({ top: el.offsetTop - leftPane.offsetTop - 16, behavior: 'smooth' });
    return;
  }
  body.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
}

function toggleCopyAuditOutline() {
  const outline = document.querySelector('#copy-audit-modal .copy-module-browser .review-module-outline');
  if (!outline) return;
  outline.classList.toggle('collapsed');
  const browser = outline.closest('.copy-module-browser');
  if (browser) browser.classList.toggle('outline-collapsed', outline.classList.contains('collapsed'));
}

function toggleCopyAuditIssue(btn, target, issue) {
  if (!btn) return;
  const key = `${target}|${issue}`;
  const exists = copyAuditIssueMarks.some(item => item.key === key);
  if (exists) {
    copyAuditIssueMarks = copyAuditIssueMarks.filter(item => item.key !== key);
    btn.classList.remove('active');
  } else {
    copyAuditIssueMarks.push({ key, target, issue });
    btn.classList.add('active');
  }
  syncCopyAuditMarkedReason();
  syncCopyAuditHighlight();
  syncImageCopyChipMarks();
  syncImageCopyProgress();
  if (typeof syncFaqChipMarks === 'function') syncFaqChipMarks();
  if (typeof syncFaqProgress === 'function') syncFaqProgress();
}

function syncCopyAuditHighlight() {
  const modal = document.getElementById('copy-audit-modal');
  if (!modal) return;
  modal.querySelectorAll('.copy-submission-highlight').forEach(el => el.classList.remove('copy-submission-highlight'));
  const markedTargets = new Set(copyAuditIssueMarks.map(m => m.target));
  markedTargets.forEach(target => {
    const actionEl = modal.querySelector(`.copy-issue-actions[data-target="${target}"]`);
    if (!actionEl) return;
    const card = actionEl.closest('.copy-submission-card');
    if (target === 'Title') {
      const textEl = card && card.querySelector('.copy-title-text');
      if (textEl) textEl.classList.add('copy-submission-highlight');
    } else {
      const item = actionEl.closest('.copy-td-review-item');
      if (item) item.classList.add('copy-submission-highlight');
    }
  });
}

function syncCopyAuditMarkedReason() {
  const reasonEl = document.getElementById('copy-audit-reject-reason');
  const reasonWrap = document.getElementById('copy-reject-reason-wrap');
  const countEl = document.getElementById('copy-marked-count');
  if (countEl) countEl.textContent = copyAuditIssueMarks.length;
  if (!reasonEl) return;
  if (!copyAuditIssueMarks.length) return;
  if (reasonWrap) reasonWrap.style.display = '';
  const grouped = copyAuditIssueMarks.reduce((acc, item) => {
    if (!acc[item.target]) acc[item.target] = [];
    if (!acc[item.target].includes(item.issue)) acc[item.target].push(item.issue);
    return acc;
  }, {});
  reasonEl.value = Object.keys(grouped)
    .map(target => `${target}：${grouped[target].join('、')}`)
    .join('；');
}

function renderCopyAuditRecord(row, showEditBtn) {
  if (showEditBtn === undefined) showEditBtn = row.review_status === '已驳回';
  const esc = copyReviewEscape;
  const encodedKey = encodeURIComponent(row.review_key || getCopyReviewRowKey(row, 0));

  let records = [];
  if (row.reject_history && row.reject_history.length) {
    records = row.reject_history.slice().sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  } else {
    const record = row.decision_record || {};
    records = [{ reason: row.reject_reason || record.reason || '驳回原因未填写', time: record.time || row.review_time || '—', reviewer: record.reviewer || 'Mason' }];
  }

  const items = records.map((r, i) => {
    const isLatest = i === 0;
    return `<div class="copy-reject-item ${isLatest ? 'latest' : ''}">
      <div class="copy-reject-dot"></div>
      <div class="copy-reject-content">
        <div class="copy-reject-head">
          <span class="copy-reject-reviewer">${esc(r.reviewer || '—')}</span>
          <span class="copy-reject-time">${esc(r.time || '—')}</span>
          ${isLatest && showEditBtn ? `<button type="button" class="review-record-edit-btn" onclick="goToCopyRejectedEdit('${encodedKey}')">去修改</button>` : ''}
        </div>
        <div class="copy-reject-reason">${esc(r.reason || '—')}</div>
      </div>
    </div>`;
  }).join('');

  return `<div class="review-record-card">
    <div class="review-record-title"><span>驳回记录</span><span class="copy-reject-count">${records.length} 条</span></div>
    <div class="copy-reject-timeline">${items}</div>
  </div>`;
}

function goToCopyRejectedEdit(encodedKey) {
  const key = decodeCopyReviewKey(encodedKey);
  const row = findCopyReviewRowByKey(key);
  closeCopyAuditModal();
  if (typeof openAiChat !== 'function') {
    showToast('文案生成页面暂不可用', 'warning');
    return;
  }
  if (!row) {
    openAiChat('PO17X4011', '7格便携药盒');
    return;
  }
  const payload = (typeof getCopyAuditPayload === 'function') ? getCopyAuditPayload(row) : { title: '', tds: [] };
  const sorted = (row.reject_history && row.reject_history.length)
    ? row.reject_history.slice().sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    : [{ reason: row.reject_reason || '驳回原因未填写', time: row.review_time || '—', reviewer: 'Mason' }];
  const latest = sorted[0];
  openAiChat(row.sku, row.name, {
    rejectContext: {
      row,
      title: payload.title || '',
      tds: payload.tds || [],
      latest,
    },
  });
}

function approveCopyAudit(encodedKey) {
  const key = decodeCopyReviewKey(encodedKey);
  const row = findCopyReviewRowByKey(key);
  if (!row) return;
  const decisions = readCopyReviewDecisions();
  decisions[key] = {
    status: '已通过',
    reason: '',
    sku: row.sku,
    reviewer: 'Mason',
    time: new Date().toLocaleString('zh-CN'),
  };
  writeCopyReviewDecisions(decisions);
  closeCopyAuditModal();
  if (document.getElementById('cr-req-type')) applyCopyReviewFilters();
  showToast('文案审核已通过', 'success');
}

function rejectCopyAudit(encodedKey) {
  const reasonEl = document.getElementById('copy-audit-reject-reason');
  const reason = reasonEl ? reasonEl.value.trim() : '';
  if (!reason) {
    showToast('请先填写驳回理由', 'warning');
    if (reasonEl) reasonEl.focus();
    return;
  }
  const key = decodeCopyReviewKey(encodedKey);
  const row = findCopyReviewRowByKey(key);
  if (!row) return;
  const decisions = readCopyReviewDecisions();
  decisions[key] = {
    status: '已驳回',
    reason,
    sku: row.sku,
    reviewer: 'Mason',
    time: new Date().toLocaleString('zh-CN'),
  };
  writeCopyReviewDecisions(decisions);
  closeCopyAuditModal();
  if (document.getElementById('cr-req-type')) applyCopyReviewFilters();
  showToast('文案已驳回并保存理由', 'warning');
}

function selectCopyQuickReview(value) {
  document.querySelectorAll('#copy-audit-foot .copy-quick-review button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === value);
  });
  const reasonEl = document.getElementById('copy-audit-reject-reason');
  if (!reasonEl) return;
  const reasonWrap = document.getElementById('copy-reject-reason-wrap');
  if (value === '通过') {
    copyAuditIssueMarks = [];
    document.querySelectorAll('#copy-audit-modal .copy-issue-actions button.active').forEach(btn => btn.classList.remove('active'));
    const countEl = document.getElementById('copy-marked-count');
    if (countEl) countEl.textContent = '0';
    reasonEl.value = '';
    if (reasonWrap) reasonWrap.style.display = 'none';
    return;
  }
  if (reasonWrap) reasonWrap.style.display = '';
  if (value === '其他') {
    reasonEl.value = '';
    reasonEl.placeholder = '请填写驳回理由（必填）';
    reasonEl.focus();
    return;
  }
  reasonEl.value = copyAuditIssueMarks.length ? `${reasonEl.value}；${value}` : value;
  reasonEl.focus();
}

function openWorkbenchCopyAudit(index = 0) {
  const rows = getCopyReviewListData().filter(row => row.review_status === '待审核');
  const row = rows[index] || rows[0] || getCopyReviewListData()[0];
  if (!row) {
    showToast('暂无可审核文案', 'warning');
    return;
  }
  openCopyAuditModal(encodeURIComponent(row.review_key), 'audit');
}

window.openCopyAuditModal = openCopyAuditModal;
window.closeCopyAuditModal = closeCopyAuditModal;
window.openCopyAuditRecord = openCopyAuditRecord;
window.openCopyAuditRecordBySku = openCopyAuditRecordBySku;
window.approveCopyAudit = approveCopyAudit;
window.rejectCopyAudit = rejectCopyAudit;
window.selectCopyQuickReview = selectCopyQuickReview;
window.scrollCopyAuditModule = scrollCopyAuditModule;
window.toggleCopyAuditOutline = toggleCopyAuditOutline;
window.scrollToImageCopyCard = scrollToImageCopyCard;
window.scrollToFaqCard = scrollToFaqCard;
window.openWorkbenchCopyAudit = openWorkbenchCopyAudit;
window.goToCopyRejectedEdit = goToCopyRejectedEdit;
