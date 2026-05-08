/* ============================================
   创建需求向导（step1 + step2 + 飞书 + 上传 + 解析）
   函数前缀: select* / on* / render* (Sku/BizGrid/SubGrid/FeishuLinks)，状态: skuList/currentBiz/currentSub/feishuLinks 等
   抽取自 创建需求-上传页面.html line 1107-1865
   ============================================ */

let skuList = [];
let currentMethod = 1;
let uploadedFile = null;

// ===== API 配置 =====
// 通过本地代理走，避免 CORS 重复头问题（dev-server.py 已转发 /prod-api/* 到真实服务器）
const API_BASE = '/prod-api';
const API_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImxvZ2luX3VzZXJfa2V5IjoiMWMxZDQ4ZWYtNWZhYS00YzJjLTllZTYtYjJkMGJiMWJkNjQ1In0.eyhvKT9upuCs_mf8Q1p6T57-s5DkmEI3m40BME_hsk3zZIN0ToOn8pX3Bi-E5K1qxnRIXO-hQrStLmJZuBaMXg';

// 通用 API 请求
async function apiGet(path) {
  const url = path.startsWith('http') ? path : (API_BASE + path);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Authorization': 'Bearer ' + API_TOKEN,
    },
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// 子品类数据（API 返回 [{value, label}]）
let subCategoriesData = [];

async function loadSubCategories() {
  try {
    const json = await apiGet('/api/common/sub-categories');
    if (json && json.code === 200 && Array.isArray(json.data)) {
      subCategoriesData = json.data;
      renderSubCategoryOptions();
      return true;
    }
    throw new Error('数据格式异常');
  } catch (e) {
    console.warn('[sub-categories] API 加载失败，使用本地默认数据：', e.message);
    subCategoriesData = [
      { value: 'medicine', label: '药盒' },
      { value: 'electrotherapy', label: '电疗' },
      { value: 'patch', label: '贴片' },
      { value: 'painkiller', label: '止痛膏药' },
      { value: 'glucose', label: '血糖仪' },
      { value: 'wound', label: '伤口贴' },
      { value: 'walker', label: '助行器' },
      { value: 'cushion', label: '坐垫' },
      { value: 'nightlight', label: '小夜灯' },
      { value: 'bathroom', label: '浴室扶手' },
    ];
    renderSubCategoryOptions();
    return false;
  }
}

function renderSubCategoryOptions() {
  // 表单内的子品类
  const formSel = document.getElementById('subcategory');
  if (formSel) {
    formSel.innerHTML = '<option value="">请选择子品类</option>' +
      subCategoriesData.map(s => `<option value="${s.value}">${s.label}</option>`).join('');
  }
  // 列表页筛选的子品类
  const filterSel = document.getElementById('f-subcategory');
  if (filterSel) {
    filterSel.innerHTML = '<option value="">全部子品类</option>' +
      subCategoriesData.map(s => `<option value="${s.value}">${s.label}</option>`).join('');
  }
}

// ===== SKU 示例数据（本地 5 条，不调 API）=====

// 列表页 SKU 筛选下拉数据（同步使用同一份）
function rebuildFilterSkuPool() {
  window.FILTER_SKU_POOL = allSkusData.slice();
  if (typeof renderFilterSkuList === 'function') renderFilterSkuList();
  if (document.getElementById('f-sku-total')) {
    document.getElementById('f-sku-total').textContent = window.FILTER_SKU_POOL.length;
  }
}

// 列表页：子品类筛选变化时（SKU 不联动子品类，仅触发表格刷新）
function onFilterSubcategoryChange() {
  applyFilters();
}

// ===== SKU 数据库（按子品类）=====

// ===== SKU 多选下拉 =====
let skuPool = []; // 当前品类下的 SKU 列表
let skuSearchQuery = '';

async function onSubcategoryChange(opts = {}) {
  clearError(document.getElementById('subcategory'));
  const cat = document.getElementById('subcategory').value;
  // 切换品类时，清空已选 SKU 与搜索状态
  skuList = [];
  skuSearchQuery = '';
  const search = document.getElementById('sku-search');
  if (search) search.value = '';

  const trigger = document.getElementById('sku-trigger');
  const placeholder = document.getElementById('sku-trigger-text');

  if (!cat) {
    skuPool = [];
    trigger.disabled = true;
    placeholder.className = 'sku-trigger-placeholder';
    placeholder.textContent = '请先选择子品类';
    closeSkuDropdown();
    document.getElementById('sku-pool-total').textContent = 0;
    renderSkuOptions();
    renderSkuTrigger();
    renderSkuChips();
    document.getElementById('sku-error').classList.remove('show');
    return;
  }

  // SKU 直接使用本地全量示例数据
  skuPool = allSkusData.slice();
  trigger.disabled = false;
  placeholder.className = 'sku-trigger-placeholder';
  placeholder.textContent = skuPool.length ? '请选择SKU' : '暂无 SKU 数据';
  document.getElementById('sku-pool-total').textContent = skuPool.length;
  renderSkuOptions();
  renderSkuTrigger();
  renderSkuChips();
  document.getElementById('sku-error').classList.remove('show');
}

function toggleSkuDropdown(e) {
  if (e) e.stopPropagation();
  const trigger = document.getElementById('sku-trigger');
  if (trigger.disabled) return;
  const dropdown = document.getElementById('sku-dropdown');
  if (dropdown.classList.contains('show')) {
    closeSkuDropdown();
  } else {
    openSkuDropdown();
  }
}

function openSkuDropdown() {
  document.getElementById('sku-dropdown').classList.add('show');
  setTimeout(() => {
    const search = document.getElementById('sku-search');
    if (search) search.focus();
  }, 50);
}

function closeSkuDropdown() {
  document.getElementById('sku-dropdown').classList.remove('show');
}

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.sku-select-wrap');
  if (wrap && !wrap.contains(e.target)) closeSkuDropdown();
});

function filterSkuOptions() {
  skuSearchQuery = document.getElementById('sku-search').value.trim().toLowerCase();
  renderSkuOptions();
}

function renderSkuOptions() {
  const list = document.getElementById('sku-dropdown-list');
  if (!list) return;
  const q = skuSearchQuery;
  const filtered = q
    ? skuPool.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : skuPool;
  if (!filtered.length) {
    list.innerHTML = `<div class="sku-option-empty">${skuPool.length === 0 ? '请先选择子品类' : '没有匹配的 SKU'}</div>`;
    return;
  }
  list.innerHTML = filtered.map(s => {
    const selected = skuList[0] === s.code;
    return `
      <div class="sku-option single ${selected ? 'selected' : ''}" onclick="selectSku('${s.code}')">
        <div class="sku-option-radio"></div>
        <div class="sku-option-info">
          <div class="sku-option-code">${s.code}</div>
          <div class="sku-option-name">${s.name}</div>
        </div>
      </div>
    `;
  }).join('');
}

function selectSku(code) {
  skuList = [code];
  renderSkuOptions();
  renderSkuTrigger();
  document.getElementById('sku-error').classList.remove('show');
  document.getElementById('sku-trigger').style.borderColor = '';
  closeSkuDropdown();
}

function clearAllSku(e) {
  if (e) e.stopPropagation();
  skuList = [];
  renderSkuOptions();
  renderSkuTrigger();
}

function removeSku(code) {
  skuList = [];
  renderSkuOptions();
  renderSkuTrigger();
}

function renderSkuTrigger() {
  const placeholder = document.getElementById('sku-trigger-text');
  const trigger = document.getElementById('sku-trigger');
  if (skuList.length === 0) {
    placeholder.className = 'sku-trigger-placeholder';
    placeholder.textContent = trigger.disabled ? '请先选择子品类' : '请选择SKU';
  } else {
    placeholder.className = 'sku-trigger-summary';
    const code = skuList[0];
    const sku = skuPool.find(s => s.code === code) || { code, name: '' };
    placeholder.innerHTML = `<span style="font-weight:600;color:var(--text);">${sku.code}</span>${sku.name ? `<span style="color:var(--text-muted);font-weight:400;font-size:13px;"> · ${sku.name}</span>` : ''}`;
  }
}

// 兼容空函数（旧调用）
function renderSkuChips() {}

// 兼容旧调用：renderSkuTags 别名
function renderSkuTags() {
  renderSkuTrigger();
  renderSkuChips();
  renderSkuOptions();
}

// ===== 表单验证 =====
function validateStep1() {
  let valid = true;
  // 需求类型校验
  const reqTypeVal = document.getElementById('req-type').value;
  if (!reqTypeVal) {
    document.getElementById('req-type-error').classList.add('show');
    const currentBizItem = getCurrentBizItem();
    if (currentBizItem && currentBizItem.hasSub && !currentSub) {
      document.getElementById('req-type-error').textContent = `请选择${currentBizItem.name}的细分类型`;
    } else {
      document.getElementById('req-type-error').textContent = '请选择需求类型';
    }
    valid = false;
  }
  // 其他下拉字段
  const fields = [
    { id: 'site', errId: 'site-error' },
    { id: 'subcategory', errId: 'subcategory-error' },
    { id: 'delivery-date', errId: 'delivery-date-error' },
  ];
  if (isNewListingDemand()) {
    fields.push({ id: 'product-launch-date', errId: 'product-launch-date-error' });
  }
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el.value) {
      el.classList.add('error');
      document.getElementById(f.errId).classList.add('show');
      valid = false;
    }
  });
  if (skuList.length === 0) {
    document.getElementById('sku-trigger').style.borderColor = 'var(--danger)';
    document.getElementById('sku-error').textContent = '请选择 SKU';
    document.getElementById('sku-error').classList.add('show');
    valid = false;
  }
  return valid;
}

function clearError(el) {
  if (!el) return;
  el.classList.remove('error');
  const errId = el.id + '-error';
  const errEl = document.getElementById(errId);
  if (errEl) errEl.classList.remove('show');
}

// ===== 步骤导航 =====
function goToStep1() {
  setStep(1);
}

function goToStep2() {
  if (!validateStep1()) {
    showToast('请完善必填信息后继续', 'warning');
    return;
  }
  buildSummaryTags();
  setStep(2);
}

function setStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-panel-${i}`) &&
      document.getElementById(`step-panel-${i}`).classList.remove('active');
    const ind = document.getElementById(`step-indicator-${i}`);
    ind.classList.remove('active', 'completed');
    if (i < n) ind.classList.add('completed');
    if (i === n) ind.classList.add('active');
  });
  const panel = document.getElementById(`step-panel-${n}`);
  if (panel) {
    panel.classList.add('active');
    panel.classList.add('fade-in-up');
    setTimeout(() => panel.classList.remove('fade-in-up'), 400);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // 持久化视图：仅向导可见时保存
  if (typeof saveView === 'function' && document.getElementById('wizard-main').style.display !== 'none') {
    if (n === 1 || n === 2) {
      saveView(`wizard:${n}`);
      if (typeof saveStep1Form === 'function') saveStep1Form();
    }
  }
}

// ===== 需求类型选择器 =====


let currentStage = 'new';   // new | old
let currentBiz = null;      // package / manual / ...
let currentSub = null;      // title / td / titletd / selling / operation

function getCurrentBizItem() {
  return BIZ_TYPES.find(b => b.id === currentBiz);
}

function getCurrentBizSubOptions() {
  return (currentBiz && typeof BIZ_SUB_MAP !== 'undefined' && BIZ_SUB_MAP[currentBiz]) || [];
}

function buildReqTypeKey() {
  if (!currentBiz) return '';
  const biz = getCurrentBizItem();
  if (biz && biz.hasSub) {
    if (!currentSub) return '';
    return `${currentStage}-${currentBiz}-${currentSub}`;
  }
  return `${currentStage}-${currentBiz}`;
}

function buildReqTypeLabel() {
  if (!currentBiz) return '';
  const biz = getCurrentBizItem();
  if (!biz) return '';
  if (biz.hasSub) {
    if (!currentSub) return '';
    const sub = getCurrentBizSubOptions().find(s => s.id === currentSub);
    return `${stageLabels[currentStage]} · ${sub ? sub.name : currentSub}`;
  }
  return `${stageLabels[currentStage]} · ${biz.name}`;
}

function renderBizGrid() {
  const grid = document.getElementById('biz-grid');
  if (!grid) return;
  grid.innerHTML = BIZ_TYPES.map(b => `
    <div class="biz-card ${currentBiz === b.id ? 'selected' : ''} ${b.hasSub ? 'has-sub' : ''}"
         data-biz="${b.id}" onclick="selectBiz('${b.id}')" title="${b.hasSub ? '含子选项' : ''}">
      <div class="biz-icon">${IL(b.iconKey, 26)}</div>
      <div class="biz-name">${b.name}</div>
      <div class="biz-desc">${b.desc}</div>
    </div>
  `).join('');
}

function renderSubGrid() {
  const wrap = document.getElementById('biz-sub-wrap');
  const grid = document.getElementById('biz-sub-grid');
  const biz = getCurrentBizItem();
  const subs = getCurrentBizSubOptions();
  if (biz && biz.hasSub && subs.length) {
    wrap.style.display = 'block';
    const titleEl = wrap.querySelector('.biz-sub-title');
    const tipEl = wrap.querySelector('.biz-sub-tip');
    if (titleEl) titleEl.textContent = `选择${biz.name}细分类型`;
    if (tipEl) tipEl.textContent = `${subs.length} 选一`;
    grid.innerHTML = subs.map(s => `
      <div class="biz-sub-card ${currentSub === s.id ? 'selected' : ''}"
           data-sub="${s.id}" onclick="selectSub('${s.id}')">
        <div class="biz-sub-icon">${IL(s.iconKey, 20)}</div>
        <div class="biz-sub-name">${stageLabels[currentStage]} ${s.name}</div>
        <div class="biz-sub-detail">${s.desc}</div>
      </div>
    `).join('');
  } else {
    wrap.style.display = 'none';
  }
}

function selectStage(stage) {
  currentStage = stage;
  document.querySelectorAll('.stage-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.stage === stage)
  );
  // 切换阶段后重新渲染子卡片（更新名称前缀）
  renderSubGrid();
  syncReqType();
}

function selectBiz(id) {
  const previousBiz = currentBiz;
  currentBiz = id;
  const biz = getCurrentBizItem();
  if (!biz || !biz.hasSub || previousBiz !== id) currentSub = null;
  renderBizGrid();
  renderSubGrid();
  syncReqType();
  // 自动滚动到细分子选项
  if (biz && biz.hasSub) {
    setTimeout(() => {
      document.getElementById('biz-sub-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function selectSub(id) {
  currentSub = id;
  renderSubGrid();
  syncReqType();
}

function clearReqType() {
  currentBiz = null;
  currentSub = null;
  renderBizGrid();
  renderSubGrid();
  syncReqType();
}

function syncReqType() {
  const key = buildReqTypeKey();
  const label = buildReqTypeLabel();
  document.getElementById('req-type').value = key;
  const cur = document.getElementById('req-type-current');
  if (key) {
    cur.style.display = 'inline-flex';
    document.getElementById('rt-current-tag').textContent = label;
    document.getElementById('req-type-error').classList.remove('show');
  } else {
    cur.style.display = 'none';
  }
  updateProductLaunchField();
}

function isNewListingDemand() {
  if (currentStage !== 'new') return false;
  if (currentBiz === 'titletd' && ['title', 'td', 'titletd'].includes(currentSub)) return true;
  if (currentBiz === 'listing7') return true;
  if (currentBiz === 'video' && ['selling', 'operation'].includes(currentSub)) return true;
  return false;
}

function updateProductLaunchField() {
  const group = document.getElementById('launch-date-group');
  const input = document.getElementById('product-launch-date');
  if (!group || !input) return;
  const shouldShow = isNewListingDemand();
  group.style.display = shouldShow ? '' : 'none';
  if (!shouldShow) {
    input.value = '';
    clearError(input);
  }
}

function openDeliveryHint() {
  const modal = document.getElementById('delivery-hint-modal');
  if (modal) modal.classList.add('show');
}

function closeDeliveryHint() {
  const modal = document.getElementById('delivery-hint-modal');
  if (modal) modal.classList.remove('show');
}

// ===== 摘要标签 =====

function buildSummaryTags() {
  const tags = document.getElementById('summary-tags');
  const deliveryDate = document.getElementById('delivery-date').value || '2026-05-15';
  const launchDate = document.getElementById('product-launch-date') ? (document.getElementById('product-launch-date').value || '2026-05-25') : '';
  const skuCode = skuList[0] || 'PO17X4011';
  const skuInfo = (typeof allSkusData !== 'undefined' ? allSkusData : []).find(s => s.code === skuCode);
  const brand = skuInfo && /AUVON/i.test(skuInfo.name || '') ? 'AUVON' : 'AUVON';
  const priority = typeof renderPriorityTag === 'function'
    ? renderPriorityTag({ type: reqTypeLabels[document.getElementById('req-type').value] || '' })
    : '<span>P1</span>';
  const subSel = document.getElementById('subcategory');
  const subValue = subSel.value;
  const subText = subValue
    ? (subSel.selectedOptions && subSel.selectedOptions[0] && subSel.selectedOptions[0].textContent.trim())
      || subLabels[subValue]
      || subValue
    : '—';
  const items = [
    { label: reqTypeLabels[document.getElementById('req-type').value] || '—', color: '#5b21b6', bg: '#ede9fe' },
    { label: siteLabels[document.getElementById('site').value] || '—', color: '#1e40af', bg: '#dbeafe' },
    { label: brand, color: '#6d28d9', bg: '#f3e8ff' },
    { label: skuCode, color: '#92400e', bg: '#fef3c7' },
    { label: `📅 ${deliveryDate}`, color: '#9f1239', bg: '#ffe4e6' },
  ];
  if (isNewListingDemand()) {
    items.push({ label: `开卖 ${launchDate || '—'}`, color: '#1e3a8a', bg: '#dbeafe' });
  }
  tags.innerHTML = items.map(i =>
    `<span style="background:${i.bg};color:${i.color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${i.label}</span>`
  ).join('') + priority;
}

// ===== 上传方式 =====
function selectMethod(n) {
  currentMethod = n;
  [1, 2].forEach(i => {
    document.getElementById(`method-card-${i}`).classList.toggle('selected', i === n);
    document.getElementById(`method-content-${i}`).classList.toggle('show', i === n);
  });
}

// ===== 飞书链接管理 =====
let feishuLinks = []; // [{ id, url, valid }]
let feishuLinkSeq = 0;
const MAX_FEISHU_LINKS = 10;

function getFeishuDocType(url) {
  if (/feishu\.cn\/(docs?|docx)\//.test(url)) return { type: 'doc', label: '飞书文档', icon: '📄' };
  if (/feishu\.cn\/sheets\//.test(url)) return { type: 'sheet', label: '飞书表格', icon: '📊' };
  if (/feishu\.cn\/(base|bitable)\//.test(url)) return { type: 'base', label: '多维表格', icon: '🗂️' };
  if (/feishu\.cn\/wiki\//.test(url)) return { type: 'wiki', label: '飞书知识库', icon: '📚' };
  if (/larksuite\.com\//.test(url)) return { type: 'lark', label: 'Lark 文档', icon: '📄' };
  return null;
}

function isValidFeishuUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return /(\.|^)(feishu\.cn|larksuite\.com)$/.test(u.hostname);
  } catch (e) {
    return false;
  }
}

function addFeishuLink(presetUrl = '') {
  if (feishuLinks.length >= MAX_FEISHU_LINKS) {
    showToast(`最多只能添加 ${MAX_FEISHU_LINKS} 个链接`, 'warning');
    return;
  }
  feishuLinkSeq += 1;
  const id = `flink-${feishuLinkSeq}`;
  feishuLinks.push({ id, url: presetUrl, valid: presetUrl ? isValidFeishuUrl(presetUrl) : null });
  renderFeishuLinks();
  setTimeout(() => {
    const input = document.querySelector(`#${id} .feishu-link-input`);
    if (input && !presetUrl) input.focus();
  }, 50);
}

function removeFeishuLink(id) {
  if (feishuLinks.length <= 1) {
    document.querySelector(`#${id} .feishu-link-input`).value = '';
    feishuLinks[0].url = '';
    feishuLinks[0].valid = null;
    renderFeishuLinks();
    return;
  }
  feishuLinks = feishuLinks.filter(l => l.id !== id);
  renderFeishuLinks();
}

function onFeishuLinkInput(id, value) {
  const item = feishuLinks.find(l => l.id === id);
  if (!item) return;
  item.url = value.trim();
  item.valid = item.url ? isValidFeishuUrl(item.url) : null;
  updateFeishuLinkRow(id);
  if (feishuLinks.some(l => l.valid)) {
    document.getElementById('feishu-error').classList.remove('show');
  }
}

function onFeishuLinkPaste(id, e) {
  setTimeout(() => {
    const input = e.target;
    const text = input.value.trim();
    // 多链接粘贴：换行/空格分隔自动拆分
    const urls = text.split(/[\s\n\r]+/).filter(s => s.length > 0);
    if (urls.length > 1) {
      input.value = urls[0];
      onFeishuLinkInput(id, urls[0]);
      for (let i = 1; i < urls.length; i++) {
        if (feishuLinks.length >= MAX_FEISHU_LINKS) break;
        addFeishuLink(urls[i]);
      }
      showToast(`已自动拆分为 ${urls.length} 个链接`, 'success');
    } else {
      onFeishuLinkInput(id, text);
    }
  }, 10);
}

function updateFeishuLinkRow(id) {
  const item = feishuLinks.find(l => l.id === id);
  if (!item) return;
  const row = document.getElementById(id);
  if (!row) return;
  row.classList.remove('valid', 'invalid');
  const statusEl = row.querySelector('.feishu-link-status');
  const previewEl = row.parentElement.querySelector(`.feishu-link-preview[data-for="${id}"]`);

  if (!item.url) {
    statusEl.className = 'feishu-link-status pending';
    statusEl.innerHTML = '';
    if (previewEl) previewEl.classList.remove('show');
    return;
  }
  if (item.valid) {
    row.classList.add('valid');
    const docInfo = getFeishuDocType(item.url) || { label: '飞书文档', icon: '📄' };
    statusEl.className = 'feishu-link-status valid';
    statusEl.innerHTML = `<span>✓</span><span>${docInfo.label}</span>`;
    if (previewEl) {
      previewEl.classList.add('show');
      previewEl.innerHTML = `<div class="preview-title">${docInfo.icon} ${docInfo.label}</div><div>链接已识别，将在解析时自动抓取内容</div>`;
    }
  } else {
    row.classList.add('invalid');
    statusEl.className = 'feishu-link-status invalid';
    statusEl.innerHTML = `<span>✕</span><span>链接无效</span>`;
    if (previewEl) previewEl.classList.remove('show');
  }
}

function renderFeishuLinks() {
  const container = document.getElementById('feishu-link-list');
  if (feishuLinks.length === 0) addFeishuLinkSilent();
  container.innerHTML = feishuLinks.map((l, idx) => `
    <div class="feishu-link-item" id="${l.id}">
      <div class="feishu-link-icon">飞</div>
      <div class="feishu-link-index">#${idx + 1}</div>
      <input
        type="url"
        class="feishu-link-input"
        placeholder="https://xxx.feishu.cn/docs/xxxxxx"
        value="${(l.url || '').replace(/"/g, '&quot;')}"
        oninput="onFeishuLinkInput('${l.id}', this.value)"
        onpaste="onFeishuLinkPaste('${l.id}', event)"
      />
      <div class="feishu-link-status pending"></div>
      <button class="feishu-link-remove" onclick="removeFeishuLink('${l.id}')" title="${feishuLinks.length === 1 ? '清空' : '删除'}">✕</button>
    </div>
    <div class="feishu-link-preview" data-for="${l.id}"></div>
  `).join('');
  feishuLinks.forEach(l => updateFeishuLinkRow(l.id));
  updateAddButton();
}

function addFeishuLinkSilent() {
  feishuLinkSeq += 1;
  feishuLinks.push({ id: `flink-${feishuLinkSeq}`, url: '', valid: null });
}

function updateAddButton() {
  const btn = document.querySelector('.btn-add-link');
  if (!btn) return;
  if (feishuLinks.length >= MAX_FEISHU_LINKS) {
    btn.disabled = true;
    btn.innerHTML = `${I('plus', 16)}<span>已达上限（${MAX_FEISHU_LINKS}/${MAX_FEISHU_LINKS}）</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = `${I('plus', 16)}<span>添加飞书文档链接（${feishuLinks.length}/${MAX_FEISHU_LINKS}）</span>`;
  }
}

function clearAllFeishuLinks() {
  feishuLinks = [];
  feishuLinkSeq = 0;
  addFeishuLinkSilent();
  renderFeishuLinks();
  document.getElementById('feishu-error').classList.remove('show');
  showToast('已清空所有链接', 'success');
}

function getValidFeishuLinks() {
  return feishuLinks.filter(l => l.valid && l.url);
}

// ===== 文件上传 =====
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('drag-over');
}
function handleDragLeave() {
  document.getElementById('upload-zone').classList.remove('drag-over');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}
function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx','xls'].includes(ext)) {
    showToast('仅支持 XLSX、XLS 格式文件', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('文件大小不能超过 10MB', 'error');
    return;
  }
  uploadedFile = file;
  document.getElementById('uploaded-fname').textContent = file.name;
  document.getElementById('uploaded-fsize').textContent =
    `${(file.size / 1024).toFixed(1)} KB · 准备解析`;
  document.getElementById('uploaded-file-display').style.display = 'block';
  document.getElementById('file-error').classList.remove('show');
  showToast(`文件 "${file.name}" 已选择`, 'success');
}
function removeFile() {
  uploadedFile = null;
  document.getElementById('uploaded-file-display').style.display = 'none';
  document.getElementById('file-input').value = '';
}
function downloadTemplate() {
  showToast('需求模板下载中...', 'success');
  setTimeout(() => showToast('模板已下载，请按格式填写后上传', 'success'), 1000);
}

// ===== 解析流程 =====
function startParsing() {
  // 验证
  if (currentMethod === 1) {
    const validLinks = getValidFeishuLinks();
    const hasAnyInput = feishuLinks.some(l => l.url);
    if (!hasAnyInput) {
      document.getElementById('feishu-error').textContent = '请至少添加一个飞书文档链接';
      document.getElementById('feishu-error').classList.add('show');
      showToast('请先添加飞书文档链接', 'warning');
      return;
    }
    if (validLinks.length === 0) {
      document.getElementById('feishu-error').textContent = '请检查链接格式，需为有效的飞书 / Lark 链接';
      document.getElementById('feishu-error').classList.add('show');
      showToast('链接格式不正确', 'warning');
      return;
    }
    const invalidCount = feishuLinks.filter(l => l.url && !l.valid).length;
    if (invalidCount > 0) {
      showToast(`存在 ${invalidCount} 个无效链接，将仅解析有效链接`, 'warning');
    }
  } else {
    if (!uploadedFile) {
      document.getElementById('file-error').classList.add('show');
      showToast('请先上传需求文件', 'warning');
      return;
    }
  }

  // 显示解析遮罩
  const overlay = document.getElementById('parsing-overlay');
  overlay.classList.add('show');

  // 重置步骤
  [1,2,3,4].forEach(i => {
    const el = document.getElementById(`pstep-${i}`);
    el.className = 'parsing-step-item pending';
    el.querySelector('.psi-dot').textContent = i;
  });
  document.getElementById('progress-bar').style.width = '0%';

  // 模拟解析步骤
  const steps = [
    { delay: 400, progress: 20 },
    { delay: 1100, progress: 50 },
    { delay: 1800, progress: 78 },
    { delay: 2500, progress: 95 },
  ];

  steps.forEach((s, idx) => {
    // 激活当前步骤
    setTimeout(() => {
      if (idx > 0) {
        const prev = document.getElementById(`pstep-${idx}`);
        prev.className = 'parsing-step-item done';
        prev.querySelector('.psi-dot').textContent = '✓';
      }
      const cur = document.getElementById(`pstep-${idx + 1}`);
      cur.className = 'parsing-step-item active';
      document.getElementById('progress-bar').style.width = s.progress + '%';
    }, s.delay);
  });

  // 完成
  setTimeout(() => {
    const last = document.getElementById('pstep-4');
    last.className = 'parsing-step-item done';
    last.querySelector('.psi-dot').textContent = '✓';
    document.getElementById('progress-bar').style.width = '100%';
  }, 3100);

  setTimeout(() => {
    overlay.classList.remove('show');
    showResultPage();
  }, 3600);
}

// ===== 结果页 =====
// ===== 结果页模块定义 =====

