/* ============================================
   AI 对话页 - Skills + Tools + 欢迎示例
   抽取自 创建需求-上传页面.html
   ============================================ */

const AI_SKILLS = [
  { id: 'package',  name: '包装盒',         iconKey: 'package', desc: '包装盒外观与结构文案（卖点 / 合规 / 多语言）' },
  { id: 'manual',   name: '说明书',         iconKey: 'manual',  desc: '电子或纸质说明书，含使用步骤与安全提示' },
  { id: 'listing',  name: 'Listing 图片文案', iconKey: 'image',   desc: '主图 / 副图 / A+ 模块的标注与卖点提炼' },
  { id: 'video',    name: '视频脚本文案',    iconKey: 'video',   desc: '产品演示 / 短视频 / TVC 脚本，含分镜与口播' },
  { id: 'titletd',  name: 'Title TD',       iconKey: 'titletd', desc: '电商 Title + Description 一体化生成' },
  { id: 'faq',      name: 'FAQ',           iconKey: 'faq',     desc: '常见问题与回答（Q&A），覆盖售前售后' },
  { id: 'ad',       name: '广告创意',       iconKey: 'ad',      desc: '广告素材创意：Headline / Body / CTA' },
  { id: 'grass',    name: '种草文案',       iconKey: 'grass',   desc: '社媒 / 红书 / TikTok 风格种草内容' },
  { id: 'news',     name: '新闻稿',         iconKey: 'news',    desc: '品牌新闻稿 / PR 通稿，含核心事实与引语' },
];

const AI_TOOLS = [
  { id: 'kb',    name: '知识库检索',     iconKey: 'database', color: '#6366f1', desc: '在产品资料、过往爆款、品牌指南中检索' },
  { id: 'comp',  name: '竞品差异分析',   iconKey: 'diff',     color: '#f59e0b', desc: '基于左侧竞品 Title/BP/价格自动找差异点' },
  { id: 'kw',    name: 'SEO 关键词推荐', iconKey: 'search',   color: '#10b981', desc: '调用 Helium10 / Cerebro 接口获取高热词' },
  { id: 'tone',  name: '风格模板',       iconKey: 'palette',  color: '#ec4899', desc: '套用「专业医学 / 温馨家用 / 高性价比」等语气' },
  { id: 'brand', name: '品牌词典',       iconKey: 'tag',      color: '#0ea5e9', desc: '检索品牌专属术语 / 禁用词 / 必用词' },
  { id: 'check', name: '违禁词检查',     iconKey: 'shieldX',  color: '#ef4444', desc: 'FDA / Amazon ToS 违禁词扫描' },
];

const AI_WELCOME_EXAMPLES = [
  { icon: '📝', text: '基于左侧产品信息和 SEO 关键词，生成一版 5 段式 BP 文案' },
  { icon: '✍️', text: '改写产品标题，自然嵌入 3 个高热 SEO 关键词' },
  { icon: '🆚', text: '列出竞品 A/B/C 的核心差异，并给出我们的应对话术' },
  { icon: '🎨', text: '用「专业医学 + 温馨家用」双语气重写产品描述' },
  { icon: '🅰️', text: '生成一段 80 字内的产品概述，用于 A+ Hero 模块' },
  { icon: '⚠️', text: '检查当前文案中的 Amazon 违禁词与 FDA 合规风险' },
];

