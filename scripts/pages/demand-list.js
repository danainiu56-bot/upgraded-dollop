/* ============================================
   需求管理列表（左侧菜单 + 筛选 + 表格 + 分页）
   含 sidebar 渲染、SKU/人员筛选下拉、applyFilters/renderListTable/renderRowActions
   抽取自 创建需求-上传页面.html line 2510-2884
   ============================================ */


// 侧边栏菜单结构
const SIDEBAR_MENU = [
  { id: 'workbench', icon: 'workbench', name: '工作台', single: true },
  { id: 'ai-copy', icon: 'ai', name: '需求管理', children: [
    { id: 'copywriting', name: '需求管理', active: true },
  ]},
  { id: 'demand', icon: 'demand', name: 'AI文案', children: [
    { id: 'demand-mgr', name: '文案管理' },
  ]},
  { id: 'review', icon: 'review', name: '审核管理', children: [
    { id: 'titletd-review', name: '需求审核' },
    { id: 'copy-review', name: '文案审核' },
  ]},
  { id: 'system', icon: 'system', name: '系统管理', single: true },
];

// 表格示例数据


let currentListData = LIST_DATA.slice();
let currentFilters = {};

// ===== 文案管理（独立数据，不与需求管理共享）=====

let copyCurrentListData = COPY_LIST_DATA.slice();
let copyCurrentFilters = {};

function getRowPriority(row) {
  if (row && row.priority) return row.priority;
  const type = row && row.type ? row.type : '';
  if (type.includes('新品Listing') || type.includes('新品 Listing')) return 'P0';
  if (type.includes('Listing') || type.includes('Title') || type.includes('TD')) return 'P1';
  return 'P2';
}

function renderPriorityTag(row) {
  const priority = getRowPriority(row);
  const clsMap = { P0: 'priority-high', P1: 'priority-mid', P2: 'priority-low' };
  return `<span class="priority-pill ${clsMap[priority] || 'priority-low'}">${priority}</span>`;
}

function renderLaunchDate(row) {
  const type = row && row.type ? row.type : '';
  const isNewListing = type.includes('新品Listing') || type.includes('新品 Listing');
  return isNewListing ? (row.launch_date || '—') : '—';
}

// 人员选择器数据

function onPersonTypeChange() {
  const type = document.getElementById('f-person-type').value;
  renderPersonValueOptions(type);
  applyFilters();
}

// ===== SKU 筛选下拉 =====
let filterSkuValue = '';
let filterSkuQuery = '';

// 从表格数据自动生成候选 SKU 列表（去重）+ 补充演示数据
// 注：API 加载成功后会被覆盖
var FILTER_SKU_POOL = (() => {
  const fromList = LIST_DATA.map(r => ({ code: r.sku, name: r.name }));
  const extra = [
    { code: 'PO20A1101', name: '智能温控药盒' },
    { code: 'PO20A1102', name: '迷你便携药盒' },
    { code: 'PO20B2201', name: '理疗仪 Pro 版' },
    { code: 'PO21C3301', name: '加热颈椎仪' },
    { code: 'PO21D4401', name: '家用按摩枪' },
    { code: 'PO22E5501', name: '智能血压仪' },
    { code: 'PO22F6601', name: '便携血氧仪' },
  ];
  // 去重
  const map = new Map();
  [...fromList, ...extra].forEach(s => map.set(s.code, s));
  return Array.from(map.values());
})();

function toggleFilterSkuDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('f-sku-dropdown');
  if (dd.classList.contains('show')) {
    closeFilterSkuDropdown();
  } else {
    openFilterSkuDropdown();
  }
}

function openFilterSkuDropdown() {
  document.getElementById('f-sku-dropdown').classList.add('show');
  document.getElementById('f-sku-total').textContent = FILTER_SKU_POOL.length;
  renderFilterSkuList();
  setTimeout(() => {
    const search = document.getElementById('f-sku-search');
    if (search) search.focus();
  }, 50);
}

function closeFilterSkuDropdown() {
  document.getElementById('f-sku-dropdown').classList.remove('show');
}

document.addEventListener('click', (e) => {
  const wraps = document.querySelectorAll('.filter-sku-wrap');
  let inside = false;
  wraps.forEach(w => { if (w.contains(e.target)) inside = true; });
  if (!inside) {
    closeFilterSkuDropdown();
    if (typeof closeCfFilterSkuDropdown === 'function') closeCfFilterSkuDropdown();
    if (typeof closeRvFilterSkuDropdown === 'function') closeRvFilterSkuDropdown();
    if (typeof closeCrFilterSkuDropdown === 'function') closeCrFilterSkuDropdown();
  }
});

function filterSkuDropdownOptions() {
  filterSkuQuery = document.getElementById('f-sku-search').value.trim().toLowerCase();
  renderFilterSkuList();
}

function renderFilterSkuList() {
  const list = document.getElementById('f-sku-list');
  if (!list) return;
  const q = filterSkuQuery;
  const filtered = q
    ? FILTER_SKU_POOL.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : FILTER_SKU_POOL;
  if (!filtered.length) {
    list.innerHTML = `<div class="f-sku-empty">没有匹配的 SKU</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => `
    <div class="f-sku-item ${filterSkuValue === s.code ? 'selected' : ''}" onclick="selectFilterSku('${s.code}')">
      <div class="f-sku-radio"></div>
      <div class="f-sku-info">
        <div class="f-sku-code">${s.code}</div>
        <div class="f-sku-name">${s.name}</div>
      </div>
    </div>
  `).join('');
}

function selectFilterSku(code) {
  filterSkuValue = code;
  updateFilterSkuTrigger();
  closeFilterSkuDropdown();
  applyFilters();
}

function clearFilterSku(e) {
  if (e) e.stopPropagation();
  filterSkuValue = '';
  filterSkuQuery = '';
  const search = document.getElementById('f-sku-search');
  if (search) search.value = '';
  updateFilterSkuTrigger();
  renderFilterSkuList();
  applyFilters();
}

function updateFilterSkuTrigger() {
  const text = document.getElementById('f-sku-text');
  if (filterSkuValue) {
    const sku = FILTER_SKU_POOL.find(s => s.code === filterSkuValue);
    text.className = 'f-sku-selected';
    text.innerHTML = `<span style="font-family:'SF Mono',Monaco,monospace;">${filterSkuValue}</span>`
      + (sku ? `<span style="color:var(--text-muted);font-size:11px;">${sku.name}</span>` : '');
  } else {
    text.className = 'f-sku-placeholder';
    text.textContent = 'SKU';
  }
}

function renderPersonValueOptions(type) {
  const sel = document.getElementById('f-person-value');
  if (!sel) return;
  const opt = PERSON_OPTIONS[type] || PERSON_OPTIONS.writer;
  sel.innerHTML = `<option value="">全部</option>` +
    opt.items.map(it => `<option value="${it}">${it}</option>`).join('');
}

function renderSidebar() {
  const nav = document.getElementById('list-sidebar-nav');
  if (!nav) return;
  nav.innerHTML = SIDEBAR_MENU.map(item => {
    const iconHtml = ICONS[item.icon] || '';
    const onlyChild = item.children && item.children.length === 1 ? item.children[0] : null;
    if (item.single || onlyChild) {
      const targetId = onlyChild ? onlyChild.id : item.id;
      const targetName = onlyChild ? onlyChild.name : item.name;
      const isActive = item.active || (onlyChild && onlyChild.active);
      return `<div class="list-nav-single ${isActive ? 'active' : ''}" onclick="onMenuClick('${targetId}')">
        <span class="group-icon">${iconHtml}</span>
        <span class="group-name">${targetName}</span>
      </div>`;
    }
    const expanded = item.expanded || (item.children && item.children.some(c => c.active));
    return `<div class="list-nav-group ${expanded ? 'expanded' : ''}" id="nav-group-${item.id}">
      <div class="list-nav-group-header" onclick="toggleNavGroup('${item.id}')">
        <span class="group-icon">${iconHtml}</span>
        <span class="group-name">${item.name}</span>
        <span class="group-arrow">▶</span>
      </div>
      <div class="group-children" data-title="${item.name}">
        ${item.children.map(c =>
          `<div class="list-nav-link ${c.active ? 'active' : ''}" onclick="onMenuClick('${c.id}')">${c.name}</div>`
        ).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleNavGroup(id) {
  const el = document.getElementById('nav-group-' + id);
  if (el) el.classList.toggle('expanded');
}

function onMenuClick(id) {
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const target = event.currentTarget;
  if (target) target.classList.add('active');
  if (id === 'workbench') {
    showWorkbenchView();
    return;
  }
  if (id === 'copywriting') {
    showCopywritingView();
    return;
  }
  if (id === 'demand-mgr') {
    showDemandMgrView();
    return;
  }
  if (id === 'titletd-review') {
    showReviewMgrView();
    return;
  }
  if (id === 'copy-review') {
    showCopyReviewView();
    return;
  }
  showToast(`「${id}」 模块开发中...`, 'warning');
}





function switchTab(tab) {
  document.querySelectorAll('.list-tab').forEach(el => el.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  if (tab !== 'copywriting') showToast(`「${tab}」 Tab 开发中...`, 'warning');
}

function sortDemandListByStatus(list) {
  const order = { '待审核': 1, '已驳回': 2, '已通过': 3, '处理中': 4, '已完成': 5 };
  return (list || []).slice().sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
}

// 筛选
function applyFilters() {
  const personType = document.getElementById('f-person-type').value;
  const personValue = document.getElementById('f-person-value').value;
  currentFilters = {
    type: document.getElementById('f-req-type').value,
    site: document.getElementById('f-site').value,
    brand: document.getElementById('f-brand').value,
    sub: document.getElementById('f-subcategory').value,
    sku: filterSkuValue,
    person: personValue,
    personType: personType,
    status: document.getElementById('f-status').value,
  };
  currentListData = LIST_DATA.filter(row => {
    if (currentFilters.type && row.type !== currentFilters.type) return false;
    if (currentFilters.site && row.site !== currentFilters.site) return false;
    if (currentFilters.brand && row.brand !== currentFilters.brand) return false;
    if (currentFilters.sub && row.sub !== currentFilters.sub) return false;
    if (currentFilters.sku && row.sku !== currentFilters.sku) return false;
    if (currentFilters.person) {
      if (personType === 'writer' && row.writer !== currentFilters.person) return false;
      if (personType === 'op' && row.op !== currentFilters.person) return false;
      if (personType === 'bu' && row.bu !== currentFilters.person) return false;
      if (personType === 'bu_lead' && row.bu_lead !== currentFilters.person) return false;
    }
    if (currentFilters.status && row.status !== currentFilters.status) return false;
    return true;
  });
  currentListData = sortDemandListByStatus(currentListData);
  renderListTable();
  renderAppliedFilters();
}

function resetFilters() {
  ['f-req-type','f-site','f-brand','f-subcategory','f-status'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
  });
  // 重置 SKU 选择器
  filterSkuValue = '';
  filterSkuQuery = '';
  const search = document.getElementById('f-sku-search');
  if (search) search.value = '';
  updateFilterSkuTrigger();
  // 重置人员组合选择器
  document.getElementById('f-person-type').value = 'writer';
  renderPersonValueOptions('writer');
  document.getElementById('f-person-value').value = '';
  applyFilters();
}

function renderAppliedFilters() {
  const wrap = document.getElementById('filter-applied');
  const labels = {
    type: '需求类型', site: '站点', brand: '品牌', sub: '子品类',
    sku: 'SKU', status: '状态'
  };
  const items = [];
  ['type','site','brand','sub','sku','status'].forEach(k => {
    if (currentFilters[k]) {
      items.push(`<span class="filter-chip">
        <span class="chip-key">${labels[k]}：</span>
        <span class="chip-val">${currentFilters[k]}</span>
        <span class="chip-remove" onclick="removeFilter('${k}')">✕</span>
      </span>`);
    }
  });
  // 人员类型筛选 chip
  if (currentFilters.person) {
    const typeLabel = (PERSON_OPTIONS[currentFilters.personType] || {}).label || '人员';
    items.push(`<span class="filter-chip">
      <span class="chip-key">${typeLabel}：</span>
      <span class="chip-val">${currentFilters.person}</span>
      <span class="chip-remove" onclick="removeFilter('person')">✕</span>
    </span>`);
  }
  if (items.length) {
    items.push(`<button class="filter-clear-all" onclick="resetFilters()">清除全部</button>`);
  }
  wrap.innerHTML = items.join('');
}

function removeFilter(key) {
  const idMap = { type: 'f-req-type', site: 'f-site', brand: 'f-brand', sub: 'f-subcategory',
                  status: 'f-status' };
  if (key === 'person') {
    document.getElementById('f-person-value').value = '';
  } else if (key === 'sku') {
    filterSkuValue = '';
    updateFilterSkuTrigger();
  } else {
    const el = document.getElementById(idMap[key]);
    if (el) el.value = '';
  }
  applyFilters();
}

function renderListTable() {
  const tbody = document.getElementById('list-tbody');
  if (!tbody) return;
  currentListData = sortDemandListByStatus(currentListData);
  if (currentListData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="16" style="text-align:center;padding:60px 16px;color:var(--text-light);">
      <div style="font-size:28px;margin-bottom:8px;">📭</div>
      <div>没有匹配的数据</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = currentListData.map(r => {
    const typeCls = REQ_TYPE_STYLES[r.type] || 'req-type-listing';
    const brandCls = r.brand === 'ZIKEE' ? 'brand-zikee' : (r.brand === 'AMOOS' ? 'brand-amoos' : '');
    const statusClsMap = {
      '待审核': 'status-review',
      '已通过': 'status-pass',
      '已驳回': 'status-reject',
      '处理中': 'status-doing',
      '已完成': 'status-done',
    };
    const statusCls = statusClsMap[r.status] || 'status-doing';
    return `<tr onclick="onRowClick('${r.sku}')">
      <td><span class="req-type-pill ${typeCls}">${r.type}</span></td>
      <td>${r.site}</td>
      <td><span class="brand-tag ${brandCls}">${r.brand}</span></td>
      <td>${r.sub}</td>
      <td title="${r.name}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;">${r.name}</td>
      <td><span class="sku-cell">${r.sku}</span></td>
      <td>${renderPriorityTag(r)}</td>
      <td><span style="color:var(--text);font-size:12px;">${r.bu || '—'}</span></td>
      <td><span class="person-cell">${r.bu_lead || '—'}</span></td>
      <td><span class="person-cell">${r.op}</span></td>
      <td><span class="person-cell">${r.writer}</span></td>
      <td><span class="submit-time-cell">${r.submit_time || '—'}</span></td>
      <td>${renderLaunchDate(r)}</td>
      <td>${r.date}</td>
      <td><span class="status-pill ${statusCls}">${r.status || '—'}</span></td>
      <td onclick="event.stopPropagation()">${renderRowActions(r)}</td>
    </tr>`;
  }).join('');
  document.getElementById('pg-total').textContent = currentListData.length || LIST_DATA.length;
}

function onRowClick(sku) {
  showToast(`查看详情：${sku}`, 'success');
}
