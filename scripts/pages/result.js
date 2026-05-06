/* ============================================
   解析结果页（8 个模块的 render + 详情弹窗 + 提交/导出）
   函数前缀: render* (Basic/Product/SEO/Competitor/Selling/Audience/Pain/STP) / openDetailModal / submitRequirement
   抽取自 创建需求-上传页面.html line 1868-2509
   ============================================ */

let confirmedModules = new Set();

function showResultPage() {
  // 标记步骤 3 完成
  [1,2].forEach(i => {
    const ind = document.getElementById(`step-indicator-${i}`);
    ind.classList.remove('active');
    ind.classList.add('completed');
  });
  document.getElementById('step-indicator-3').classList.add('active');

  // 隐藏向导，显示结果
  document.getElementById('wizard-main').style.display = 'none';
  const rm = document.getElementById('result-main');
  rm.style.display = 'block';
  rm.classList.add('fade-in-up');
  setTimeout(() => rm.classList.remove('fade-in-up'), 500);

  // 重置状态
  confirmedModules = new Set();


  // 渲染左侧导航
  renderResultNav();

  // 渲染主内容
  renderResultContent();

  // 注册滚动监听
  setupScrollSpy();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  // 持久化视图
  if (typeof saveView === 'function') {
    saveView('result');
    if (typeof saveStep1Form === 'function') saveStep1Form();
  }
}

function renderResultNav() {
  const nav = document.getElementById('result-nav-list');
  nav.innerHTML = RESULT_MODULES.map((m, i) => `
    <li class="result-nav-item ${i === 0 ? 'active' : ''}" data-target="${m.id}" onclick="scrollToModule('${m.id}')">
      <span class="nav-icon">${I(m.iconKey, 14)}</span>
      <span class="nav-label">${m.title}</span>
    </li>
  `).join('');
}

function renderResultContent() {
  const c = document.getElementById('result-content');
  c.innerHTML = RESULT_MODULES.map(m => renderModuleCard(m)).join('');
}

function renderModuleCard(m) {
  let bodyHtml = '';
  switch (m.id) {
    case 'mod-basic':      bodyHtml = renderBasic(); break;
    case 'mod-product':    bodyHtml = renderProduct(); break;
    case 'mod-seo':        bodyHtml = renderSEO(); break;
    case 'mod-competitor': bodyHtml = renderCompetitor(); break;
    case 'mod-selling':    bodyHtml = renderSelling(); break;
    case 'mod-audience':   bodyHtml = renderAudience(); break;
    case 'mod-pain':       bodyHtml = renderPain(); break;
    case 'mod-stp':        bodyHtml = renderSTP(); break;
  }
  const meta = getModuleMeta(m.id);
  return `
    <section class="module-card" id="${m.id}">
      <div class="module-card-header" onclick="toggleModule('${m.id}', event)">
        <div class="module-icon-wrap ${m.iconBg || ''}">${IL(m.iconKey, 18)}</div>
        <div class="module-header-info">
          <div class="module-card-title">${m.title}</div>
          <div class="module-card-meta">
            <span>${m.desc}</span>
            ${meta.map(t => `<span class="module-meta-tag ${t.cls || ''}">${t.text}</span>`).join('')}
          </div>
        </div>
        <div class="module-actions" onclick="event.stopPropagation()">
          <button class="module-collapse-btn" onclick="toggleModule('${m.id}', event)" title="折叠/展开">▼</button>
        </div>
      </div>
      <div class="module-card-body">${bodyHtml}</div>
    </section>
  `;
}

function getModuleMeta(id) {
  switch (id) {
    case 'mod-basic':      return [{ text: `${MOCK_DATA.basic.length} 字段`, cls: 'ok' }];
    case 'mod-product':    return [{ text: `${MOCK_DATA.product.credentials.length} 项资质`, cls: 'ok' }, { text: `${MOCK_DATA.product.indications.length} 个适用病症`, cls: '' }];
    case 'mod-seo': {
      const total = MOCK_DATA.seo.rows.length;
      const strong = MOCK_DATA.seo.rows.filter(r => r.relevance === '强').length;
      return [{ text: `${total} 个关键词`, cls: '' }, { text: `${strong} 个强相关`, cls: 'ok' }];
    }
    case 'mod-competitor': return [{ text: `${MOCK_DATA.competitor.length} 个竞品`, cls: '' }];
    case 'mod-selling': {
      const s = MOCK_DATA.selling;
      return [
        { text: `USP ${s.usp.length}`, cls: 'ok' },
        { text: `KSP ${s.ksp.length}`, cls: 'warn' },
        { text: `OSP ${s.osp.length}`, cls: '' },
      ];
    }
    case 'mod-audience':   return [{ text: '4 项画像', cls: 'ok' }, { text: `${MOCK_DATA.audience.userInfo.length} 项用户信息`, cls: '' }];
    case 'mod-pain':       return [{ text: `${MOCK_DATA.pain.length} 个痛点`, cls: '' }];
    case 'mod-stp':        return [{ text: `${MOCK_DATA.stp.columns.length - 1} 个竞品`, cls: 'ok' }, { text: `${MOCK_DATA.stp.rows.length} 项拼比`, cls: '' }];
    default: return [];
  }
}

// ===== 通用：可编辑字段工具 =====
// path 形如 "basic.0.value" 或 "product.name" / "seo.title"
// 内联可编辑字段渲染：单击编辑，失焦保存

// ===== 1. 基础信息 =====
function renderBasic() {
  return `<div class="info-grid-2">
    ${MOCK_DATA.basic.map((b, i) =>
      `<div class="info-grid-item">
        <div class="label">${b.label}</div>
        <div class="value">${editableField(`basic.${i}.value`, b.value, { cls: 'edit-inline-value' })}</div>
      </div>`
    ).join('')}
  </div>`;
}

// ===== 2. 产品信息 =====
function renderProduct() {
  const p = MOCK_DATA.product;
  return `
    <div class="prod-section">
      <div class="prod-section-label">产品图</div>
      <div class="product-image-wrap">
        <img class="product-image" src="${p.image}" alt="${p.imageAlt || ''}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
        <div class="product-image-fallback" style="display:none;">暂无产品图</div>
        <div class="product-image-cap">${editableField('product.imageAlt', p.imageAlt || '', { cls: 'edit-inline-value' })}</div>
      </div>
    </div>
    <div class="prod-section">
      <div class="prod-section-label">产品定位</div>
      <div class="text-block editable">${editableField('product.positioning', p.positioning, { cls: 'edit-block', multiline: true })}</div>
    </div>
    <div class="prod-section">
      <div class="prod-section-label">产品信用状 <span class="prod-section-hint">(${p.credentials.length} 项)</span></div>
      <table class="compact-table">
        <thead><tr><th style="width:200px;">证书 / 资质</th><th>编号 / 说明</th></tr></thead>
        <tbody>
          ${p.credentials.map((c, i) => `
            <tr>
              <td>${editableField(`product.credentials.${i}.label`, c.label, { cls: 'edit-inline-value' })}</td>
              <td>${editableField(`product.credentials.${i}.value`, c.value, { cls: 'edit-inline-value' })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="prod-section">
      <div class="prod-section-label">适用病症 <span class="prod-section-hint">(${p.indications.length} 项)</span></div>
      <div class="feature-tags">
        ${p.indications.map((it, i) => `
          <span class="feature-tag">
            ${editableField(`product.indications.${i}`, it, { cls: 'edit-tag' })}
          </span>
        `).join('')}
      </div>
    </div>
    <div class="prod-section">
      <div class="prod-section-label">K 好信息字段 <span class="prod-section-hint">(${p.kInfo.length} 项)</span></div>
      <div class="info-grid-2">
        ${p.kInfo.map((k, i) => `
          <div class="info-grid-item">
            <div class="label">${k.label}</div>
            <div class="value">${editableField(`product.kInfo.${i}.value`, k.value, { cls: 'edit-inline-value' })}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ===== 3. SEO 信息 =====
function renderSEO() {
  const s = MOCK_DATA.seo;
  const relevanceCls = (r) => r === '强' ? 'rel-strong' : (r === '中' ? 'rel-mid' : 'rel-weak');
  return `
    <table class="compact-table seo-table">
      <thead>
        <tr>
          <th>SEO</th>
          <th style="width:200px;">Search Frequency Rank</th>
          <th style="width:120px;">相关性</th>
        </tr>
      </thead>
      <tbody>
        ${s.rows.map((r, i) => `
          <tr>
            <td>${editableField(`seo.rows.${i}.keyword`, r.keyword, { cls: 'edit-inline-value' })}</td>
            <td>${editableField(`seo.rows.${i}.rank`, r.rank, { cls: 'edit-inline-value' })}</td>
            <td><span class="rel-pill ${relevanceCls(r.relevance)}">${editableField(`seo.rows.${i}.relevance`, r.relevance, { cls: 'edit-inline-value' })}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

// ===== 4. 竞对信息 =====
function renderCompetitor() {
  return `<div class="competitor-list">
    ${MOCK_DATA.competitor.map((c, i) => `
      <div class="competitor-card">
        <div class="competitor-card-head">
          <div class="competitor-image-wrap">
            <img class="competitor-image" src="${c.image}" alt="${c.brand}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div class="competitor-image-fallback" style="display:none;">无图</div>
          </div>
          <div class="competitor-meta">
            <div class="competitor-brand">
              <span class="competitor-index">竞品 ${i + 1}</span>
              <strong>${editableField(`competitor.${i}.brand`, c.brand, { cls: 'edit-inline-value' })}</strong>
            </div>
            <div class="competitor-asin">
              ASIN：<code>${editableField(`competitor.${i}.asin`, c.asin, { cls: 'edit-inline-value' })}</code>
            </div>
            <div class="competitor-stats">
              <div class="competitor-stat"><div class="label">销售大类排名</div><div class="value">${editableField(`competitor.${i}.rankBig`, c.rankBig, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">销售小类排名</div><div class="value">${editableField(`competitor.${i}.rankSmall`, c.rankSmall, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">总变体销量</div><div class="value">${editableField(`competitor.${i}.totalVariantSales`, c.totalVariantSales, { cls: 'edit-inline-value' })}</div></div>
              <div class="competitor-stat"><div class="label">主体销量</div><div class="value">${editableField(`competitor.${i}.mainSales`, c.mainSales, { cls: 'edit-inline-value' })}</div></div>
            </div>
          </div>
        </div>
        <div class="competitor-section">
          <div class="competitor-section-label">Title</div>
          <div class="text-block editable">${editableField(`competitor.${i}.title`, c.title, { cls: 'edit-block', multiline: true })}</div>
        </div>
        <div class="competitor-section">
          <div class="competitor-section-label">TD <span class="prod-section-hint">(${c.tds.length} 条)</span></div>
          <ol class="competitor-td-list">
            ${c.tds.map((t, ti) => `
              <li>${editableField(`competitor.${i}.tds.${ti}`, t, { cls: 'edit-block', multiline: true })}</li>
            `).join('')}
          </ol>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ===== 5. 卖点信息 =====
function renderSelling() {
  const s = MOCK_DATA.selling;
  const groups = [
    { key: 'usp', code: 'USP', name: '独特卖点', cls: 'sell-usp' },
    { key: 'ksp', code: 'KSP', name: '核心卖点', cls: 'sell-ksp' },
    { key: 'osp', code: 'OSP', name: '补充卖点', cls: 'sell-osp' },
  ];
  return `<div class="sell-groups">
    ${groups.map(g => `
      <div class="sell-group ${g.cls}">
        <div class="sell-group-head">
          <div class="sell-group-badge">${g.code}</div>
          <div class="sell-group-meta">
            <div class="sell-group-name">${g.name} <span class="prod-section-hint">(${s[g.key].length} 条)</span></div>
          </div>
        </div>
        <div class="selling-list">
          ${s[g.key].map((it, i) => `
            <div class="selling-item">
              <div class="selling-num">${String(i+1).padStart(2,'0')}</div>
              <div class="selling-body">
                <div class="selling-row">
                  <span class="selling-title">${editableField(`selling.${g.key}.${i}.title`, it.title, { cls: 'edit-inline-value' })}</span>
                </div>
                <div class="selling-desc">${editableField(`selling.${g.key}.${i}.desc`, it.desc, { cls: 'edit-inline-value', multiline: true })}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ===== 6. 目标人群 =====
function renderAudience() {
  const a = MOCK_DATA.audience;
  return `
    <div class="info-grid-2">
      ${[
        { label: '性别',      path: 'audience.gender',       val: a.gender },
        { label: '年龄',      path: 'audience.age',          val: a.age },
        { label: '社会地位',  path: 'audience.socialStatus', val: a.socialStatus },
        { label: '身份认同',  path: 'audience.identity',     val: a.identity },
      ].map(item =>
        `<div class="info-grid-item">
          <div class="label">${item.label}</div>
          <div class="value">${editableField(item.path, item.val, { cls: 'edit-inline-value', multiline: true })}</div>
        </div>`
      ).join('')}
    </div>
    <div class="prod-section" style="margin-top:16px;">
      <div class="prod-section-label">用户信息 <span class="prod-section-hint">(${a.userInfo.length} 项；如不同记忆棉产品可按身高 / 体重等维度推荐使用人群)</span></div>
      <table class="compact-table">
        <thead><tr><th style="width:160px;">维度</th><th>说明</th></tr></thead>
        <tbody>
          ${a.userInfo.map((u, i) => `
            <tr>
              <td>${editableField(`audience.userInfo.${i}.label`, u.label, { cls: 'edit-inline-value' })}</td>
              <td>${editableField(`audience.userInfo.${i}.value`, u.value, { cls: 'edit-inline-value', multiline: true })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ===== 7. 用户痛点 =====
function renderPain() {
  return `<div class="pain-list pain-list-simple">
    ${MOCK_DATA.pain.map((p, i) => `
      <div class="pain-row">
        <div class="pain-row-num">${i + 1}</div>
        <div class="pain-row-body">
          <div class="pain-row-label">痛点 ${i + 1}</div>
          <div class="pain-row-text">${editableField(`pain.${i}.pain`, p.pain, { cls: 'edit-inline-value', multiline: true })}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ===== 8. 产品 STP（关键拼比表）=====
function renderSTP() {
  const stp = MOCK_DATA.stp;
  return `<div class="stp-compare-wrap">
    <table class="compact-table stp-compare-table">
      <thead>
        <tr>
          <th class="stp-col-key">关键拼比项</th>
          ${stp.columns.map((c, ci) => `
            <th class="${ci === 0 ? 'stp-col-self' : ''}">
              <div class="stp-col-name">${editableField(`stp.columns.${ci}.name`, c.name, { cls: 'edit-inline-value' })}</div>
              ${c.sub ? `<div class="stp-col-sub">${editableField(`stp.columns.${ci}.sub`, c.sub, { cls: 'edit-inline-value' })}</div>` : ''}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="stp-col-key">图片</td>
          ${stp.columns.map((c, ci) => `
            <td class="${ci === 0 ? 'stp-col-self' : ''} stp-img-cell">
              <div class="stp-img-wrap">
                <img class="stp-img" src="${c.image}" alt="${c.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
                <div class="stp-img-fallback" style="display:none;">无图</div>
              </div>
            </td>
          `).join('')}
        </tr>
        ${stp.rows.map((r, ri) => `
          <tr>
            <td class="stp-col-key">${editableField(`stp.rows.${ri}.label`, r.label, { cls: 'edit-inline-value' })}</td>
            ${r.values.map((v, ci) => `
              <td class="${ci === 0 ? 'stp-col-self' : ''}">${editableField(`stp.rows.${ri}.values.${ci}`, v, { cls: 'edit-inline-value' })}</td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

// ===== 结果页交互 =====
function scrollToModule(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // 高亮闪一下
  target.style.transition = 'box-shadow 0.4s ease';
  target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.3)';
  setTimeout(() => { target.style.boxShadow = ''; }, 1200);
}

function setupScrollSpy() {
  const items = document.querySelectorAll('.result-nav-item');
  const sections = RESULT_MODULES.map(m => document.getElementById(m.id));
  const onScroll = () => {
    const offset = 200;
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top <= offset) {
        activeIdx = i;
      }
    }
    items.forEach((it, i) => it.classList.toggle('active', i === activeIdx));
  };
  window.removeEventListener('scroll', window.__resultScroll);
  window.__resultScroll = onScroll;
  window.addEventListener('scroll', onScroll);
}

function toggleModule(id, e) {
  if (e) e.stopPropagation();
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('collapsed');
}

function toggleAllSections() {
  const cards = document.querySelectorAll('.module-card');
  const allCollapsed = Array.from(cards).every(c => c.classList.contains('collapsed'));
  cards.forEach(c => c.classList.toggle('collapsed', !allCollapsed));
  document.getElementById('toggle-all-text').textContent = allCollapsed ? '折叠全部' : '展开全部';
}

function confirmModule(id) {
  const btn = document.getElementById(`confirm-${id}`);
  const card = document.getElementById(id);
  if (confirmedModules.has(id)) {
    confirmedModules.delete(id);
    if (btn)  btn.classList.remove('confirmed');
    if (card) card.classList.remove('confirmed');
    showToast('已取消确认', 'warning');
  } else {
    confirmedModules.add(id);
    if (btn)  btn.classList.add('confirmed');
    if (card) card.classList.add('confirmed');
    showToast('已确认采纳', 'success');
  }
}

function copyModule(id) {
  const m = RESULT_MODULES.find(x => x.id === id);
  showToast(`「${m ? m.title : '内容'}」已复制到剪贴板`, 'success');
  try { navigator.clipboard.writeText(`【${m.title}】内容`); } catch (e) {}
}


function regenerateModule(id) {
  const m = RESULT_MODULES.find(x => x.id === id);
  showToast(`正在重新生成「${m.title}」...`, 'success');
  const card = document.getElementById(id);
  if (card) {
    card.style.opacity = '0.5';
    setTimeout(() => {
      card.style.opacity = '1';
      showToast(`「${m.title}」已重新生成`, 'success');
    }, 1500);
  }
}

function previewImage(name) {
  showToast(`预览图片：${name}`, 'success');
}

// ===== 详情弹窗 =====
let modalCurrentContent = '';
function openDetailModal(id) {
  const m = RESULT_MODULES.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-subtitle').textContent = m.desc;
  let html = '';
  let copyText = '';
  switch (id) {
    case 'mod-basic':
      html = `<table class="compact-table"><tbody>
        ${MOCK_DATA.basic.map(b => `<tr><td style="width:40%;color:var(--text-muted);">${b.label}</td><td><strong>${b.value}</strong></td></tr>`).join('')}
      </tbody></table>`;
      copyText = MOCK_DATA.basic.map(b => `${b.label}: ${b.value}`).join('\n');
      break;
    case 'mod-product': {
      const p = MOCK_DATA.product;
      html = `
        ${p.image ? `<p><img src="${p.image}" alt="${p.imageAlt||''}" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" /></p>` : ''}
        <p style="margin-top:8px;"><strong>产品定位：</strong></p>
        <p style="line-height:1.7;">${p.positioning}</p>
        <p style="margin-top:12px;"><strong>产品信用状：</strong></p>
        <table class="compact-table">
          <tbody>${p.credentials.map(c => `<tr><td style="width:40%;color:var(--text-muted);">${c.label}</td><td>${c.value}</td></tr>`).join('')}</tbody>
        </table>
        <p style="margin-top:12px;"><strong>适用病症：</strong>${p.indications.join('、')}</p>
        <p style="margin-top:12px;"><strong>K 好信息字段：</strong></p>
        <table class="compact-table">
          <tbody>${p.kInfo.map(k => `<tr><td style="width:40%;color:var(--text-muted);">${k.label}</td><td>${k.value}</td></tr>`).join('')}</tbody>
        </table>`;
      copyText = `${p.positioning}\n\n适用病症：${p.indications.join('、')}`;
      break;
    }
    case 'mod-seo': {
      const s = MOCK_DATA.seo;
      html = `<table class="compact-table">
        <thead><tr><th>SEO</th><th style="width:200px;">Search Frequency Rank</th><th style="width:80px;">相关性</th></tr></thead>
        <tbody>
          ${s.rows.map(r => `<tr><td>${r.keyword}</td><td>${r.rank}</td><td>${r.relevance}</td></tr>`).join('')}
        </tbody>
      </table>`;
      copyText = s.rows.map(r => `${r.keyword}\t${r.rank}\t${r.relevance}`).join('\n');
      break;
    }
    case 'mod-competitor':
      html = MOCK_DATA.competitor.map((c, i) => `
        <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--border);">
          <p><strong>竞品 ${i + 1}：${c.brand}</strong> · ASIN: <code>${c.asin}</code></p>
          <p style="margin-top:6px;">大类：${c.rankBig} ｜ 小类：${c.rankSmall}</p>
          <p>总变体销量：${c.totalVariantSales} ｜ 主体销量：${c.mainSales}</p>
          <p style="margin-top:8px;"><strong>Title：</strong>${c.title}</p>
          <p style="margin-top:8px;"><strong>TD：</strong></p>
          <ol style="padding-left:20px;line-height:1.7;">${c.tds.map(t => `<li>${t}</li>`).join('')}</ol>
        </div>
      `).join('');
      break;
    case 'mod-selling': {
      const sd = MOCK_DATA.selling;
      const sec = (label, items) => `
        <p style="margin-top:10px;"><strong style="color:var(--primary);">[${label}]</strong></p>
        ${items.map((s, i) => `<p style="margin:4px 0 6px 12px;"><strong>${i+1}. ${s.title}</strong><br><span style="color:var(--text-muted);">${s.desc}</span></p>`).join('')}
      `;
      html = sec('USP 独特卖点', sd.usp) + sec('KSP 核心卖点', sd.ksp) + sec('OSP 补充卖点', sd.osp);
      break;
    }
    case 'mod-audience': {
      const a = MOCK_DATA.audience;
      html = `
        <p><strong>性别：</strong>${a.gender}</p>
        <p><strong>年龄：</strong>${a.age}</p>
        <p><strong>社会地位：</strong>${a.socialStatus}</p>
        <p><strong>身份认同：</strong>${a.identity}</p>
        <p style="margin-top:10px;"><strong>用户信息：</strong></p>
        <table class="compact-table">
          <tbody>${a.userInfo.map(u => `<tr><td style="width:40%;color:var(--text-muted);">${u.label}</td><td>${u.value}</td></tr>`).join('')}</tbody>
        </table>`;
      break;
    }
    case 'mod-pain':
      html = MOCK_DATA.pain.map((p, i) => `<p style="margin-bottom:8px;"><strong style="color:#ef4444;">痛点 ${i+1}：</strong>${p.pain}</p>`).join('');
      break;
    case 'mod-stp': {
      const s = MOCK_DATA.stp;
      html = `<table class="compact-table">
        <thead><tr><th>关键拼比项</th>${s.columns.map(c => `<th>${c.name}${c.sub ? `<br><small style="color:var(--text-light);">${c.sub}</small>` : ''}</th>`).join('')}</tr></thead>
        <tbody>${s.rows.map(r => `<tr><td>${r.label}</td>${r.values.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
      break;
    }
    default:
      html = `<p style="color:var(--text-muted);">该模块的详细预览（${m.title}）...</p>`;
  }
  modalCurrentContent = copyText || m.title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.add('show');
}

function closeDetailModal(e) {
  if (e && e.target.id !== 'detail-modal') return;
  document.getElementById('detail-modal').classList.remove('show');
}

function copyModalContent() {
  showToast('内容已复制', 'success');
  try { navigator.clipboard.writeText(modalCurrentContent || '内容已复制'); } catch (e) {}
}

// ===== 结果页操作 =====
function backToWizard() {
  document.getElementById('result-main').style.display = 'none';
  document.getElementById('wizard-main').style.display = 'block';
  setStep(2);
  if (window.__resultScroll) window.removeEventListener('scroll', window.__resultScroll);
}

function exportResult() {
  showToast('结果导出中... (Excel + 图片打包)', 'success');
  setTimeout(() => showToast('已导出至下载文件夹', 'success'), 1200);
}

function submitRequirement() {
  const num = confirmedModules.size;
  const total = RESULT_MODULES.length;
  if (num === 0) {
    if (!confirm(`您还未确认任何模块，是否直接提交全部 ${total} 个模块？`)) return;
  } else if (num < total) {
    if (!confirm(`已确认 ${num}/${total} 个模块，未确认的部分将按默认采纳，是否继续提交？`)) return;
  }
  showToast('需求已提交，进入排期队列', 'success');
  setTimeout(() => showToast('系统将在工作日内完成处理', 'success'), 1000);
}

// ===== 重置 =====
function resetStep1() {
  // 重置需求类型选择器
  currentStage = 'new';
  currentBiz = null;
  currentSub = null;
  document.querySelectorAll('.stage-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.stage === 'new')
  );
  renderBizGrid();
  renderSubGrid();
  syncReqType();
  document.getElementById('req-type-error').classList.remove('show');

  ['site','subcategory','delivery-date','product-launch-date'].forEach(id => {
    document.getElementById(id).value = '';
    clearError(document.getElementById(id));
  });
  // 重置 SKU 选择器
  skuList = [];
  skuPool = [];
  skuSearchQuery = '';
  const search = document.getElementById('sku-search');
  if (search) search.value = '';
  const trigger = document.getElementById('sku-trigger');
  trigger.disabled = true;
  trigger.style.borderColor = '';
  closeSkuDropdown();
  document.getElementById('sku-pool-total').textContent = '0';
  renderSkuTrigger();
  renderSkuChips();
  renderSkuOptions();
}

function clearUpload() {
  clearAllFeishuLinks();
  removeFile();
}

// ===== 工具函数 =====
function updateCharCount(el, countId) {
  document.getElementById(countId).textContent = el.value.length;
}

function goBack() {
  goToList();
}

// ============================================
// ===== 列表页相关 =====
// ============================================

// 现代线性图标库（Lucide 风格，stroke 1.6）
