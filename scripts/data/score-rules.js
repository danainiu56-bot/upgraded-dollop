/* ============================================
   AI 评测打分规则
   抽取自 创建需求-上传页面.html
   ============================================ */

const SCORE_RULES = [
  { key: 'title',     name: 'Title 标准',   weight: 20, ideal: 'Title 长度 150-200 字符，自然融入 3-5 个高热关键词' },
  { key: 'keyword',   name: '关键词覆盖',   weight: 18, ideal: '覆盖 ≥ 3 个高热词，长尾词分布均匀，无堆砌' },
  { key: 'selling',   name: '卖点完整度',   weight: 18, ideal: '5 段 TD 覆盖 USP/KSP/OSP，差异化清晰' },
  { key: 'geo',       name: 'GEO 本地化',   weight: 16, ideal: '符合目标站点语言习惯、文化语境、搜索意图和合规敏感表达要求' },
  { key: 'compliance',name: '合规性',       weight: 16, ideal: '不含 Amazon 违禁词、FDA 风险声明，无医疗承诺' },
  { key: 'readable',  name: '可读性',       weight: 12, ideal: '句长 12-25 词，每段以 ALL CAPS 标签开头，老年友好' },
];

