/* ============================================
   需求类型 → 输入模板（Excel）字段字典
   每个 sheet 4 列：字段名 / 示例值 / 字段说明 / 是否必填
   ============================================ */

const INPUT_TEMPLATE_HEADERS = ['字段名', '示例值', '字段说明', '是否必填'];

// 复用通用片段，避免重复书写
const _SELLING_GROUP = (label, n, exTitle, exDesc) => {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push({
      label: `${label}${i}-标题`,
      example: i === 1 ? exTitle : '',
      desc: `${label} 第 ${i} 条卖点的简短标题（10 字内）`,
      required: i === 1,
    });
    out.push({
      label: `${label}${i}-描述`,
      example: i === 1 ? exDesc : '',
      desc: `${label} 第 ${i} 条卖点的详细解释（30-80 字）`,
      required: i === 1,
    });
  }
  return out;
};

const _AUDIENCE_PAIN_SHEET = {
  name: '目标人群与痛点',
  rows: [
    { label: '性别比例', example: '女性 60% / 男性 40%', desc: '主要购买/使用者的性别分布', required: false },
    { label: '年龄段', example: '45-75 岁，核心 55-70 岁', desc: '目标用户主要年龄区间', required: true },
    { label: '社会地位', example: '中产家庭，年收入 $50k-$120k', desc: '收入水平 / 家庭结构 / 职业', required: false },
    { label: '身份认同', example: '慢病自管者 / 家庭照护者', desc: '用户自我认同的标签', required: false },
    { label: '推荐使用人群', example: '长期服用 ≥3 种药物的慢病人群', desc: '正向人群描述', required: true },
    { label: '不推荐使用人群', example: '需要液体/冷藏药品的用户', desc: '反向人群（避免误用）', required: false },
    { label: '使用频次', example: '每日 1-4 次取药，每周 1 次补药', desc: '日常使用频率', required: false },
    { label: '使用场景', example: '居家、差旅、办公桌、户外露营', desc: '主要使用场景', required: true },
    { label: '用户痛点 1', example: '忘记吃药 / 重复吃药', desc: '产品可解决的痛点（按重要性排序）', required: true },
    { label: '用户痛点 2', example: '担心塑料化学物质长期接触药品', desc: '', required: false },
    { label: '用户痛点 3', example: '药盒不密封容易受潮', desc: '', required: false },
    { label: '用户痛点 4', example: '出差携带不便', desc: '', required: false },
    { label: '用户痛点 5', example: '老花眼看不清标签', desc: '', required: false },
  ],
};

// ===== 模板 A：图片文案 (listing7) =====
const TPL_IMAGE_COPY = [
  {
    name: '产品信息',
    rows: [
      { label: '产品定位', example: '面向中老年慢病人群的「7 天日历式」用药管理方案', desc: '一句话说明产品价值与目标人群', required: true },
      { label: '出货清单 1', example: '17X4 全黑 7 格便携药盒 × 1', desc: '随箱出货的物品列表，每行一个', required: true },
      { label: '出货清单 2', example: 'AUVON 品牌外包装 × 1', desc: '', required: false },
      { label: '出货清单 3', example: '使用说明卡 × 1', desc: '', required: false },
      { label: '出货清单 4', example: '售后服务卡 × 1', desc: '', required: false },
    ],
  },
  {
    name: '竞对优势差异',
    rows: [
      { label: '差异点 1-维度', example: '容量表达', desc: '差异化的角度（如容量/品牌/便携/安全等）', required: true },
      { label: '差异点 1-描述', example: '竞品多强调 7 天分装，本品突出 17X4 大容量分区', desc: '本品相对竞品的优势点', required: true },
      { label: '差异点 1-来源品牌', example: 'EZY DOSE', desc: '参考的竞品品牌', required: false },
      { label: '差异点 1-来源链接', example: 'https://www.amazon.com/dp/B07YYYY1234', desc: '竞品 Amazon 链接', required: false },
      { label: '差异点 2-维度', example: '品牌露出', desc: '', required: false },
      { label: '差异点 2-描述', example: '竞品主图多为纯产品展示，本品带 AUVON logo', desc: '', required: false },
      { label: '差异点 2-来源品牌', example: 'Sukuos', desc: '', required: false },
      { label: '差异点 2-来源链接', example: '', desc: '', required: false },
      { label: '差异点 3-维度', example: '便携安全', desc: '', required: false },
      { label: '差异点 3-描述', example: '突出卡扣闭合、防误开、适合旅行携带', desc: '', required: false },
      { label: '差异点 3-来源品牌', example: 'Sagely', desc: '', required: false },
      { label: '差异点 3-来源链接', example: '', desc: '', required: false },
    ],
  },
  {
    name: '竞对客诉点',
    rows: [
      { label: '客诉点 1', example: '竞品用户反馈盖子松动，外出携带容易洒出', desc: '搜集到的竞品负面评价（用于差异化突破）', required: true },
      { label: '客诉点 2', example: '部分竞品格子太小，不适合大颗粒补剂', desc: '', required: false },
      { label: '客诉点 3', example: '颜色过于鲜艳，用户认为不够商务', desc: '', required: false },
    ],
  },
  {
    name: '卖点信息',
    rows: [
      ..._SELLING_GROUP('USP', 3, '7 天日历式分隔', '行业首创整周可视化用药动线，避免漏服/重服'),
      ..._SELLING_GROUP('KSP', 3, 'BPA-Free 食品级材质', '获 FDA / CE 双认证，长期接触药品安全可控'),
      ..._SELLING_GROUP('OSP', 3, '5 色可选', '满足不同审美与场景，礼盒装可作为关怀礼品'),
    ],
  },
  {
    name: '图片创意',
    rows: [
      { label: '图1 (主图)-核心表达', example: '突出全黑外观、AUVON logo、7 格清晰分区', desc: '本图希望传达的核心信息', required: true },
      { label: '图1 (主图)-对标竞品', example: 'EZY DOSE / Sukuos 同类 7 日药盒主图', desc: '参考的竞品图片', required: false },
      { label: '图1 (主图)-竞对核心卖点', example: '竞品主图主要展示彩色分格与 7-day 使用场景', desc: '竞品图片想要传达的信息', required: false },
      { label: '图1 (主图)-差异化优势', example: '用低饱和黑色质感建立专业信任', desc: '本图相对竞品的差异化', required: false },
      { label: '图2-核心表达', example: '展示每格可容纳多种常见药片/维生素', desc: '', required: false },
      { label: '图2-对标竞品', example: '竞品容量说明图', desc: '', required: false },
      { label: '图2-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图2-差异化优势', example: '', desc: '', required: false },
      { label: '图3-核心表达', example: '放大卡扣闭合结构，突出包内携带不易散落', desc: '', required: false },
      { label: '图3-对标竞品', example: '', desc: '', required: false },
      { label: '图3-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图3-差异化优势', example: '', desc: '', required: false },
      { label: '图4-核心表达', example: '强调食品级材质、无异味、适合长期接触药片', desc: '', required: false },
      { label: '图4-对标竞品', example: '', desc: '', required: false },
      { label: '图4-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图4-差异化优势', example: '', desc: '', required: false },
      { label: '图5-核心表达', example: '展示居家配药、办公携带、旅行收纳三类场景', desc: '', required: false },
      { label: '图5-对标竞品', example: '', desc: '', required: false },
      { label: '图5-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图5-差异化优势', example: '', desc: '', required: false },
      { label: '图6-核心表达', example: '用手持、包内、桌面对比展示尺寸', desc: '', required: false },
      { label: '图6-对标竞品', example: '', desc: '', required: false },
      { label: '图6-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图6-差异化优势', example: '', desc: '', required: false },
      { label: '图7-核心表达', example: '展示药盒、说明卡、售后卡、品牌包装', desc: '', required: false },
      { label: '图7-对标竞品', example: '', desc: '', required: false },
      { label: '图7-竞对核心卖点', example: '', desc: '', required: false },
      { label: '图7-差异化优势', example: '', desc: '', required: false },
    ],
  },
  {
    name: '富文本与关联图',
    rows: [
      { label: '富文本段落 1-标题', example: '一周用药，清晰规划', desc: 'A+ 模块的副标题', required: false },
      { label: '富文本段落 1-内容', example: '7 格分区帮助用户把一周药物提前整理好', desc: 'A+ 模块的正文（30-100 字）', required: false },
      { label: '富文本段落 1-关联图建议', example: '建议关联图2容量说明与一周分区示意', desc: '该文本块希望搭配的图片说明', required: false },
      { label: '富文本段落 2-标题', example: '大容量不笨重', desc: '', required: false },
      { label: '富文本段落 2-内容', example: '兼顾多药收纳和日常便携', desc: '', required: false },
      { label: '富文本段落 2-关联图建议', example: '建议关联图6手持/包内尺寸对比', desc: '', required: false },
      { label: '富文本段落 3-标题', example: '带得出门的安心感', desc: '', required: false },
      { label: '富文本段落 3-内容', example: '稳固卡扣与紧凑结构适合放入包内', desc: '', required: false },
      { label: '富文本段落 3-关联图建议', example: '建议关联图3卡扣结构与旅行场景', desc: '', required: false },
    ],
  },
];

// ===== 模板 B：Listing / Title / TD =====
const TPL_LISTING = [
  {
    name: '产品信息',
    rows: [
      { label: '产品定位', example: '面向中老年慢病人群的「7 天日历式」用药管理方案', desc: '一句话说明产品价值与目标人群', required: true },
      { label: '资质认证 1', example: 'FDA 食品接触材料认证 (FDA-21-CFR-177.1520)', desc: '产品获得的认证 / 注册号', required: false },
      { label: '资质认证 2', example: 'CE 欧盟合规 (型号 AUVON-PO-17X4)', desc: '', required: false },
      { label: '资质认证 3', example: 'BPA-Free 检测报告 (SGS, 2024-08)', desc: '', required: false },
      { label: '适应症 1', example: '高血压 / 糖尿病等慢病长期用药', desc: '产品适用的人群/场景', required: true },
      { label: '适应症 2', example: '术后康复期多药联合服用', desc: '', required: false },
      { label: '适应症 3', example: '日常维生素 / 膳食补剂管理', desc: '', required: false },
      { label: '出货清单', example: '药盒 × 1 + 包装 × 1 + 说明卡 × 1', desc: '一行总结随箱物品', required: false },
      { label: 'K好分级', example: 'A 级（核心主推）', desc: '内部 K 好评级', required: false },
      { label: 'K好编码', example: 'KH-2024-PO-001', desc: '', required: false },
      { label: 'K好标签', example: '医疗健康 / 长期复购 / 礼品场景', desc: '', required: false },
    ],
  },
  {
    name: 'SEO 关键词',
    rows: [
      { label: '关键词 1', example: 'weekly pill organizer 4 times a day', desc: '目标关键词（按重要性排序）', required: true },
      { label: '关键词 1-月搜索量', example: '4980', desc: '该关键词的月搜索量', required: false },
      { label: '关键词 1-相关性', example: '强', desc: '强 / 中 / 弱', required: false },
      { label: '关键词 2', example: 'Pill box 7 day', desc: '', required: false },
      { label: '关键词 2-月搜索量', example: '6135', desc: '', required: false },
      { label: '关键词 2-相关性', example: '强', desc: '', required: false },
      { label: '关键词 3', example: '', desc: '', required: false },
      { label: '关键词 3-月搜索量', example: '', desc: '', required: false },
      { label: '关键词 3-相关性', example: '', desc: '', required: false },
      { label: '关键词 4', example: '', desc: '', required: false },
      { label: '关键词 4-月搜索量', example: '', desc: '', required: false },
      { label: '关键词 4-相关性', example: '', desc: '', required: false },
      { label: '关键词 5', example: '', desc: '', required: false },
      { label: '关键词 5-月搜索量', example: '', desc: '', required: false },
      { label: '关键词 5-相关性', example: '', desc: '', required: false },
    ],
  },
  {
    name: '竞品对比',
    rows: [
      { label: '竞品 1-品牌', example: 'EZY DOSE', desc: '主要竞品品牌', required: true },
      { label: '竞品 1-ASIN', example: 'B07YYYY1234', desc: 'Amazon ASIN', required: true },
      { label: '竞品 1-主图链接', example: 'https://www.amazon.com/dp/B07YYYY1234', desc: '产品页或主图 URL', required: false },
      { label: '竞品 1-大类排名', example: 'Health & Personal Care · #1,256', desc: '大类目 BSR', required: false },
      { label: '竞品 1-小类排名', example: 'Pill Organizers · #18', desc: '小类目 BSR', required: false },
      { label: '竞品 1-月销量', example: '12,500 / 月', desc: '总变体月销量', required: false },
      { label: '竞品 1-Title', example: 'EZY DOSE Weekly (7-Day) AM/PM Pill Organizer ...', desc: '竞品标题', required: true },
      { label: '竞品 1-TD 1', example: 'WEEKLY PLANNER – 7-day pill organizer ...', desc: '5 个 Bullet/TD', required: true },
      { label: '竞品 1-TD 2', example: 'EXTRA-LARGE COMPARTMENTS – ...', desc: '', required: false },
      { label: '竞品 1-TD 3', example: 'EASY-OPEN LIDS – ...', desc: '', required: false },
      { label: '竞品 1-TD 4', example: 'BPA-FREE PLASTIC – ...', desc: '', required: false },
      { label: '竞品 1-TD 5', example: 'TRUSTED BRAND – ...', desc: '', required: false },
      { label: '竞品 2-品牌', example: 'Sukuos', desc: '', required: false },
      { label: '竞品 2-ASIN', example: 'B08ZZZZ5678', desc: '', required: false },
      { label: '竞品 2-主图链接', example: '', desc: '', required: false },
      { label: '竞品 2-Title', example: '', desc: '', required: false },
      { label: '竞品 2-TD 1', example: '', desc: '', required: false },
      { label: '竞品 3-品牌', example: 'Sagely', desc: '', required: false },
      { label: '竞品 3-ASIN', example: 'B09WWWW9012', desc: '', required: false },
      { label: '竞品 3-主图链接', example: '', desc: '', required: false },
      { label: '竞品 3-Title', example: '', desc: '', required: false },
      { label: '竞品 3-TD 1', example: '', desc: '', required: false },
    ],
  },
  {
    name: '卖点信息',
    rows: [
      ..._SELLING_GROUP('USP', 3, '7 天日历式分隔', '行业首创整周可视化用药动线'),
      ..._SELLING_GROUP('KSP', 3, 'BPA-Free 食品级材质', '获 FDA / CE 双认证'),
      ..._SELLING_GROUP('OSP', 3, '5 色可选', '满足不同审美与场景'),
    ],
  },
  _AUDIENCE_PAIN_SHEET,
  {
    name: 'STP 矩阵',
    rows: [
      { label: '我司产品名称', example: 'AUVON PO17X4011', desc: '本品名称（用于 STP 列头）', required: true },
      { label: '竞品 A 名称', example: 'FYY (B08RDCQZHQ)', desc: '', required: false },
      { label: '竞品 B 名称', example: 'BEXEEN (B08D3TN32X)', desc: '', required: false },
      { label: '竞品 C 名称', example: 'AUVON 同类款', desc: '', required: false },
      { label: '本品-星级', example: '4.8', desc: 'STP 矩阵：本品的对应字段', required: false },
      { label: '本品-长期售价', example: '$9.99', desc: '', required: false },
      { label: '本品-活动售价', example: '$8.99', desc: '', required: false },
      { label: '本品-月销 PS', example: '200', desc: '', required: false },
      { label: '本品-年销售额', example: '$729,270', desc: '', required: false },
      { label: '本品-产品尺寸', example: '12.74 × 4 cm', desc: '', required: false },
      { label: '本品-重量', example: '100 g', desc: '', required: false },
      { label: '本品-FBA fee', example: '$2.91', desc: '', required: false },
      { label: '本品-颜色', example: '黑色、粉色、紫色、青色', desc: '', required: false },
      { label: '本品-材质', example: 'ABS、PP', desc: '', required: false },
      { label: '本品-表面处理', example: '哑纹', desc: '', required: false },
      { label: '本品-格数', example: '8', desc: '', required: false },
      { label: '本品-容量', example: '7/9/27（82 颗）', desc: '', required: false },
      { label: '本品-开合方式', example: '搭扣', desc: '', required: false },
      { label: '本品-品牌标识', example: '有', desc: '', required: false },
      { label: '本品-是否避光', example: '是', desc: '', required: false },
      { label: '本品-特色功能', example: '防潮外壳', desc: '', required: false },
      { label: '说明', example: '', desc: '上述 17 个对比字段，请按 [本品 / 竞品A / 竞品B / 竞品C] 分别整理；如需更多字段可继续追加行', required: false },
    ],
  },
];

// ===== 模板 C：卖点视频 =====
const TPL_VIDEO = [
  {
    name: '卖点信息',
    rows: [
      { label: '核心卖点 1', example: '一周用药清晰规划', desc: '7 个核心卖点（用于视频镜头规划）', required: true },
      { label: '核心卖点 2', example: '大容量分格', desc: '', required: false },
      { label: '核心卖点 3', example: '防洒便携', desc: '', required: false },
      { label: '核心卖点 4', example: '老人友好', desc: '', required: false },
      { label: '核心卖点 5', example: 'BPA-Free 安全材质', desc: '', required: false },
      { label: '核心卖点 6', example: '旅行/办公场景适配', desc: '', required: false },
      { label: '核心卖点 7', example: '品牌可信与售后保障', desc: '', required: false },
      ..._SELLING_GROUP('USP', 2, '一周用药清晰规划', '用打开药盒的俯拍镜头快速展示 7 天分区'),
      ..._SELLING_GROUP('KSP', 3, '大容量分格', '用维生素、鱼油的实拍对比说明每格可承接多种用药'),
      ..._SELLING_GROUP('OSP', 2, '旅行/办公场景适配', '通过床头、办公桌、旅行包三场景切换'),
    ],
  },
  {
    name: '镜头脚本',
    rows: [
      { label: '镜头 1-时间码', example: '00:00-00:04', desc: '7 段镜头脚本', required: true },
      { label: '镜头 1-对应卖点', example: '一周用药清晰规划', desc: '', required: true },
      { label: '镜头 1-中文文案', example: '一周用药，提前规划，每一天都清清楚楚', desc: '画面字幕/旁白（中文原稿）', required: true },
      { label: '镜头 1-画面展示', example: '俯拍打开药盒，展示 7 天分区和已放好的药片', desc: '画面/动作脚本说明', required: true },
      { label: '镜头 2-时间码', example: '00:04-00:08', desc: '', required: false },
      { label: '镜头 2-对应卖点', example: '大容量分格', desc: '', required: false },
      { label: '镜头 2-中文文案', example: '维生素、鱼油、日常药片，一格也能稳稳收纳', desc: '', required: false },
      { label: '镜头 2-画面展示', example: '手部依次放入维生素、鱼油和日常药片', desc: '', required: false },
      { label: '镜头 3-时间码', example: '00:08-00:12', desc: '', required: false },
      { label: '镜头 3-对应卖点', example: '防洒便携', desc: '', required: false },
      { label: '镜头 3-中文文案', example: '放进包里也安心，出门携带不怕散乱', desc: '', required: false },
      { label: '镜头 3-画面展示', example: '合上卡扣后放入包中并轻晃', desc: '', required: false },
      { label: '镜头 4-时间码', example: '00:12-00:16', desc: '', required: false },
      { label: '镜头 4-对应卖点', example: '老人友好', desc: '', required: false },
      { label: '镜头 4-中文文案', example: '清晰分区，轻松打开，家人使用更省心', desc: '', required: false },
      { label: '镜头 4-画面展示', example: '老人或手模轻松打开盖子', desc: '', required: false },
      { label: '镜头 5-时间码', example: '00:16-00:20', desc: '', required: false },
      { label: '镜头 5-对应卖点', example: 'BPA-Free 安全材质', desc: '', required: false },
      { label: '镜头 5-中文文案', example: 'BPA-Free 材质，适合日常药片和补剂收纳', desc: '', required: false },
      { label: '镜头 5-画面展示', example: '材质 close-up + BPA-Free 字幕', desc: '', required: false },
      { label: '镜头 6-时间码', example: '00:20-00:25', desc: '', required: false },
      { label: '镜头 6-对应卖点', example: '旅行/办公场景适配', desc: '', required: false },
      { label: '镜头 6-中文文案', example: '居家、办公、旅行，一盒满足多场景', desc: '', required: false },
      { label: '镜头 6-画面展示', example: '床头、办公桌、旅行包三个场景快速切换', desc: '', required: false },
      { label: '镜头 7-时间码', example: '00:25-00:30', desc: '', required: false },
      { label: '镜头 7-对应卖点', example: '品牌可信与售后保障', desc: '', required: false },
      { label: '镜头 7-中文文案', example: 'AUVON 品牌品质，让日常收纳更有保障', desc: '', required: false },
      { label: '镜头 7-画面展示', example: 'AUVON logo、包装、说明卡和售后卡依次入镜', desc: '', required: false },
    ],
  },
  {
    name: '拍摄说明',
    rows: [
      { label: '真人版本', example: '真人：45-70 岁用户或家庭照护者，突出日常用药管理场景', desc: '是否有真人出镜及人物设定', required: false },
      { label: '无真人版本', example: '手模 + 桌面/床头/旅行包场景，保证画面干净、动作清晰', desc: '无真人版本的画面构成', required: false },
      { label: '镜头风格', example: '低饱和居家光线，产品与 AUVON logo 保持清晰露出', desc: '色调 / 光线 / 节奏', required: false },
      { label: '视频时长', example: '30 秒', desc: '目标视频时长', required: true },
    ],
  },
  {
    name: '参考视频',
    rows: [
      { label: '参考 1-来源', example: 'Amazon 同类药盒视频', desc: '参考视频的来源描述', required: false },
      { label: '参考 1-链接', example: 'https://www.amazon.com/dp/B07YYYY1234', desc: '', required: false },
      { label: '参考 1-借鉴点', example: '参考开场 3 秒容量展示，俯拍快速建立使用场景', desc: '想借鉴的具体点', required: false },
      { label: '参考 2-来源', example: '竞品 A+ 使用场景图', desc: '', required: false },
      { label: '参考 2-链接', example: 'https://www.amazon.com/dp/B08ZZZZ5678', desc: '', required: false },
      { label: '参考 2-借鉴点', example: '居家与旅行场景切换，突出连续动线', desc: '', required: false },
      { label: '参考 3-来源', example: '短视频种草脚本', desc: '', required: false },
      { label: '参考 3-链接', example: '', desc: '', required: false },
      { label: '参考 3-借鉴点', example: '手模 close-up、字幕节奏和痛点开场', desc: '', required: false },
    ],
  },
];

// ===== 模板 D：FAQ =====
const TPL_FAQ = [
  {
    name: '产品信息',
    rows: [
      { label: '产品定位', example: '面向中老年慢病人群的「7 天日历式」用药管理方案', desc: '一句话说明产品价值', required: true },
      { label: '产品规格', example: '尺寸 12.74 × 4 cm，重量 100g，7 格分隔', desc: '关键规格参数（FAQ 常被问到）', required: true },
      { label: '资质认证', example: 'FDA / CE / BPA-Free / Climate Pledge Friendly', desc: '获得的安全/合规认证', required: false },
      { label: '适用人群', example: '长期服用 ≥3 种药物的慢病人群、术后康复者', desc: '', required: true },
      { label: '使用场景', example: '居家、差旅、办公桌、户外露营', desc: '', required: false },
    ],
  },
  {
    name: '竞品 FAQ',
    rows: [
      { label: '竞品 1-标签', example: 'BSR #1', desc: '竞品分组标签（BSR/直接竞对/品类领先等）', required: false },
      { label: '竞品 1-品牌', example: 'EZY DOSE', desc: '', required: true },
      { label: '竞品 1-链接', example: 'https://www.amazon.com/dp/B07YYYY1234', desc: '', required: false },
      { label: '竞品 1-FAQ 1', example: 'Q: Is it large enough for fish oil? A: Yes ...', desc: '从竞品页搜集的 FAQ（含问与答）', required: true },
      { label: '竞品 1-FAQ 2', example: 'Q: Are the lids easy for seniors? A: ...', desc: '', required: false },
      { label: '竞品 1-FAQ 3', example: 'Q: Is the plastic BPA-free? A: ...', desc: '', required: false },
      { label: '竞品 1-FAQ 4', example: '', desc: '', required: false },
      { label: '竞品 1-FAQ 5', example: '', desc: '', required: false },
      { label: '竞品 2-标签', example: 'BSR Top 10', desc: '', required: false },
      { label: '竞品 2-品牌', example: 'Sukuos', desc: '', required: false },
      { label: '竞品 2-链接', example: '', desc: '', required: false },
      { label: '竞品 2-FAQ 1', example: '', desc: '', required: false },
      { label: '竞品 3-标签', example: '直接竞对', desc: '', required: false },
      { label: '竞品 3-品牌', example: 'AUVON 同类药盒', desc: '', required: false },
      { label: '竞品 3-链接', example: '', desc: '', required: false },
      { label: '竞品 3-FAQ 1', example: '', desc: '', required: false },
    ],
  },
  {
    name: 'GEO 本地化',
    rows: [
      { label: '本地化表达', example: '美区 FAQ 建议使用直接、可验证的短句，避免夸大医疗效果', desc: '该站点的语言风格指引', required: false },
      { label: '搜索习惯', example: '用户常用 question style: Is it BPA-free? Can it hold large pills?', desc: '该站点用户的搜索/提问习惯', required: false },
      { label: '合规提醒', example: '避免承诺治疗、治愈或改善疾病', desc: '该品类的合规红线', required: false },
    ],
  },
  {
    name: 'Rufus 高频问答',
    rows: [
      { label: '问题 1', example: 'Can this pill organizer hold large vitamins?', desc: 'Rufus 助手常见问题', required: false },
      { label: '回答 1', example: '建议回答容量与药片尺寸有关，强调适合常见维生素、鱼油', desc: '建议的回答方向', required: false },
      { label: '问题 2', example: 'Is it safe for seniors?', desc: '', required: false },
      { label: '回答 2', example: '建议从清晰分区、易识别、一周规划角度回答', desc: '', required: false },
      { label: '问题 3', example: 'Will it open in my bag?', desc: '', required: false },
      { label: '回答 3', example: '结合卡扣闭合和旅行携带场景回答', desc: '', required: false },
    ],
  },
  _AUDIENCE_PAIN_SHEET,
];

// ===== 模板 E：通用（package / manual / ad / grass / news / video-operation） =====
const TPL_GENERIC = [
  {
    name: '产品信息',
    rows: [
      { label: '产品定位', example: '面向中老年慢病人群的「7 天日历式」用药管理方案', desc: '一句话说明产品价值', required: true },
      { label: '产品规格', example: '尺寸 12.74 × 4 cm，重量 100g，7 格分隔', desc: '关键规格', required: true },
      { label: '主要材质', example: 'ABS、PP（食品级）', desc: '', required: false },
      { label: '资质认证', example: 'FDA / CE / BPA-Free', desc: '', required: false },
      { label: '使用方法', example: '打开盖子 → 按周分装 → 卡扣闭合 → 随身携带', desc: '产品的基本使用流程', required: false },
      { label: '主要卖点说明', example: '一周一次配药 / 防洒便携 / 老人友好', desc: '产品最核心的 3-5 个卖点', required: true },
    ],
  },
  {
    name: '卖点信息',
    rows: [
      ..._SELLING_GROUP('USP', 3, '7 天日历式分隔', '行业首创整周可视化用药动线'),
      ..._SELLING_GROUP('KSP', 3, 'BPA-Free 食品级材质', '获 FDA / CE 双认证'),
      ..._SELLING_GROUP('OSP', 2, '5 色可选', '满足不同审美与场景'),
    ],
  },
  _AUDIENCE_PAIN_SHEET,
  {
    name: '参考资料',
    rows: [
      { label: '参考链接 1', example: 'https://www.amazon.com/dp/B07YYYY1234', desc: '参考的竞品 / 行业资料 / 历史成功案例', required: false },
      { label: '参考链接 1-备注', example: '参考其包装信息层次', desc: '', required: false },
      { label: '参考链接 2', example: '', desc: '', required: false },
      { label: '参考链接 2-备注', example: '', desc: '', required: false },
      { label: '参考链接 3', example: '', desc: '', required: false },
      { label: '参考链接 3-备注', example: '', desc: '', required: false },
      { label: '其他备注', example: '本批主推礼盒包装，色调建议黑+金质感', desc: '其他说明事项', required: false },
    ],
  },
];

const INPUT_TEMPLATES = {
  A: TPL_IMAGE_COPY,
  B: TPL_LISTING,
  C: TPL_VIDEO,
  D: TPL_FAQ,
  E: TPL_GENERIC,
};

// reqKey 形如：new-listing7 / new-titletd-titletd / new-video-selling / new-faq / new-package
function getInputTemplateKey(reqKey) {
  if (!reqKey) return 'E';
  const parts = String(reqKey).split('-');
  const biz = parts[1];
  const sub = parts[2];
  if (biz === 'listing7') return 'A';
  if (biz === 'titletd') return 'B';
  if (biz === 'video' && sub === 'selling') return 'C';
  if (biz === 'faq') return 'D';
  return 'E';
}
