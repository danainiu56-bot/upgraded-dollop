/**
 * 工作台 -- 需求量趋势图
 *
 * - 状态机 wbTrendState：metric / split / chart
 * - 取数走 getTrendSeries(wbState, opts)（依赖 workbench-mock.js）
 * - 纯 SVG 渲染：折线 / 堆叠柱
 * - 子控件用事件委托，绑一次即可（initWbTrendCtrls）
 */

const wbTrendState = {
  metric: 'total',  // total / completed / overdue
  split: 'none',    // none / bu / type
  chart: 'line',    // line / bar
};

const WB_CHART_COLORS = ['#6366f1', '#f97316', '#14b8a6', '#8b5cf6', '#0ea5e9', '#ef4444', '#10b981', '#f59e0b'];

let wbTrendCtrlsBound = false;

function initWbTrendCtrls() {
  if (wbTrendCtrlsBound) return;
  const panel = document.getElementById('wb-trend-panel');
  if (!panel) return;
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const group = btn.closest('[data-role]');
    if (!group) return;
    const role = group.getAttribute('data-role');
    const value = btn.getAttribute('data-v');
    if (!role || !value) return;
    if (role === 'metric') wbTrendState.metric = value;
    else if (role === 'split') wbTrendState.split = value;
    else if (role === 'chart') wbTrendState.chart = value;
    group.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    renderWbTrend();
  });
  wbTrendCtrlsBound = true;
}

function renderWbTrend() {
  initWbTrendCtrls();
  const svg = document.getElementById('wb-trend-svg');
  const legend = document.getElementById('wb-trend-legend');
  const subtitle = document.getElementById('wb-trend-subtitle');
  if (!svg || !legend) return;
  if (typeof getTrendSeries !== 'function' || typeof wbState === 'undefined') return;

  const data = getTrendSeries(wbState, { metric: wbTrendState.metric, splitBy: wbTrendState.split });
  if (subtitle) {
    const metricLabel = (typeof getMetricLabel === 'function') ? getMetricLabel(wbTrendState.metric) : wbTrendState.metric;
    const splitLabel = ({ none: '不拆分', bu: '按 BU', type: '按需求类型' })[wbTrendState.split];
    const granLabel = ({ month: '当年 12 个月', quarter: '近 8 个季度', year: '全部年份' })[wbState.granularity];
    subtitle.textContent = `${metricLabel} · ${splitLabel} · ${granLabel}`;
  }

  // 拆分 + 折线 / 堆叠柱 联动决策：
  //   - split=none + chart=bar：用单系列柱状图（非堆叠，每根柱独立颜色）
  //   - split=bu/type + chart=line：多条折线
  //   - split=bu/type + chart=bar：堆叠柱
  drawSvgChart(svg, data);
  drawLegend(legend, data);
}

function drawLegend(el, data) {
  if (data.series.length <= 1 && wbTrendState.split === 'none') {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = data.series.map((s, i) => {
    const color = WB_CHART_COLORS[i % WB_CHART_COLORS.length];
    return `<span class="wb-legend-item"><i style="background:${color}"></i>${s.name}</span>`;
  }).join('');
}

function drawSvgChart(svg, data) {
  // 视图盒：固定 viewBox，宽自适应
  const W = 760, H = 280;
  const padL = 44, padR = 16, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  const { xLabels, series } = data;
  if (!xLabels.length) return;

  const isStacked = wbTrendState.chart === 'bar' && wbTrendState.split !== 'none';

  // 计算 Y 轴最大值
  let maxY = 0;
  if (isStacked) {
    for (let i = 0; i < xLabels.length; i++) {
      const sum = series.reduce((acc, s) => acc + (s.values[i] || 0), 0);
      if (sum > maxY) maxY = sum;
    }
  } else {
    series.forEach(s => s.values.forEach(v => { if (v > maxY) maxY = v; }));
  }
  if (maxY === 0) maxY = 10;
  // 取整向上到 5 的倍数
  maxY = Math.ceil(maxY / 5) * 5;

  // ---- 网格线 + Y 轴刻度 ----
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = padT + innerH - (innerH * i / yTicks);
    const v = Math.round(maxY * i / yTicks);
    appendSvg(svg, 'line', {
      x1: padL, y1: y, x2: padL + innerW, y2: y,
      stroke: '#e5e7eb', 'stroke-dasharray': i === 0 ? '0' : '3,3', 'stroke-width': i === 0 ? 1 : 1,
    });
    appendSvg(svg, 'text', {
      x: padL - 8, y: y + 4,
      'text-anchor': 'end', fill: '#94a3b8', 'font-size': 11,
    }, String(v));
  }

  // ---- X 轴标签 + tick ----
  const N = xLabels.length;
  const stepX = innerW / Math.max(1, N - (wbTrendState.chart === 'bar' ? 0 : 1));
  // 柱状图把 X 当作"分组中心"
  const xPos = (i) => {
    if (wbTrendState.chart === 'bar') {
      const slot = innerW / N;
      return padL + slot * (i + 0.5);
    }
    return padL + stepX * i;
  };
  xLabels.forEach((label, i) => {
    const x = xPos(i);
    appendSvg(svg, 'text', {
      x, y: H - 8, 'text-anchor': 'middle', fill: '#64748b', 'font-size': 11,
    }, label);
  });

  // ---- 渲染数据 ----
  if (wbTrendState.chart === 'line') {
    series.forEach((s, sIdx) => {
      const color = WB_CHART_COLORS[sIdx % WB_CHART_COLORS.length];
      const pts = s.values.map((v, i) => {
        const x = xPos(i);
        const y = padT + innerH - (innerH * (v / maxY));
        return { x, y, v };
      });
      // 线
      const dStr = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
      appendSvg(svg, 'path', {
        d: dStr, stroke: color, 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round',
      });
      // 圆点
      pts.forEach((p, i) => {
        const c = appendSvg(svg, 'circle', {
          cx: p.x, cy: p.y, r: 3.5, fill: '#fff', stroke: color, 'stroke-width': 2,
          'data-tip': `${s.name} · ${xLabels[i]}：${p.v}`,
        });
        c.setAttribute('class', 'wb-trend-dot');
      });
    });
  } else {
    // 柱状（含堆叠）
    const slot = innerW / N;
    const barW = Math.min(28, slot * 0.6);
    if (!isStacked) {
      // 单系列柱状（split=none），每个柱用主色
      const s = series[0];
      const color = WB_CHART_COLORS[0];
      s.values.forEach((v, i) => {
        const x = xPos(i) - barW / 2;
        const h = innerH * (v / maxY);
        const y = padT + innerH - h;
        const r = appendSvg(svg, 'rect', {
          x, y, width: barW, height: h, fill: color, rx: 3, ry: 3,
          'data-tip': `${s.name} · ${xLabels[i]}：${v}`,
        });
        r.setAttribute('class', 'wb-trend-bar');
      });
    } else {
      // 堆叠柱：每个 X 位的多 series 累加
      for (let i = 0; i < N; i++) {
        let acc = 0;
        const cx = xPos(i);
        const x = cx - barW / 2;
        series.forEach((s, sIdx) => {
          const v = s.values[i] || 0;
          const h = innerH * (v / maxY);
          const yTop = padT + innerH - innerH * ((acc + v) / maxY);
          const color = WB_CHART_COLORS[sIdx % WB_CHART_COLORS.length];
          const r = appendSvg(svg, 'rect', {
            x, y: yTop, width: barW, height: h, fill: color,
            rx: sIdx === series.length - 1 ? 3 : 0,
            ry: sIdx === series.length - 1 ? 3 : 0,
            'data-tip': `${s.name} · ${xLabels[i]}：${v}`,
          });
          r.setAttribute('class', 'wb-trend-bar');
          acc += v;
        });
      }
    }
  }

  // tooltip 绑定
  bindWbTrendTooltip(svg);
}

function appendSvg(parent, tag, attrs, text) {
  const NS = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  if (text != null) el.textContent = text;
  parent.appendChild(el);
  return el;
}

function bindWbTrendTooltip(svg) {
  const tip = document.getElementById('wb-trend-tooltip');
  if (!tip || svg.dataset.tipBound === 'true') {
    if (!tip) return;
  }
  // 每次重渲染会替换 svg 内容，监听 svg 容器（一次绑定）
  if (svg.dataset.tipBound === 'true') return;
  svg.addEventListener('mousemove', (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.tip) {
      tip.textContent = target.dataset.tip;
      tip.classList.add('show');
      const rect = svg.getBoundingClientRect();
      tip.style.left = (e.clientX - rect.left + 12) + 'px';
      tip.style.top = (e.clientY - rect.top + 12) + 'px';
    } else {
      tip.classList.remove('show');
    }
  });
  svg.addEventListener('mouseleave', () => {
    tip.classList.remove('show');
  });
  svg.dataset.tipBound = 'true';
}

window.renderWbTrend = renderWbTrend;
window.initWbTrendCtrls = initWbTrendCtrls;
