/* ============================================
   文案管理列表（独立筛选与渲染，所有函数前缀 cf*）
   applyCopyFilters / renderCopyListTable / renderCopyRowActions / Cf 前缀的 SKU 下拉
   抽取自 创建需求-上传页面.html line 2886-3157
   ============================================ */

// ===== 文案管理 列表（独立筛选与渲染）=====
let cfFilterSkuValue = '';
let cfFilterSkuQuery = '';

function onCfPersonTypeChange() {
  const type = document.getElementById('cf-person-type').value;
  renderCfPersonValueOptions(type);
  applyCopyFilters();
}

function renderCfPersonValueOptions(type) {
  const sel = document.getElementById('cf-person-value');
  if (!sel) return;
  const opt = PERSON_OPTIONS[type] || PERSON_OPTIONS.writer;
  sel.innerHTML = `<option value="">全部</option>` +
    opt.items.map(it => `<option value="${it}">${it}</option>`).join('');
}

// SKU 下拉
function toggleCfFilterSkuDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('cf-sku-dropdown');
  if (dd.classList.contains('show')) closeCfFilterSkuDropdown();
  else openCfFilterSkuDropdown();
}
function openCfFilterSkuDropdown() {
  document.getElementById('cf-sku-dropdown').classList.add('show');
  document.getElementById('cf-sku-total').textContent = FILTER_SKU_POOL.length;
  renderCfFilterSkuList();
  setTimeout(() => {
    const search = document.getElementById('cf-sku-search');
    if (search) search.focus();
  }, 50);
}
function closeCfFilterSkuDropdown() {
  const dd = document.getElementById('cf-sku-dropdown');
  if (dd) dd.classList.remove('show');
}
function filterCfSkuDropdownOptions() {
  cfFilterSkuQuery = document.getElementById('cf-sku-search').value.trim().toLowerCase();
  renderCfFilterSkuList();
}
function renderCfFilterSkuList() {
  const list = document.getElementById('cf-sku-list');
  if (!list) return;
  const q = cfFilterSkuQuery;
  const filtered = q
    ? FILTER_SKU_POOL.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : FILTER_SKU_POOL;
  if (!filtered.length) {
    list.innerHTML = `<div class="f-sku-empty">没有匹配的 SKU</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => `
    <div class="f-sku-item ${cfFilterSkuValue === s.code ? 'selected' : ''}" onclick="selectCfFilterSku('${s.code}')">
      <div class="f-sku-radio"></div>
      <div class="f-sku-info">
        <div class="f-sku-code">${s.code}</div>
        <div class="f-sku-name">${s.name}</div>
      </div>
    </div>
  `).join('');
}
function selectCfFilterSku(code) {
  cfFilterSkuValue = code;
  updateCfFilterSkuTrigger();
  closeCfFilterSkuDropdown();
  applyCopyFilters();
}
function clearCfFilterSku(e) {
  if (e) e.stopPropagation();
  cfFilterSkuValue = '';
  cfFilterSkuQuery = '';
  const search = document.getElementById('cf-sku-search');
  if (search) search.value = '';
  updateCfFilterSkuTrigger();
  renderCfFilterSkuList();
  applyCopyFilters();
}
function updateCfFilterSkuTrigger() {
  const text = document.getElementById('cf-sku-text');
  if (!text) return;
  if (cfFilterSkuValue) {
    const sku = FILTER_SKU_POOL.find(s => s.code === cfFilterSkuValue);
    text.className = 'f-sku-selected';
    text.innerHTML = `<span style="font-family:'SF Mono',Monaco,monospace;">${cfFilterSkuValue}</span>`
      + (sku ? `<span style="color:var(--text-muted);font-size:11px;">${sku.name}</span>` : '');
  } else {
    text.className = 'f-sku-placeholder';
    text.textContent = 'SKU';
  }
}

function applyCopyFilters() {
  const personType  = document.getElementById('cf-person-type') ? document.getElementById('cf-person-type').value : 'writer';
  const personValue = document.getElementById('cf-person-value') ? document.getElementById('cf-person-value').value : '';
  copyCurrentFilters = {
    type:   document.getElementById('cf-req-type').value,
    site:   document.getElementById('cf-site').value,
    brand:  document.getElementById('cf-brand').value,
    sub:    document.getElementById('cf-subcategory').value,
    sku:    cfFilterSkuValue,
    person: personValue,
    personType: personType,
    status: document.getElementById('cf-status').value,
  };
  copyCurrentListData = COPY_LIST_DATA.filter(row => {
    const f = copyCurrentFilters;
    if (f.type   && row.type   !== f.type)   return false;
    if (f.site   && row.site   !== f.site)   return false;
    if (f.brand  && row.brand  !== f.brand)  return false;
    if (f.sub    && row.sub    !== f.sub)    return false;
    if (f.sku    && row.sku    !== f.sku)    return false;
    if (f.person) {
      if (personType === 'writer'  && row.writer !== f.person) return false;
      if (personType === 'op'      && row.op     !== f.person) return false;
      if (personType === 'bu'      && (row.bu      || '') !== f.person) return false;
      if (personType === 'bu_lead' && (row.bu_lead || '') !== f.person) return false;
    }
    if (f.status && row.status !== f.status) return false;
    return true;
  });
  // 按状态固定顺序排序：待处理 → 待审核 → 已驳回 → 已通过
  const CF_STATUS_ORDER = { '待处理': 1, '待审核': 2, '已驳回': 3, '已通过': 4 };
  copyCurrentListData.sort((a, b) => {
    const oa = CF_STATUS_ORDER[a.status] || 99;
    const ob = CF_STATUS_ORDER[b.status] || 99;
    return oa - ob;
  });
  renderCopyListTable();
  renderCopyAppliedFilters();
}

function resetCopyFilters() {
  ['cf-req-type','cf-site','cf-brand','cf-subcategory','cf-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  cfFilterSkuValue = '';
  cfFilterSkuQuery = '';
  const sk = document.getElementById('cf-sku-search');
  if (sk) sk.value = '';
  updateCfFilterSkuTrigger();
  const pt = document.getElementById('cf-person-type');
  if (pt) pt.value = 'writer';
  renderCfPersonValueOptions('writer');
  const pv = document.getElementById('cf-person-value');
  if (pv) pv.value = '';
  applyCopyFilters();
}

function renderCopyAppliedFilters() {
  const wrap = document.getElementById('cf-applied');
  if (!wrap) return;
  const labels = {
    type: '需求类型', site: '站点', brand: '品牌', sub: '子品类',
    sku: 'SKU', status: '状态'
  };
  const chips = [];
  Object.keys(labels).forEach(k => {
    if (copyCurrentFilters[k]) {
      chips.push(`<span class="filter-chip">
        <span class="chip-label">${labels[k]}：</span>
        <span class="chip-val">${copyCurrentFilters[k]}</span>
        <span class="chip-close" onclick="clearCopyFilter('${k}')">×</span>
      </span>`);
    }
  });
  if (copyCurrentFilters.person) {
    const typeLabel = (PERSON_OPTIONS[copyCurrentFilters.personType] || {}).label || '人员';
    chips.push(`<span class="filter-chip">
      <span class="chip-label">${typeLabel}：</span>
      <span class="chip-val">${copyCurrentFilters.person}</span>
      <span class="chip-close" onclick="clearCopyFilter('person')">×</span>
    </span>`);
  }
  if (chips.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  chips.push(`<a class="chip-clear-all" onclick="resetCopyFilters()">清除全部</a>`);
  wrap.innerHTML = chips.join('');
}

function clearCopyFilter(key) {
  if (key === 'sku') {
    clearCfFilterSku();
    return;
  }
  if (key === 'person') {
    const pv = document.getElementById('cf-person-value');
    if (pv) pv.value = '';
    applyCopyFilters();
    return;
  }
  const idMap = {
    type: 'cf-req-type', site: 'cf-site', brand: 'cf-brand', sub: 'cf-subcategory', status: 'cf-status'
  };
  const el = document.getElementById(idMap[key]);
  if (el) el.value = '';
  applyCopyFilters();
}


function renderCopyRowActions(r) {
  const sku = r.sku;
  const div = `<span class="row-action-divider"></span>`;
  // 颜色规则：
  //   详情      → 默认（紫，主色）
  //   文案生成  → warn（橙，强调"开始动作"）
  //   查看文案  → success（绿，强调"已完成可查看"）
  //   驳回记录  → danger（红）
  const detail   = `<button class="row-action-btn" onclick="event.stopPropagation();showToast('查看详情：${sku}','success')">详情</button>`;
  const reject   = `<button class="row-action-btn danger" onclick="event.stopPropagation();openCopyAuditRecordBySku('${sku}')">驳回记录</button>`;
  const generate = `<button class="row-action-btn warn" onclick="event.stopPropagation();openAiChat('${sku}', '${(r.name || '').replace(/'/g, '\\\'')}')">文案生成</button>`;
  const view     = `<button class="row-action-btn success" onclick="event.stopPropagation();showToast('查看文案：${sku}','success')">查看文案</button>`;
  let extra = '';
  switch (r.status) {
    case '待处理': extra = generate; break;
    case '待审核': extra = `${detail}${div}${reject}`;   break;
    case '已驳回': extra = reject;   break;
    case '已通过': extra = `${view}${div}${reject}`;     break;
    default:       extra = detail;
  }
  return `<div class="row-actions">${extra}</div>`;
}

function renderCopyListTable() {
  const tbody = document.getElementById('cf-tbody');
  if (!tbody) return;
  if (copyCurrentListData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" style="text-align:center;padding:60px 16px;color:var(--text-light);">
      <div style="font-size:28px;margin-bottom:8px;">📭</div>
      <div>没有匹配的数据</div>
    </td></tr>`;
    document.getElementById('cf-pg-total').textContent = 0;
    return;
  }
  tbody.innerHTML = copyCurrentListData.map(r => {
    const typeCls = REQ_TYPE_STYLES[r.type] || 'req-type-listing';
    const brandCls = r.brand === 'ZIKEE' ? 'brand-zikee' : (r.brand === 'AMOOS' ? 'brand-amoos' : '');
    const statusCls = CF_STATUS_CLS[r.status] || 'status-doing';
    return `<tr onclick="onCopyRowClick('${r.sku}')">
      <td><span class="req-type-pill ${typeCls}">${r.type}</span></td>
      <td>${r.site}</td>
      <td><span class="brand-tag ${brandCls}">${r.brand}</span></td>
      <td>${r.sub}</td>
      <td title="${r.name}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">${r.name}</td>
      <td><span class="sku-cell">${r.sku}</span></td>
      <td>${renderPriorityTag(r)}</td>
      <td><span class="person-cell">${r.op}</span></td>
      <td><span class="person-cell">${r.writer}</span></td>
      <td><span class="submit-time-cell">${(r.submit_time || '—').split(' ')[0]}</span></td>
      <td>${renderLaunchDate(r)}</td>
      <td>${r.date}</td>
      <td><span class="submit-time-cell">${r.review_time || '—'}</span></td>
      <td><span class="status-pill ${statusCls}">${r.status || '—'}</span></td>
      <td onclick="event.stopPropagation()">${renderCopyRowActions(r)}</td>
    </tr>`;
  }).join('');
  document.getElementById('cf-pg-total').textContent = copyCurrentListData.length || COPY_LIST_DATA.length;
}

function onCopyRowClick(sku) {
  showToast(`查看详情：${sku}`, 'success');
}

// =============================================================
//  AI 文案对话页
// =============================================================

// 背景知识库：分类码（单层，可折叠展开示意）

let bgKnowledgeQuery = '';
