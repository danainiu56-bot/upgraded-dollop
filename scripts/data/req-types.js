/* ============================================
   需求类型 / 站点 / 子品类 字典与样式映射
   抽取自 创建需求-上传页面.html
   ============================================ */

const BIZ_TYPES = [
  { id: 'package',  iconKey: 'package',  name: '包装盒',         desc: '产品外包装文案' },
  { id: 'manual',   iconKey: 'manual',   name: '产品说明书',     desc: '使用说明 / 介绍' },
  { id: 'listing7', iconKey: 'image',    name: '卖点图片',         desc: '主图卖点文案' },
  { id: 'titletd',  iconKey: 'titletd',  name: 'Listing',        desc: '标题与描述',  hasSub: true },
  { id: 'video',    iconKey: 'video',    name: '视频脚本',       desc: '卖点/操作视频文案', hasSub: true },
  { id: 'faq',      iconKey: 'faq',      name: 'FAQ',            desc: '常见问题解答' },
  { id: 'ad',       iconKey: 'ad',       name: '广告创意',       desc: '广告文案 / 素材' },
  { id: 'grass',    iconKey: 'spark',    name: '种草文案',       desc: '社媒种草内容' },
  { id: 'news',     iconKey: 'news',     name: '新闻稿',         desc: '品牌 / 产品新闻发布' },
];

const TITLETD_SUB = [
  { id: 'title',    iconKey: 'title',   name: 'Title',     desc: '仅标题' },
  { id: 'td',       iconKey: 'td',      name: 'TD',        desc: '仅描述' },
  { id: 'titletd',  iconKey: 'titletd', name: 'Listing',   desc: '标题 + 描述' },
];

const VIDEO_SUB = [
  { id: 'selling',   iconKey: 'video',  name: '卖点视频', desc: '产品卖点展示 / 种草短视频脚本' },
  { id: 'operation', iconKey: 'manual', name: '操作视频', desc: '安装步骤 / 使用方法 / 操作演示脚本' },
];

const BIZ_SUB_MAP = {
  titletd: TITLETD_SUB,
  video: VIDEO_SUB,
};

const stageLabels = { new: '新品', old: '优化' };

const reqTypeLabels = new Proxy({}, {
  get(_, key) {
    if (!key || key === 'undefined') return '';
    // 解析 key: stage-biz 或 stage-titletd-sub
    const parts = String(key).split('-');
    if (parts.length < 2) return '';
    const stage = parts[0];
    const biz = parts[1];
    const sub = parts[2];
    const stageLabel = stageLabels[stage] || stage;
    if (sub && BIZ_SUB_MAP[biz]) {
      const subItem = BIZ_SUB_MAP[biz].find(s => s.id === sub);
      return `${stageLabel} · ${subItem ? subItem.name : biz}`;
    }
    const bizItem = BIZ_TYPES.find(b => b.id === biz);
    return `${stageLabel} · ${bizItem ? bizItem.name : biz}`;
  }
});

const siteLabels = {
  us: '🇺🇸 美国站', uk: '🇬🇧 英国站', de: '🇩🇪 德国站', fr: '🇫🇷 法国站',
  jp: '🇯🇵 日本站', ca: '🇨🇦 加拿大站', au: '🇦🇺 澳大利亚站',
  ae: '🇦🇪 中东站', sg: '🇸🇬 新加坡站', mx: '🇲🇽 墨西哥站'
};

const subLabels = {
  outdoor: '户外运动', kitchen: '厨房用品', electronics: '消费电子',
  home: '家居生活', beauty: '美妆个护', sports: '运动健身',
  pet: '宠物用品', baby: '母婴玩具', office: '办公文具', tools: '工具五金'
};

const REQ_TYPE_STYLES = {
  '新品Listing':   'req-type-new',     // 紫
  '新品Title':     'req-type-indigo',  // 靛蓝
  '新品TD':        'req-type-sky',     // 天蓝
  '新品Title TD':  'req-type-violet',  // 浅紫
  '新品图片文案':  'req-type-td',      // 玫红
  '新品FAQ':       'req-type-title',   // 琥珀
  '新品卖点视频':  'req-type-orange',  // 橙
  '老品Title':     'req-type-teal',    // 青绿
  '老品TD':        'req-type-cyan',    // 青
  '老品Title TD':  'req-type-old',     // 石板灰
  '卖点视频':      'req-type-listing', // 绿
};

