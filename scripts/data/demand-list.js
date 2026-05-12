/* ============================================
   需求管理列表 mock 数据
   抽取自 创建需求-上传页面.html
   ============================================ */

const LIST_DATA = [
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '药盒', name: '7格便携药盒',     sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '处理中', submit_time: '2026/02/08 09:32:14', launch_date: '2026/02/20', date: '2026/02/12' },
  { type: '老品Title',   site: 'US', brand: 'AUVON', sub: '药盒', name: '7格大容量粉色',   sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '待审核', submit_time: '2026/02/08 10:15:42', date: '2026/02/12' },
  { type: '老品TD',      site: 'US', brand: 'AUVON', sub: '药盒', name: '透明外壳药盒',     sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '已通过', submit_time: '2026/02/08 11:48:09', date: '2026/02/12' },
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '电疗', name: '伤口贴10pack',    sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '已完成', submit_time: '2026/02/07 14:20:33', launch_date: '2026/02/22', date: '2026/02/12' },
  { type: '新品FAQ',     site: 'US', brand: 'AUVON', sub: '贴片', name: '针形贴片20pack',  sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '处理中', submit_time: '2026/02/09 08:55:21', date: '2026/02/12' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '银色TENS套装',    sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '已驳回', submit_time: '2026/02/09 13:42:08', launch_date: '2026/02/23', date: '2026/02/12' },
  { type: '新品FAQ',     site: 'US', brand: 'ZIKEE', sub: '贴片', name: '医疗款TENS套装',  sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '待审核', submit_time: '2026/02/09 16:08:52', date: '2026/02/12' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '背光小夜灯',       sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '处理中', submit_time: '2026/02/10 09:18:37', launch_date: '2026/02/25', date: '2026/02/12' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '黑色外壳药盒',     sku: 'PO17X4011', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '已通过', submit_time: '2026/02/10 11:25:46', launch_date: '2026/02/26', date: '2026/02/12' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '背光小夜灯',       sku: 'PO17X4011', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '已完成', submit_time: '2026/02/10 14:50:11', launch_date: '2026/02/27', date: '2026/02/12' },
  { type: '新品卖点视频', site: 'UK', brand: 'AUVON', sub: '药盒', name: '7格旅行药盒',   sku: 'PO19A2210', bu: '物理治疗', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  status: '待审核', submit_time: '2026/02/11 08:42:55', date: '2026/02/14' },
  { type: '老品TD',       site: 'UK', brand: 'ZIKEE', sub: '电疗', name: '理疗仪豪华版',   sku: 'PO19B5621', bu: '北美市场', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  status: '已驳回', submit_time: '2026/02/11 15:33:04', date: '2026/02/14' },
];

function buildFinalCopyDraft(row) {
  const name = row.name || '产品';
  const brand = row.brand || 'AUVON';
  const site = row.site || 'US';

  function listingDraft() {
    const content = `【Title】
${brand} ${name}, Weekly Pill Organizer, Portable Daily Storage Case for Vitamins, Medicine and Supplements

【TD-1】
围绕用户最关心的日常收纳场景，突出容量、便携和清晰分区，让用户第一眼理解产品解决的问题。

【TD-2】
采用安全材质与稳固结构，适合维生素、鱼油、日常药片等多种补剂和药品的分类收纳。

【TD-3】
便携尺寸适合居家、办公和旅行多场景使用，帮助用户保持规律的每日健康管理习惯。

【TD-4】
清晰标签与易开启设计提升中老年用户的使用友好度，降低漏服、重服和混放的风险。

【TD-5】
${brand} 品牌包装完整，附带说明与售后支持，适合作为家庭健康管理或关怀礼品。`;
    const htmlContent = `<div class="copy-draft-listing-points">${content.split(/\n\n/).map(sec => {
      const m = sec.match(/^【(.+?)】\n?([\s\S]*)$/);
      if (!m) return `<div class="copy-draft-listing-point"><div class="listing-point-text">${sec}</div></div>`;
      return `<div class="copy-draft-listing-point"><span class="listing-point-tag">${m[1]}</span><div class="listing-point-text">${m[2].trim()}</div></div>`;
    }).join('')}</div>`;
    return { title: 'SEO 覆盖版', tag: '审核通过定稿', score: 92, type: row.type, content, htmlContent };
  }

  function imageDraft() {
    const cn = ['一', '二', '三', '四', '五', '六', '七'];
    const points = [
      ['大容量分区', '展示 7 天分区与药片容量，让用户快速理解一周用药管理价值。'],
      ['便携防洒', '突出卡扣闭合和包内携带场景，回应用户担心药片洒出的顾虑。'],
      ['品牌专业感', `展示 ${brand} logo 与低饱和产品质感，建立专业可信的第一印象。`],
      ['老人友好', '强调清晰标签、易开启结构和高对比识别，适合中老年日常使用。'],
      ['多场景使用', '通过居家、办公、旅行场景延展购买理由。'],
      ['材质安全', '突出 BPA-Free 食品级材质，适合长期接触药片和补剂。'],
      ['包装完整', '展示产品、说明卡、售后卡和品牌包装，提升交付完整感。'],
    ];
    const content = points.map((p, i) => `图片${cn[i]}：${p[0]}\n${p[1]}`).join('\n\n');
    const htmlContent = `<div class="copy-draft-img-points">${points.map((p, i) => `<div class="copy-draft-img-point"><span class="img-point-idx">图片${cn[i]}</span><div class="img-point-body"><div class="img-point-label">${p[0]}</div><div class="img-point-text">${p[1]}</div></div></div>`).join('')}</div>`;
    return { title: '转化导向版', tag: '审核通过定稿', score: 90, type: row.type, content, htmlContent };
  }

  function videoDraft() {
    const rows = [
      ['01', '一周用药清晰规划', '俯拍打开药盒，展示 7 天分区和已放好的药片。', '一周用药，提前规划，每一天都清清楚楚。', 'Plan your week ahead — every day, clearly organized.'],
      ['02', '大容量分格', '手部依次放入维生素、鱼油和日常药片。', '维生素、鱼油、日常药片，一格也能稳稳收纳。', 'Vitamins, fish oil, daily meds — one spacious slot holds them all.'],
      ['03', '防洒便携', '合上卡扣后放入包中并轻晃，打开后药片仍整齐。', '放进包里也安心，出门携带不怕散乱。', 'Snap-lock keeps pills in place on the go.'],
      ['04', '老人友好', '老人或手模轻松打开盖子，扫过清晰标签。', '清晰分区，轻松打开，家人使用更省心。', 'Easy-open design with clear labels.'],
      ['05', '材质安全', '材质 close-up 与 BPA-Free 字幕。', 'BPA-Free 材质，适合日常药片和补剂收纳。', 'BPA-Free material for daily storage.'],
      ['06', '场景适配', '床头、办公桌、旅行包三场景切换。', '居家、办公、旅行，一盒满足多场景用药管理。', 'Home, office, travel — one organizer for every scenario.'],
      ['07', '品牌可信', `${brand} logo、包装、说明卡和售后卡依次入镜。`, `${brand} 品牌品质，让日常收纳更有保障。`, `${brand} quality you can trust.`],
    ];
    const content = rows.map(r => `${r[0]}. ${r[1]}\n画面：${r[2]}\n中文：${r[3]}\n英文：${r[4]}`).join('\n\n');
    const htmlContent = `<table class="copy-draft-video-table"><thead><tr><th>序号</th><th>卖点</th><th>画面展示</th><th>中文文案</th><th>英文文案</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('')}</tbody></table>`;
    return { title: '转化导向版', tag: '审核通过定稿', score: 91, type: row.type, content, htmlContent };
  }

  function faqDraft() {
    const qas = [
      ['What is the product made of?', 'It is made from food-grade, BPA-free material suitable for daily pill and supplement storage.'],
      ['Can it hold large vitamins?', 'Yes. The compartments are designed to hold common vitamins, fish oil capsules and daily medications.'],
      ['Will pills spill in my bag?', 'The snap-lock structure helps keep pills securely stored during commuting or travel.'],
      ['Is it easy for seniors to use?', 'Clear labels and an easy-open design make it friendly for seniors and caregivers.'],
      ['Does it include after-sales support?', `${brand} packaging includes support information for warranty and after-sales service.`],
    ];
    const content = qas.map((qa, i) => `Q${i + 1}: ${qa[0]}\nA${i + 1}: ${qa[1]}`).join('\n\n');
    const htmlContent = `<div class="copy-draft-faq-list">${qas.map((qa, i) => `<div class="copy-draft-faq-item"><div class="faq-item-q"><span class="faq-item-idx">Q${i + 1}</span>${qa[0]}</div><div class="faq-item-a"><span class="faq-item-idx ans">A${i + 1}</span>${qa[1]}</div></div>`).join('')}</div>`;
    return { title: '转化导向版', tag: '审核通过定稿', score: 90, type: row.type, content, htmlContent };
  }

  if (row.type === '新品图片文案') return imageDraft();
  if (row.type === '新品卖点视频') return videoDraft();
  if (row.type === '新品FAQ') return faqDraft();
  return listingDraft();
}

LIST_DATA.forEach(row => {
  if (row.status === '已完成' && !row.finalCopy) row.finalCopy = buildFinalCopyDraft(row);
});

