/**
 * 工作台 mock 数据 + 聚合函数
 *
 * 设计：
 * - 一份月级 mock（2025-01 ~ 2026-12 共 24 个月），数据通过种子函数生成，2026-05 用基线手填以保持当前视觉一致
 * - getWorkbenchData(state) 根据 granularity (month/quarter/year) + year + month/quarter 返回聚合后的看板数据
 * - getTrendSeries(state, opts) 根据当前粒度 + 趋势子控件状态（metric / splitBy）返回时间序列
 *
 * 不引入图表库，纯数据。
 */

const WB_BU_LIST = ['物理治疗', '慢病耗材', '家居关怀', '北美市场', '健康家访'];
const WB_BU_HINT = {
  '物理治疗': '新品 Listing 集中，关注审核排期',
  '慢病耗材': '资料缺失较多，先补齐输入质量',
  '家居关怀': '图片文案积压，建议协调生成资源',
  '北美市场': '新品占比高，需提前锁定开卖节奏',
  '健康家访': '交付稳定，保持当前节奏',
};

const WB_TYPE_LIST = ['新品 Listing', 'Listing 图片文案', '说明书', '视频脚本文案', 'FAQ'];
const WB_TYPE_HINT = {
  '新品 Listing': '关联开卖时间，需提前预警',
  'Listing 图片文案': '风险最高，优先看审核队列',
  '说明书': '资料完整性影响交付质量',
  '视频脚本文案': '生成周期偏长，关注产能占用',
  'FAQ': '低风险，可作为弹性承接类型',
};
const WB_TYPE_BU_MATCH = {
  '新品 Listing': '物理治疗,北美市场',
  'Listing 图片文案': '家居关怀,北美市场',
  '说明书': '慢病耗材,物理治疗',
  '视频脚本文案': '家居关怀,慢病耗材',
  'FAQ': '健康家访,家居关怀',
};

const WB_TEAM_LIST = ['Mason', 'Yumi', 'Brian', 'Suki'];
const WB_TEAM_HINT = {
  Mason: '高负载，少接急单',
  Yumi: '可承接 FAQ',
  Brian: '一稿偏低，暂缓复杂需求',
  Suki: '可承接慢病耗材',
};

const WB_QUALITY_LIST = ['信息错误', '因果链不完整', '卖点表达不清', 'GEO/本地化不匹配', 'SEO 覆盖不足'];

// 简单可重复的伪随机：基于种子的线性同余
function wbSeedRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 一个月条目结构
function buildMonthly(year, month) {
  const seed = year * 100 + month;
  // total 在 60-100 间波动
  const total = 60 + Math.floor(wbSeedRand(seed) * 35);
  const completed = Math.round(total * (0.6 + wbSeedRand(seed + 1) * 0.2));
  const overdue = Math.round(total * (0.02 + wbSeedRand(seed + 2) * 0.06));
  const willOverdue = Math.round(total * (0.06 + wbSeedRand(seed + 3) * 0.08));

  // BU 分配（百分比和约 100%）
  const buShare = [0.30, 0.21, 0.20, 0.16, 0.13];
  const bu = {};
  const buRisk = {};
  WB_BU_LIST.forEach((name, i) => {
    const v = Math.max(2, Math.round(total * buShare[i] * (0.85 + wbSeedRand(seed + i + 10) * 0.3)));
    bu[name] = v;
    const dangerCnt = Math.round(v * (0.04 + wbSeedRand(seed + i + 20) * 0.08));
    const warnCnt = Math.round(v * (0.10 + wbSeedRand(seed + i + 30) * 0.15));
    buRisk[name] = { warn: warnCnt, danger: dangerCnt };
  });

  // 类型分配
  const typeShare = [0.28, 0.16, 0.10, 0.08, 0.07];
  const type = {};
  const typeRisk = {};
  WB_TYPE_LIST.forEach((name, i) => {
    const v = Math.max(2, Math.round(total * typeShare[i] * (0.85 + wbSeedRand(seed + i + 50) * 0.3)));
    type[name] = v;
    const dangerCnt = Math.round(v * (0.05 + wbSeedRand(seed + i + 60) * 0.1));
    const warnCnt = Math.round(v * (0.12 + wbSeedRand(seed + i + 70) * 0.15));
    typeRisk[name] = { warn: warnCnt, danger: dangerCnt };
  });

  // 人员
  const teamBase = {
    Mason: { grammar: 0.98, draft: 0.88, ai: 0.80, status: '高负载' },
    Yumi:  { grammar: 0.97, draft: 0.84, ai: 0.76, status: '正常' },
    Brian: { grammar: 0.94, draft: 0.76, ai: 0.68, status: '需关注' },
    Suki:  { grammar: 0.96, draft: 0.82, ai: 0.74, status: '可承接' },
  };
  const teamLoadShare = { Mason: 0.21, Yumi: 0.18, Brian: 0.14, Suki: 0.12 };
  const team = WB_TEAM_LIST.map((name, i) => {
    const base = teamBase[name];
    const drift = (wbSeedRand(seed + i + 100) - 0.5) * 0.02;
    return {
      name,
      grammar: Math.min(0.999, Math.max(0.85, base.grammar + drift)),
      draft: Math.min(0.99, Math.max(0.5, base.draft + drift * 2)),
      ai: Math.min(0.99, Math.max(0.5, base.ai + drift * 2)),
      load: Math.max(4, Math.round(total * teamLoadShare[name])),
      status: base.status,
    };
  });

  // 质量分布（百分比和 = 100）
  const qpct = [38, 24, 18, 12, 8].map((v, i) => Math.max(2, v + Math.round((wbSeedRand(seed + i + 200) - 0.5) * 6)));
  const qsum = qpct.reduce((a, b) => a + b, 0);
  const quality = WB_QUALITY_LIST.map((label, i) => ({
    label,
    pct: Math.round(qpct[i] * 100 / qsum),
  }));

  // 健康度
  const riskCount = Object.values(buRisk).reduce((acc, r) => acc + r.warn + r.danger, 0);
  let healthStatus = '正常';
  if (overdue >= 3) healthStatus = '需关注';
  if (overdue >= 5) healthStatus = '高风险';

  // 关注项
  const focus = [
    overdue > 0 ? `Listing 图片文案有 ${overdue} 个已逾期，建议优先协调审核资源。` : '近期无逾期需求，节奏稳定。',
    'Brian 一稿通过率低于团队均值，需要复盘需求理解偏差。',
    'Mason 当前负载最高，后续新增需求建议分流给 Suki。',
    'FAQ 与新闻稿交付稳定，可保持当前节奏。',
  ];

  return {
    ym: `${year}-${String(month).padStart(2, '0')}`,
    year, month,
    total, completed, overdue, willOverdue,
    riskCount,
    bu, buRisk,
    type, typeRisk,
    team,
    quality,
    focus,
    health: {
      status: healthStatus,
      summary: '需求量持续上升，整体交付达标，但风险需求高于安全线。建议先处理已逾期需求，并控制 Listing 图片文案积压。',
    },
    kpi: {
      delivery: 0.88 + wbSeedRand(seed + 300) * 0.07,
      draft: 0.78 + wbSeedRand(seed + 301) * 0.10,
      grammar: 0.95 + wbSeedRand(seed + 302) * 0.03,
      ai: 0.70 + wbSeedRand(seed + 303) * 0.10,
    },
  };
}

// 基线月（2026-05）：覆盖原 HTML 中那套数字，保持视觉一致
function applyBaselineMay2026(m) {
  if (m.ym !== '2026-05') return m;
  m.total = 86;
  m.completed = 63;
  m.overdue = 3;
  m.willOverdue = 9;
  m.bu = { '物理治疗': 26, '慢病耗材': 18, '家居关怀': 17, '北美市场': 14, '健康家访': 11 };
  m.buRisk = {
    '物理治疗': { warn: 4, danger: 2 },
    '慢病耗材': { warn: 3, danger: 2 },
    '家居关怀': { warn: 4, danger: 1 },
    '北美市场': { warn: 3, danger: 1 },
    '健康家访': { warn: 2, danger: 0 },
  };
  m.type = { '新品 Listing': 24, 'Listing 图片文案': 13, '说明书': 7, '视频脚本文案': 6, 'FAQ': 5 };
  m.typeRisk = {
    '新品 Listing': { warn: 4, danger: 2 },
    'Listing 图片文案': { warn: 3, danger: 2 },
    '说明书': { warn: 1, danger: 1 },
    '视频脚本文案': { warn: 2, danger: 0 },
    'FAQ': { warn: 1, danger: 0 },
  };
  m.team = [
    { name: 'Mason', grammar: 0.98, draft: 0.88, ai: 0.80, load: 18, status: '高负载' },
    { name: 'Yumi',  grammar: 0.97, draft: 0.84, ai: 0.76, load: 15, status: '正常' },
    { name: 'Brian', grammar: 0.94, draft: 0.76, ai: 0.68, load: 12, status: '需关注' },
    { name: 'Suki',  grammar: 0.96, draft: 0.82, ai: 0.74, load: 10, status: '可承接' },
  ];
  m.quality = [
    { label: '信息错误', pct: 38 },
    { label: '因果链不完整', pct: 24 },
    { label: '卖点表达不清', pct: 18 },
    { label: 'GEO/本地化不匹配', pct: 12 },
    { label: 'SEO 覆盖不足', pct: 8 },
  ];
  m.kpi = { delivery: 0.92, draft: 0.84, grammar: 0.968, ai: 0.76 };
  m.health = {
    status: '需关注',
    summary: '需求量持续上升，整体交付达标，但风险需求高于安全线。建议先处理 3 个已逾期需求，并控制 Listing 图片文案积压。',
  };
  return m;
}

const WB_MONTHLY = (function () {
  const arr = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      arr.push(applyBaselineMay2026(buildMonthly(y, m)));
    }
  }
  return arr;
})();

function wbFindMonth(year, month) {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  return WB_MONTHLY.find(m => m.ym === ym) || null;
}

function wbMonthsInQuarter(year, quarter) {
  const startM = (quarter - 1) * 3 + 1;
  const arr = [];
  for (let m = startM; m < startM + 3; m++) {
    const month = wbFindMonth(year, m);
    if (month) arr.push(month);
  }
  return arr;
}

function wbMonthsInYear(year) {
  return WB_MONTHLY.filter(m => m.year === year);
}

// 聚合一组月数据
function wbAggregateMonths(months) {
  if (!months.length) return null;
  const last = months[months.length - 1];
  const sum = (key) => months.reduce((acc, m) => acc + (m[key] || 0), 0);
  const sumMap = (key) => {
    const out = {};
    months.forEach(m => {
      Object.entries(m[key] || {}).forEach(([k, v]) => {
        out[k] = (out[k] || 0) + v;
      });
    });
    return out;
  };
  const sumRisk = (key) => {
    const out = {};
    months.forEach(m => {
      Object.entries(m[key] || {}).forEach(([k, v]) => {
        if (!out[k]) out[k] = { warn: 0, danger: 0 };
        out[k].warn += v.warn || 0;
        out[k].danger += v.danger || 0;
      });
    });
    return out;
  };
  const avgTeam = () => {
    const map = {};
    months.forEach(m => {
      m.team.forEach(t => {
        if (!map[t.name]) map[t.name] = { name: t.name, grammar: 0, draft: 0, ai: 0, loadAcc: 0, status: t.status, n: 0 };
        const s = map[t.name];
        s.grammar += t.grammar;
        s.draft += t.draft;
        s.ai += t.ai;
        s.loadAcc += t.load;
        s.n++;
      });
    });
    const lastTeam = last.team;
    return WB_TEAM_LIST.map(name => {
      const s = map[name];
      const lastT = lastTeam.find(t => t.name === name) || {};
      return {
        name,
        grammar: s ? s.grammar / s.n : (lastT.grammar || 0),
        draft: s ? s.draft / s.n : (lastT.draft || 0),
        ai: s ? s.ai / s.n : (lastT.ai || 0),
        load: lastT.load || 0,
        status: lastT.status || '正常',
      };
    });
  };
  const total = sum('total');
  const completed = sum('completed');
  const overdue = sum('overdue');
  const willOverdue = sum('willOverdue');
  return {
    ym: months.length === 1 ? last.ym : `${last.ym} 聚合`,
    total, completed, overdue, willOverdue,
    bu: sumMap('bu'),
    buRisk: sumRisk('buRisk'),
    type: sumMap('type'),
    typeRisk: sumRisk('typeRisk'),
    team: avgTeam(),
    quality: last.quality,
    focus: last.focus,
    health: last.health,
    kpi: {
      delivery: months.reduce((a, m) => a + m.kpi.delivery, 0) / months.length,
      draft:    months.reduce((a, m) => a + m.kpi.draft, 0) / months.length,
      grammar:  months.reduce((a, m) => a + m.kpi.grammar, 0) / months.length,
      ai:       months.reduce((a, m) => a + m.kpi.ai, 0) / months.length,
    },
  };
}

// 主聚合函数：根据当前选择返回看板数据
function getWorkbenchData(state) {
  const { granularity, year, month, quarter } = state;
  if (granularity === 'month') {
    const m = wbFindMonth(year, month);
    return m ? Object.assign({}, m) : null;
  }
  if (granularity === 'quarter') {
    return wbAggregateMonths(wbMonthsInQuarter(year, quarter));
  }
  if (granularity === 'year') {
    return wbAggregateMonths(wbMonthsInYear(year));
  }
  return null;
}

/**
 * 趋势序列
 * - granularity=month：返回锚点年份的 1-12 月（如选 2026-5，返回 2026 全 12 月）
 * - granularity=quarter：返回近 8 个季度（含锚点季度，向前数 7 个）
 * - granularity=year：返回 2024/2025/2026 三年（数据不足从 2025 起）
 *
 * metric: 'total' | 'completed' | 'overdue'
 * splitBy: 'none' | 'bu' | 'type'
 */
function getTrendSeries(state, opts) {
  const { granularity, year, quarter } = state;
  const metric = opts.metric || 'total';
  const splitBy = opts.splitBy || 'none';

  // 生成时间桶
  const buckets = [];
  if (granularity === 'month') {
    for (let m = 1; m <= 12; m++) {
      const monthData = wbFindMonth(year, m);
      buckets.push({ label: `${m}月`, agg: monthData ? Object.assign({}, monthData) : null });
    }
  } else if (granularity === 'quarter') {
    // 近 8 个季度
    const list = [];
    let y = year, q = quarter;
    for (let i = 0; i < 8; i++) {
      list.unshift({ y, q });
      q--;
      if (q < 1) { q = 4; y--; }
    }
    list.forEach(({ y, q }) => {
      const months = wbMonthsInQuarter(y, q);
      const agg = months.length ? wbAggregateMonths(months) : null;
      buckets.push({ label: `${y} Q${q}`, agg });
    });
  } else if (granularity === 'year') {
    [2025, 2026].forEach(y => {
      const months = wbMonthsInYear(y);
      const agg = months.length ? wbAggregateMonths(months) : null;
      buckets.push({ label: `${y}年`, agg });
    });
  }

  const xLabels = buckets.map(b => b.label);

  if (splitBy === 'none') {
    const values = buckets.map(b => (b.agg ? (b.agg[metric] || 0) : 0));
    return {
      xLabels,
      series: [{ name: getMetricLabel(metric), values }],
    };
  }

  // 按 BU 或类型拆分
  const isOverdue = metric === 'overdue';
  const keys = splitBy === 'bu' ? WB_BU_LIST : WB_TYPE_LIST;
  const series = keys.map(k => ({
    name: k,
    values: buckets.map(b => {
      if (!b.agg) return 0;
      if (metric === 'total') {
        return (splitBy === 'bu' ? b.agg.bu[k] : b.agg.type[k]) || 0;
      }
      if (metric === 'completed') {
        // 用 total * 完成率近似（按整体 completed/total 比例分配）
        const map = splitBy === 'bu' ? b.agg.bu : b.agg.type;
        const v = map[k] || 0;
        const ratio = b.agg.total ? (b.agg.completed / b.agg.total) : 0;
        return Math.round(v * ratio);
      }
      if (isOverdue) {
        const risk = splitBy === 'bu' ? b.agg.buRisk[k] : b.agg.typeRisk[k];
        return risk ? (risk.danger || 0) : 0;
      }
      return 0;
    }),
  }));

  return { xLabels, series };
}

function getMetricLabel(metric) {
  return ({ total: '需求总量', completed: '完成量', overdue: '逾期数' })[metric] || metric;
}

// 暴露到全局
window.WB_BU_LIST = WB_BU_LIST;
window.WB_BU_HINT = WB_BU_HINT;
window.WB_TYPE_LIST = WB_TYPE_LIST;
window.WB_TYPE_HINT = WB_TYPE_HINT;
window.WB_TYPE_BU_MATCH = WB_TYPE_BU_MATCH;
window.WB_TEAM_LIST = WB_TEAM_LIST;
window.WB_TEAM_HINT = WB_TEAM_HINT;
window.WB_QUALITY_LIST = WB_QUALITY_LIST;
window.WB_MONTHLY = WB_MONTHLY;
window.getWorkbenchData = getWorkbenchData;
window.getTrendSeries = getTrendSeries;
window.getMetricLabel = getMetricLabel;
