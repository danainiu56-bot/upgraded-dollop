/* ============================================
   路由 / 视图切换 / 状态持久化
   抽取自 创建需求-上传页面.html
   依赖：sessionStorage、各页面 render 函数（页面 JS 提供）
   ============================================ */

// ----- VIEW_KEY / FORM_KEY -----
const VIEW_KEY = '__cursor_current_view';
const FORM_KEY = '__cursor_step1_form';

// ----- saveView -----
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, view); } catch (e) {}
}

// ----- getSavedView -----
function getSavedView() {
  try { return sessionStorage.getItem(VIEW_KEY); } catch (e) { return null; }
}

// ----- saveStep1Form -----
function saveStep1Form() {
  try {
    const data = {
      stage: currentStage,
      biz: currentBiz,
      sub: currentSub,
      site: document.getElementById('site').value,
      subcategory: document.getElementById('subcategory').value,
      sku: skuList[0] || '',
      delivery: document.getElementById('delivery-date').value,
      launchDate: document.getElementById('product-launch-date') ? document.getElementById('product-launch-date').value : '',
    };
    sessionStorage.setItem(FORM_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ----- restoreStep1Form -----
async function restoreStep1Form() {
  try {
    const raw = sessionStorage.getItem(FORM_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.stage) selectStage(data.stage);
    if (data.biz) selectBiz(data.biz);
    if (data.sub) selectSub(data.sub);
    if (data.site) document.getElementById('site').value = data.site;
    if (data.subcategory) {
      document.getElementById('subcategory').value = data.subcategory;
      await onSubcategoryChange();
      if (data.sku) selectSku(data.sku);
    }
    if (data.delivery) document.getElementById('delivery-date').value = data.delivery;
    if (typeof updateProductLaunchField === 'function') updateProductLaunchField();
    if (data.launchDate && document.getElementById('product-launch-date')) {
      document.getElementById('product-launch-date').value = data.launchDate;
    }
    return true;
  } catch (e) { return false; }
}

// ----- restoreSavedView -----
function restoreSavedView() {
  const view = getSavedView();
  if (!view || view === 'list') {
    goToList();
    return;
  }
  if (view === 'workbench') {
    goToList();
    showWorkbenchView();
  } else if (view === 'demand-mgr') {
    goToList();
    showDemandMgrView();
  } else if (view === 'review-mgr') {
    goToList();
    showReviewMgrView();
  } else if (view === 'copy-review') {
    goToList();
    showCopyReviewView();
  } else if (view === 'ai-chat') {
    goToList();
    showDemandMgrView();
    openAiChat(aiChatState.sku || 'PO17X4011', aiChatState.productName || '7格便携药盒');
  } else if (view === 'wizard:1') {
    goToCreate();
    restoreStep1Form();
  } else if (view === 'wizard:2') {
    goToCreate({ skipSetStep: true, silent: true });
    restoreStep1Form();
    buildSummaryTags();
    setStep(2);
  } else if (view === 'result') {
    goToCreate({ skipSetStep: true, silent: true });
    restoreStep1Form();
    buildSummaryTags();
    setStep(2);
    showResultPage();
  } else {
    goToList();
  }
}

// ----- goToList -----
function goToList() {
  document.getElementById('list-page').classList.add('show');
  document.getElementById('wizard-main').style.display = 'none';
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('topbar-divider').style.display = 'none';
  document.getElementById('topbar-title').style.display = 'none';
  document.getElementById('topbar-tools').style.display = 'flex';
  document.getElementById('back-to-list-btn').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'instant' });
  saveView('list');
}

// ----- goToCreate -----
function goToCreate(opts = {}) {
  document.getElementById('list-page').classList.remove('show');
  document.getElementById('wizard-main').style.display = 'block';
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('topbar-divider').style.display = 'inline-block';
  document.getElementById('topbar-title').style.display = 'inline';
  document.getElementById('topbar-tools').style.display = 'none';
  document.getElementById('back-to-list-btn').style.display = 'inline-flex';
  if (!opts.skipSetStep) setStep(1);
  if (!opts.silent) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- setListActiveTabTitle -----
function setListActiveTabTitle(title) {
  const el = document.getElementById('list-active-tab-title');
  if (el) el.textContent = title;
}

// ----- showWorkbenchView -----
function showWorkbenchView() {
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    // 只隐藏 list-main 下「首页列表」那一层，避免误伤 #demand-mgr-view 内部的同名 class（否则文案区会被写死 display:none）
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => { el.style.display = 'none'; });
  }
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const wb = document.getElementById('workbench-view');
  if (wb) {
    wb.style.display = 'flex';
    refreshWorkbench();
    wb.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const wbBtn = document.querySelector(`.list-nav-single[onclick*="'workbench'"]`);
  if (wbBtn) wbBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('workbench');
}

// ----- showCopywritingView -----
function showCopywritingView() {
  // 显示 需求管理 列表（list-main 内默认那一套）
  setListActiveTabTitle('需求管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-tab-bar, :scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = '');
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'copywriting'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('list');
}

// ----- showDemandMgrView -----
function showDemandMgrView() {
  // 隐藏 需求管理 的筛选栏 + 表格 + 分页，但保留顶部 Tab 切换
  setListActiveTabTitle('文案管理');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) {
    // 用 flex 匹配 CSS 中 .demand-mgr-view 的 display:flex（避免覆盖布局）
    dm.style.display = 'flex';
    // 若曾被旧版 showWorkbench 全局写过 display:none，进入文案管理时清掉内层行内样式
    dm.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    // 防御性：先 apply 筛选；如果 applyCopyFilters 因任何原因没正确填表（罕见），强制再 render 一次
    try {
      if (typeof applyCopyFilters === 'function') applyCopyFilters();
    } catch (e) {
      console.error('[demand-mgr] applyCopyFilters 失败:', e);
    }
    const tbody = document.getElementById('cf-tbody');
    if (tbody && tbody.children.length === 0) {
      // 兜底：直接渲染全量数据
      if (typeof copyCurrentListData !== 'undefined' && copyCurrentListData.length === 0) {
        copyCurrentListData = COPY_LIST_DATA.slice();
      }
      if (typeof renderCopyListTable === 'function') renderCopyListTable();
    }
    dm.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'demand-mgr'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('demand-mgr');
}

// ----- showReviewMgrView -----
function showReviewMgrView() {
  setListActiveTabTitle('需求审核');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) cr.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) {
    rv.style.display = 'flex';
    rv.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    if (typeof renderReviewMgrView === 'function') renderReviewMgrView();
    rv.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'titletd-review'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('review-mgr');
}

// ----- showCopyReviewView -----
function showCopyReviewView() {
  setListActiveTabTitle('文案审核');
  const main = document.querySelector('#list-page .list-main');
  if (main) {
    main.querySelectorAll(':scope > .list-filter-bar, :scope > .list-table-wrap, :scope > .list-pagination')
      .forEach(el => el.style.display = 'none');
    const tabBar = main.querySelector(':scope > .list-tab-bar');
    if (tabBar) tabBar.style.display = '';
  }
  const wb = document.getElementById('workbench-view');
  if (wb) wb.style.display = 'none';
  const dm = document.getElementById('demand-mgr-view');
  if (dm) dm.style.display = 'none';
  const rv = document.getElementById('review-mgr-view');
  if (rv) rv.style.display = 'none';
  const cr = document.getElementById('copy-review-view');
  if (cr) {
    cr.style.display = 'flex';
    cr.querySelectorAll('.list-filter-bar, .list-table-wrap, .list-pagination').forEach(el => {
      el.style.display = '';
    });
    if (typeof renderCopyReviewView === 'function') renderCopyReviewView();
    cr.scrollTop = 0;
  }
  document.querySelectorAll('.list-nav-link, .list-nav-single').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`.list-nav-link[onclick*="'copy-review'"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (typeof saveView === 'function') saveView('copy-review');
}

// ============================================
// 工作台时间粒度状态 + 看板动态渲染
// ============================================

let wbState = { granularity: 'month', year: 2026, month: 5, quarter: 2, anomalyOnly: false };

function setWbGranularity(g) {
  if (!['month', 'quarter', 'year'].includes(g)) return;
  wbState.granularity = g;
  // 更新段控件 active
  document.querySelectorAll('#wb-granularity-seg button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.g === g);
  });
  refreshWorkbench();
}

function setWbYear(y) {
  wbState.year = parseInt(y, 10);
  refreshWorkbench();
}
function setWbMonth(m) {
  wbState.month = parseInt(m, 10);
  refreshWorkbench();
}
function setWbQuarter(q) {
  wbState.quarter = parseInt(q, 10);
  refreshWorkbench();
}

function renderWbTimePickers() {
  const wrap = document.getElementById('wb-time-pickers');
  if (!wrap) return;
  const years = [2025, 2026];
  const yearOpts = years.map(y => `<option value="${y}" ${y === wbState.year ? 'selected' : ''}>${y}年</option>`).join('');
  if (wbState.granularity === 'month') {
    const monthOpts = [];
    for (let m = 1; m <= 12; m++) {
      monthOpts.push(`<option value="${m}" ${m === wbState.month ? 'selected' : ''}>${m}月</option>`);
    }
    wrap.innerHTML = `
      <select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>
      <select class="wb-month-select" onchange="setWbMonth(this.value)">${monthOpts.join('')}</select>`;
  } else if (wbState.granularity === 'quarter') {
    const qOpts = [1, 2, 3, 4].map(q => `<option value="${q}" ${q === wbState.quarter ? 'selected' : ''}>Q${q}</option>`).join('');
    wrap.innerHTML = `
      <select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>
      <select class="wb-month-select" onchange="setWbQuarter(this.value)">${qOpts}</select>`;
  } else {
    wrap.innerHTML = `<select class="wb-month-select" onchange="setWbYear(this.value)">${yearOpts}</select>`;
  }
}

function refreshWorkbench() {
  renderWbTimePickers();
  const data = (typeof getWorkbenchData === 'function') ? getWorkbenchData(wbState) : null;
  if (!data) return;
  renderWbHealth(data);
  renderWbBuDist(data);
  renderWbTypeDist(data);
  renderWbTeam(data);
  renderWbQuality(data);
  renderWbFocus(data);
  if (typeof renderWbTrend === 'function') renderWbTrend();
  // 重新应用 BU 筛选/异常筛选状态
  if (typeof updateWorkbenchDistributionFilter === 'function') updateWorkbenchDistributionFilter();
}

function wbScopeLabel() {
  const g = wbState.granularity;
  if (g === 'month') return `${wbState.year} 年 ${wbState.month} 月`;
  if (g === 'quarter') return `${wbState.year} 年 Q${wbState.quarter}`;
  return `${wbState.year} 年`;
}

function renderWbHealth(data) {
  const hero = document.getElementById('wb-health-hero');
  const metrics = document.getElementById('wb-health-metrics');
  if (hero) {
    const eyebrow = `${wbScopeLabel()} 经营健康度`;
    const status = data.health.status;
    hero.innerHTML = `
      <div class="health-eyebrow">${eyebrow}</div>
      <div class="health-status">${status}</div>
      <p>${data.health.summary}</p>
      <div class="health-facts">
        <span class="static">需求总量 ${data.total}</span>
        <span onclick="event.stopPropagation(); openWorkbenchRiskOverview()">风险需求 ${data.overdue + data.willOverdue}</span>
        <span class="danger" onclick="event.stopPropagation(); openWorkbenchRiskOverview()">已逾期 ${data.overdue}</span>
        <span class="warn" onclick="event.stopPropagation(); openWorkbenchRiskOverview()">即将逾期 ${data.willOverdue}</span>
      </div>`;
  }
  if (metrics) {
    const k = data.kpi;
    const fmt = v => `${(v * 100).toFixed(1).replace(/\.0$/, '')}%`;
    metrics.innerHTML = `
      <div class="health-metric" onclick="openWorkbenchKpiDetail('delivery')">
        <span>准时交付率</span><strong>${fmt(k.delivery)}</strong><em>${k.delivery >= 0.9 ? '整体达标' : '低于 90% 目标'}</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('draft')">
        <span>一稿通过率</span><strong>${fmt(k.draft)}</strong><em>${k.draft >= 0.9 ? '达标' : '低于 90% 目标'}</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('grammar')">
        <span>语法准确率</span><strong>${fmt(k.grammar)}</strong><em>基础质量稳定</em>
      </div>
      <div class="health-metric" onclick="openWorkbenchKpiDetail('ai')">
        <span>AI 采纳率</span><strong>${fmt(k.ai)}</strong><em>${k.ai >= 0.8 ? '采纳良好' : '部分类型偏低'}</em>
      </div>`;
  }
}

function renderWbBuDist(data) {
  const list = document.getElementById('wb-bu-list');
  if (!list) return;
  const rows = WB_BU_LIST.map(name => {
    const total = data.bu[name] || 0;
    const risk = data.buRisk[name] || { warn: 0, danger: 0 };
    const normal = Math.max(0, total - risk.warn - risk.danger);
    const pct = (n) => total ? `${(n * 100 / total).toFixed(1)}%` : '0%';
    const isRisk = (risk.warn + risk.danger) > 0;
    const riskCls = risk.danger >= 2 ? 'risk-high' : (isRisk ? 'risk-warn' : 'risk-good');
    return `
      <div class="chart-bar-row ${riskCls}" data-bu="${name}" data-risk="${isRisk}" onclick="applyWorkbenchBuFilter('${name}')">
        <div class="chart-label"><strong>${name}</strong><em>${WB_BU_HINT[name] || ''}</em></div>
        <div class="chart-stack-wrap">
          <div class="stacked-bar">
            <span class="normal" style="width:${pct(normal)};"></span>
            <span class="warn" style="width:${pct(risk.warn)};"></span>
            <span class="danger" style="width:${pct(risk.danger)};"></span>
          </div>
          <div class="chart-segment-counts">
            <span class="normal">进行中 ${normal}</span>
            <span class="warn">即将逾期 ${risk.warn}</span>
            <span class="danger">已逾期 ${risk.danger}</span>
          </div>
        </div>
        <div class="chart-kpi"><b>${total}</b><span>风险 ${risk.warn + risk.danger}</span></div>
      </div>`;
  }).join('');
  list.innerHTML = rows;
}

function renderWbTypeDist(data) {
  const list = document.getElementById('wb-type-list');
  if (!list) return;
  const rows = WB_TYPE_LIST.map(name => {
    const total = data.type[name] || 0;
    const risk = data.typeRisk[name] || { warn: 0, danger: 0 };
    const normal = Math.max(0, total - risk.warn - risk.danger);
    const pct = (n) => total ? `${(n * 100 / total).toFixed(1)}%` : '0%';
    const isRisk = (risk.warn + risk.danger) > 0;
    const riskCls = risk.danger >= 2 ? 'risk-high' : (isRisk ? 'risk-warn' : 'risk-good');
    return `
      <div class="chart-bar-row ${riskCls}" data-demand-card="${name}" data-bu-match="${WB_TYPE_BU_MATCH[name] || ''}" data-risk="${isRisk}" onclick="openWorkbenchDemandOverview('${name}')">
        <div class="chart-label"><strong>${name}</strong><em>${WB_TYPE_HINT[name] || ''}</em></div>
        <div class="chart-stack-wrap">
          <div class="stacked-bar">
            <span class="normal" style="width:${pct(normal)};"></span>
            <span class="warn" style="width:${pct(risk.warn)};"></span>
            <span class="danger" style="width:${pct(risk.danger)};"></span>
          </div>
          <div class="chart-segment-counts">
            <span class="normal">进行中 ${normal}</span>
            <span class="warn">即将逾期 ${risk.warn}</span>
            <span class="danger">已逾期 ${risk.danger}</span>
          </div>
        </div>
        <div class="chart-kpi"><b>${total}</b><span>风险 ${risk.warn + risk.danger}</span></div>
      </div>`;
  }).join('');
  list.innerHTML = rows;
}

function renderWbTeam(data) {
  const wrap = document.getElementById('wb-team-rows');
  if (!wrap) return;
  const maxLoad = Math.max(...data.team.map(t => t.load), 1);
  const fmtPct = v => `${(v * 100).toFixed(0)}%`;
  const cls = (label, value) => {
    if (label === 'grammar') return value >= 0.97 ? 'metric-good' : (value < 0.95 ? 'metric-warn' : '');
    if (label === 'draft') return value < 0.80 ? 'metric-danger' : '';
    if (label === 'ai') return value < 0.70 ? 'metric-danger' : '';
    return '';
  };
  wrap.innerHTML = data.team.map(t => {
    const attention = t.draft < 0.80 ? 'attention' : '';
    return `<div class="team-table-row ${attention}" onclick="openWorkbenchPersonDetail('${t.name}')">
      <strong>${t.name}</strong>
      <span class="${cls('grammar', t.grammar)}">${fmtPct(t.grammar)}</span>
      <span class="${cls('draft', t.draft)}">${fmtPct(t.draft)}</span>
      <span class="${cls('ai', t.ai)}">${fmtPct(t.ai)}</span>
      <b>${t.load}</b>
      <i><em style="width:${Math.min(100, Math.round(t.load * 100 / maxLoad))}%;"></em></i>
      <p>${WB_TEAM_HINT[t.name] || ''}</p>
    </div>`;
  }).join('');
}

function renderWbQuality(data) {
  const list = document.getElementById('wb-quality-list');
  if (!list) return;
  list.innerHTML = data.quality.map(q =>
    `<div class="wb-quality-row"><span>${q.label}</span><b>${q.pct}%</b><i style="width:${q.pct}%;"></i></div>`
  ).join('');
}

function renderWbFocus(data) {
  const list = document.getElementById('wb-focus-list');
  if (!list) return;
  const cls = ['high', '', '', 'good'];
  list.innerHTML = data.focus.map((text, i) =>
    `<div class="wb-focus-item ${cls[i] || ''}">${text}</div>`
  ).join('');
}

const WORKBENCH_PERSON_DATA = {
  Mason: {
    kpis: ['18', '98%', '88%', '80%', '高负载'],
    risk: '当前处理量最高，建议控制新增分配，优先处理 Listing 图片文案审核。',
    bu: '物理治疗 8 / 北美市场 5 / 家居关怀 3 / 慢病耗材 2',
    type: '新品 Listing 7 / Listing 图片文案 5 / 包装盒 3 / FAQ 3',
    issues: ['信息错误 3 次', 'GEO/本地化不匹配 2 次', '卖点表达不清 1 次'],
  },
  Yumi: {
    kpis: ['15', '97%', '84%', '76%', '正常'],
    risk: '交付稳定，可承接部分 FAQ 与新闻稿需求。',
    bu: '家居关怀 6 / 物理治疗 4 / 健康家访 3 / 北美市场 2',
    type: '优化 Listing 5 / FAQ 4 / 说明书 3 / 新闻稿 3',
    issues: ['因果链不完整 2 次', 'SEO 覆盖不足 2 次'],
  },
  Brian: {
    kpis: ['12', '94%', '76%', '68%', '需关注'],
    risk: '一稿通过率低于团队均值，建议复盘需求理解和资料引用链路。',
    bu: '慢病耗材 5 / 北美市场 4 / 物理治疗 2 / 家居关怀 1',
    type: '说明书 4 / 视频脚本 3 / Listing 图片文案 3 / FAQ 2',
    issues: ['信息错误 4 次', '因果链不完整 3 次', '语法问题 2 次'],
  },
  Suki: {
    kpis: ['10', '96%', '82%', '74%', '可承接'],
    risk: '当前负载较低，可承接慢病耗材和新闻稿类需求。',
    bu: '健康家访 4 / 家居关怀 3 / 慢病耗材 2 / 北美市场 1',
    type: '新闻稿 3 / FAQ 3 / 包装盒 2 / 优化 Listing 2',
    issues: ['SEO 覆盖不足 2 次', '卖点表达不清 1 次'],
  },
};

const WORKBENCH_KPI_DETAILS = {
  grammar: {
    title: '语法准确率详情',
    subtitle: '语法准确率用于衡量文案基础质量是否稳定。',
    cards: [
      ['按人员', 'Mason 98% / Yumi 97% / Suki 96% / Brian 94%'],
      ['按需求类型', 'FAQ 98% / 新闻稿 97% / 新品 Listing 96% / 视频脚本 93%'],
      ['主要问题', '长句结构、单位表达、站点本地化拼写差异'],
      ['管理建议', 'Brian 低于团队均值，建议优先复盘语法与本地化检查规则'],
    ],
  },
  delivery: {
    title: '准时交付率详情',
    subtitle: '准时交付率用于判断团队交付节奏是否稳定。',
    cards: [
      ['按 BU', '健康家访 96% / 物理治疗 93% / 北美市场 90% / 慢病耗材 86%'],
      ['按需求类型', '包装盒 95% / FAQ 94% / Listing 图片文案 82%'],
      ['风险来源', '已逾期 3 个，集中在 Listing 图片文案和说明书'],
      ['管理建议', '先处理已逾期需求，再为开卖临近的新品 Listing 预留审核资源'],
    ],
  },
  draft: {
    title: '一稿通过率详情',
    subtitle: '一稿通过率反映需求理解和初稿质量。',
    cards: [
      ['按人员', 'Mason 88% / Yumi 84% / Suki 82% / Brian 76%'],
      ['按需求类型', 'FAQ 90% / 新闻稿 88% / 说明书 79% / 视频脚本 74%'],
      ['未通过原因', '需求信息不完整、因果链不足、卖点表达不清'],
      ['管理建议', '对低通过率类型补充模板和审核前自检清单'],
    ],
  },
  ai: {
    title: 'AI 采纳率详情',
    subtitle: 'AI 采纳率用于衡量 AI 初稿是否真正能减少人工修改。',
    cards: [
      ['按需求类型', 'FAQ 84% / 新闻稿 81% / 新品 Listing 76% / 视频脚本 62%'],
      ['按人员', 'Mason 80% / Yumi 76% / Suki 74% / Brian 68%'],
      ['低采纳原因', '视频脚本场景细节不足，GEO 表达不够贴近站点'],
      ['管理建议', '优化视频脚本 Prompt，并补充站点化表达样例'],
    ],
  },
};

let workbenchDistributionFilter = { bu: '', anomalyOnly: false };

function renderWorkbenchInfoCards(cards) {
  return `<div class="wb-risk-breakdown">${cards.map(([title, text]) => `
    <div class="wb-person-card">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>`).join('')}</div>`;
}

function openWorkbenchKpiDetail(type) {
  const data = WORKBENCH_KPI_DETAILS[type];
  const modal = document.getElementById('wb-kpi-modal');
  const title = document.getElementById('wb-kpi-title');
  const subtitle = document.getElementById('wb-kpi-subtitle');
  const body = document.getElementById('wb-kpi-body');
  if (!modal || !title || !subtitle || !body || !data) return;
  title.textContent = data.title;
  subtitle.textContent = data.subtitle;
  body.innerHTML = renderWorkbenchInfoCards(data.cards);
  modal.classList.add('show');
}

function closeWorkbenchKpiDetail() {
  const modal = document.getElementById('wb-kpi-modal');
  if (modal) modal.classList.remove('show');
}

function applyWorkbenchBuFilter(bu) {
  workbenchDistributionFilter.bu = bu;
  updateWorkbenchDistributionFilter();
}

function clearWorkbenchDistributionFilter() {
  workbenchDistributionFilter.bu = '';
  updateWorkbenchDistributionFilter();
}

function toggleWorkbenchAnomalyOnly() {
  workbenchDistributionFilter.anomalyOnly = !workbenchDistributionFilter.anomalyOnly;
  updateWorkbenchDistributionFilter();
}

function updateWorkbenchDistributionFilter() {
  const chip = document.getElementById('wb-filter-chips');
  const toggle = document.getElementById('wb-anomaly-toggle');
  const bu = workbenchDistributionFilter.bu;
  if (chip) {
    const label = bu ? `${bu} / 相关需求类型` : '全部 BU / 全部需求类型';
    chip.querySelector('span').textContent = `当前：${label}`;
  }
  if (toggle) toggle.classList.toggle('active', workbenchDistributionFilter.anomalyOnly);
  document.querySelectorAll('[data-bu]').forEach(card => {
    card.classList.toggle('active', card.dataset.bu === bu);
    card.classList.toggle('anomaly-hidden', workbenchDistributionFilter.anomalyOnly && card.dataset.risk !== 'true');
  });
  document.querySelectorAll('[data-demand-card]').forEach(card => {
    const matchBu = !bu || (card.dataset.buMatch || '').split(',').includes(bu);
    card.classList.toggle('filtered-out', !matchBu);
    card.classList.toggle('anomaly-hidden', workbenchDistributionFilter.anomalyOnly && card.dataset.risk !== 'true');
  });
}

function openWorkbenchPersonDetail(name) {
  const data = WORKBENCH_PERSON_DATA[name];
  const modal = document.getElementById('wb-person-modal');
  const title = document.getElementById('wb-person-title');
  const body = document.getElementById('wb-person-body');
  if (!modal || !title || !body || !data) return;
  title.textContent = `${name} 个人看板`;
  body.innerHTML = `
    <div class="wb-person-kpis">
      <div class="wb-person-kpi"><span>处理量</span><strong>${data.kpis[0]}</strong></div>
      <div class="wb-person-kpi"><span>语法准确率</span><strong>${data.kpis[1]}</strong></div>
      <div class="wb-person-kpi"><span>一稿通过率</span><strong>${data.kpis[2]}</strong></div>
      <div class="wb-person-kpi"><span>AI 采纳率</span><strong>${data.kpis[3]}</strong></div>
      <div class="wb-person-kpi"><span>当前负载</span><strong>${data.kpis[4]}</strong></div>
    </div>
    <div class="wb-person-detail-grid">
      <div class="wb-person-card"><h3>BU 分布</h3><p>${data.bu}</p></div>
      <div class="wb-person-card"><h3>需求类型分布</h3><p>${data.type}</p></div>
      <div class="wb-person-card"><h3>主要质量问题</h3><ul>${data.issues.map(item => `<li>${item}</li>`).join('')}</ul></div>
      <div class="wb-person-card"><h3>管理建议</h3><p>${data.risk}</p></div>
    </div>`;
  modal.classList.add('show');
}

function closeWorkbenchPersonDetail() {
  const modal = document.getElementById('wb-person-modal');
  if (modal) modal.classList.remove('show');
}

function openWorkbenchRiskOverview() {
  const modal = document.getElementById('wb-risk-modal');
  if (modal) modal.classList.add('show');
}

function closeWorkbenchRiskOverview() {
  const modal = document.getElementById('wb-risk-modal');
  if (modal) modal.classList.remove('show');
}

const WORKBENCH_DEMAND_EXTRA_ROWS = [
  ['新品 Listing', '新品 Listing：EB1521048', '健康护理 BU · 德国站 · 迷你便携药盒', '需求审核', '当前：需求审核', ''],
  ['新品 Listing', '新品 Listing：EB1522091', '家居生活 BU · 日本站 · 便携按摩枪', '文案生成', '当前：文案生成', ''],
  ['新品 Listing', '新品 Listing：EB1523305', '健康护理 BU · 加拿大站 · 智能血压仪', '已完成', '当前：已完成', 'good'],
  ['优化 Title/TD', '优化 Title/TD：PO20A1101', '健康护理 BU · 美国站 · 智能温控药盒', '需求审核', '当前：需求审核', ''],
  ['优化 Title/TD', '优化 Title/TD：PO21C3301', '家居生活 BU · 德国站 · 加热颈椎仪', '文案审核', '当前：文案审核', 'warn'],
  ['优化 Title/TD', '优化 Title/TD：PO22F6601', '健康护理 BU · 英国站 · 便携血氧仪', '已完成', '当前：已完成', 'good'],
  ['Listing 图片文案', 'Listing 图片文案：PX2021077', '家居生活 BU · 英国站 · 桌面收纳套装', '文案审核', '当前：文案审核', 'warn'],
  ['Listing 图片文案', 'Listing 图片文案：PX2021120', '健康护理 BU · 美国站 · 药盒旅行装', '文案生成', '当前：文案生成', ''],
  ['Listing 图片文案', 'Listing 图片文案：PX2021198', '家居生活 BU · 加拿大站 · 收纳药盒组合', '已完成', '当前：已完成', 'good'],
  ['包装盒', '包装盒：BX2209045', '健康护理 BU · 美国站 · 便携血氧仪', '需求审核', '当前：需求审核', ''],
  ['包装盒', '包装盒：BX2209099', '家居生活 BU · 德国站 · 家用按摩枪', '文案审核', '当前：文案审核', 'warn'],
  ['包装盒', '包装盒：BX2209186', '健康护理 BU · 英国站 · 7格便携药盒', '已完成', '当前：已完成', 'good'],
  ['说明书', '说明书：MN3001150', '健康护理 BU · 加拿大站 · 颈椎理疗仪', '需求审核', '当前：需求审核', ''],
  ['说明书', '说明书：MN3001233', '家居生活 BU · 美国站 · 智能按摩仪', '文案生成', '当前：文案生成', ''],
  ['说明书', '说明书：MN3001298', '健康护理 BU · 日本站 · 温控药盒', '已完成', '当前：已完成', 'good'],
  ['视频脚本文案', '视频脚本文案：AS8012112', '家居生活 BU · 德国站 · 智能收纳药盒', '需求审核', '当前：需求审核', ''],
  ['视频脚本文案', '视频脚本文案：AS8012230', '健康护理 BU · 加拿大站 · 家用理疗仪', '文案审核', '当前：文案审核', 'warn'],
  ['视频脚本文案', '视频脚本文案：AS8012344', '家居生活 BU · 英国站 · 便携按摩器', '已完成', '当前：已完成', 'good'],
  ['FAQ', 'FAQ：FQ8801240', '家居生活 BU · 美国站 · 智能按摩枪', '需求审核', '当前：需求审核', ''],
  ['FAQ', 'FAQ：FQ8801288', '健康护理 BU · 加拿大站 · 理疗贴片', '文案审核', '当前：文案审核', 'warn'],
  ['FAQ', 'FAQ：FQ8801320', '健康护理 BU · 德国站 · 温控药盒', '已完成', '当前：已完成', 'good'],
  ['新闻稿', '新闻稿：PR240430', '健康护理 BU · 加拿大站 · 新品上市传播', '需求审核', '当前：需求审核', ''],
  ['新闻稿', '新闻稿：PR240506', '家居生活 BU · 美国站 · 活动传播', '文案生成', '当前：文案生成', ''],
  ['新闻稿', '新闻稿：PR240512', '健康护理 BU · 英国站 · 品牌传播', '已完成', '当前：已完成', 'good'],
];

function renderWorkbenchDemandRow([type, title, meta, currentStage, statusText, statusClass]) {
  const stages = ['需求提交', '需求审核', '文案生成', '文案审核', '已完成'];
  const activeIndex = stages.indexOf(currentStage);
  const dueText = statusClass === 'danger' ? '已逾期' : statusClass === 'warn' ? '即将逾期' : '正常';
  const stageHtml = stages.map((stage, index) => {
    const classes = [];
    if (index < activeIndex || currentStage === '已完成') classes.push('done');
    if (index === activeIndex) classes.push('active');
    return `<span class="${classes.join(' ')}">${stage}</span>`;
  }).join('');
  return `<div class="wb-demand-row is-hidden" data-demand-type="${type}" data-generated="true">
    <div class="demand-main">
      <strong>${title}</strong>
      <span>${meta}</span>
    </div>
    <div class="demand-progress">${stageHtml}</div>
    <em class="demand-status ${statusClass || ''}">${dueText} · ${statusText}</em>
  </div>`;
}

function ensureWorkbenchDemandRows() {
  const list = document.querySelector('#wb-demand-modal .wb-demand-list');
  if (!list || list.dataset.extraReady === 'true') return;
  list.insertAdjacentHTML('beforeend', WORKBENCH_DEMAND_EXTRA_ROWS.map(renderWorkbenchDemandRow).join(''));
  list.dataset.extraReady = 'true';
}

function openWorkbenchDemandOverview(type = '新品 Listing') {
  const modal = document.getElementById('wb-demand-modal');
  if (modal) {
    modal.classList.add('show');
    ensureWorkbenchDemandRows();
    filterWorkbenchDemandType(type);
  }
}

function closeWorkbenchDemandOverview() {
  const modal = document.getElementById('wb-demand-modal');
  if (modal) modal.classList.remove('show');
}

function filterWorkbenchDemandType(type) {
  document.querySelectorAll('.wb-demand-type-card').forEach(card => {
    card.classList.toggle('active', card.dataset.demandType === type);
  });
  document.querySelectorAll('.wb-demand-row').forEach(row => {
    row.classList.toggle('is-hidden', row.dataset.demandType !== type);
  });
  const title = document.getElementById('wb-demand-detail-title');
  if (title) title.textContent = `${type} 进度明细`;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeWorkbenchDemandOverview();
    closeWorkbenchPersonDetail();
    closeWorkbenchRiskOverview();
    closeWorkbenchKpiDetail();
  }
});

