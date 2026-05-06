/* ============================================
   文案管理列表 mock 数据 + 状态样式映射
   抽取自 创建需求-上传页面.html
   ============================================ */

const COPY_LIST_DATA = [
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '药盒', name: '7格弹跳药盒',     sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '待审核', date: '2026/02/12', submit_time: '2026/02/08 09:32:14', review_time: '—' },
  { type: '老品Title',    site: 'US', brand: 'AUVON', sub: '药盒', name: '7格大容量粉色',    sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '待审核', date: '2026/02/12', submit_time: '2026/02/08 10:15:42', review_time: '—' },
  { type: '老品TD',       site: 'US', brand: 'AUVON', sub: '药盒', name: '透明外壳药盒',     sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '已通过', date: '2026/02/12', submit_time: '2026/02/08 11:48:09', review_time: '2026/02/09 09:25:33' },
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '电疗', name: '伤口贴 10pack',    sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '待处理', date: '2026/02/12', submit_time: '2026/02/07 14:20:33', review_time: '—' },
  { type: '新品Listing', site: 'US', brand: 'AUVON', sub: '贴片', name: '针形贴片 20pack',  sku: 'PO17X4011', bu: '物理治疗', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '待处理', date: '2026/02/12', submit_time: '2026/02/09 08:55:21', review_time: '—' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '银色 TENS 套装',   sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Jessi', writer: 'Yumi',  status: '已驳回', date: '2026/02/12', submit_time: '2026/02/09 13:42:08', review_time: '2026/02/10 10:08:55' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '医疗款 TENS',      sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '待审核', date: '2026/02/12', submit_time: '2026/02/09 16:08:52', review_time: '—' },
  { type: '新品Listing', site: 'US', brand: 'ZIKEE', sub: '贴片', name: '背光小夜灯',       sku: 'PO17X4011', bu: '北美市场', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '待处理', date: '2026/02/12', submit_time: '2026/02/10 09:18:37', review_time: '—' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '黑色外壳药盒',     sku: 'PO17X4011', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '已通过', date: '2026/02/12', submit_time: '2026/02/10 11:25:46', review_time: '2026/02/11 14:32:08' },
  { type: '新品Listing', site: 'US', brand: 'AMOOS', sub: '贴片', name: '背光小夜灯',       sku: 'PO17X4011', bu: '家居关怀', bu_lead: 'Suki', op: 'Liz',   writer: 'Brian', status: '已通过', date: '2026/02/12', submit_time: '2026/02/10 14:50:11', review_time: '2026/02/11 16:18:49' },
  { type: '老品Title TD', site: 'UK', brand: 'AUVON', sub: '药盒', name: '7格旅行药盒（粉色）',  sku: 'PO19A2210', bu: '物理治疗', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  status: '待处理', date: '2026/02/14', submit_time: '2026/02/11 08:42:55', review_time: '—' },
  { type: '老品TD',       site: 'UK', brand: 'ZIKEE', sub: '电疗', name: '理疗仪豪华版',          sku: 'PO19B5621', bu: '北美市场', bu_lead: 'Suki', op: 'Tina',  writer: 'Lucy',  status: '已驳回', date: '2026/02/14', submit_time: '2026/02/11 15:33:04', review_time: '2026/02/12 09:48:21' },
  { type: '新品Title',    site: 'DE', brand: 'AMOOS', sub: '夜灯', name: '玫瑰金小夜灯（暖光）',  sku: 'PO20A1101', bu: '家居关怀', bu_lead: 'Suki', op: 'Sam',   writer: 'Mike',  status: '待审核', date: '2026/02/15', submit_time: '2026/02/12 10:08:36', review_time: '—' },
];

const CF_STATUS_CLS = {
  '待处理': 'status-doing',
  '待审核': 'status-review',
  '已驳回': 'status-reject',
  '已通过': 'status-pass',
};

