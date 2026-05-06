/* ============================================
   SKU 数据（本地示例 + 按子品类的扩展库）
   抽取自 创建需求-上传页面.html
   ============================================ */

const allSkusData = [
  { code: 'PO17X4011', name: '17X4 全黑 7格便携药盒（带 AUVON logo）', market: 'US' },
  { code: 'PO1107011', name: '7日 7格 E-353 药盒（带 logo）', market: 'US' },
  { code: 'AS8012041', name: 'AS8012041 银色 TENS 套装', market: 'US' },
  { code: 'PD4007AK1', name: 'PD4007AK1 透明药杯', market: 'US' },
  { code: 'N001A2222', name: 'AC 款背光小夜灯（2 pack）', market: 'DE' },
];

const skuDatabase = {
  outdoor: [
    { code: 'OUT-001', name: '户外折叠椅 Pro' },
    { code: 'OUT-002', name: '露营帐篷 3人款' },
    { code: 'OUT-003', name: '登山背包 60L' },
    { code: 'OUT-004', name: '防水冲锋衣 M码' },
    { code: 'OUT-005', name: '户外水壶 1L' },
    { code: 'OUT-006', name: '便携野餐垫' },
    { code: 'OUT-007', name: '充气睡垫 双人' },
  ],
  kitchen: [
    { code: 'KIT-001', name: '不锈钢锅具套装' },
    { code: 'KIT-002', name: '硅胶铲刀组合' },
    { code: 'KIT-003', name: '电动打蛋器' },
    { code: 'KIT-004', name: '真空保鲜盒 5件套' },
    { code: 'KIT-005', name: '咖啡磨豆机' },
    { code: 'KIT-006', name: '智能料理秤' },
  ],
  electronics: [
    { code: 'ELE-001', name: '无线蓝牙耳机 Pro' },
    { code: 'ELE-002', name: '快充充电宝 20000mAh' },
    { code: 'ELE-003', name: '智能手环 V5' },
    { code: 'ELE-004', name: '无线充电器 15W' },
    { code: 'ELE-005', name: '蓝牙音箱 防水版' },
    { code: 'ELE-006', name: '迷你投影仪 H1' },
    { code: 'ELE-007', name: 'USB-C 多口扩展坞' },
    { code: 'ELE-008', name: 'TWS 入耳式耳机 Lite' },
  ],
  home: [
    { code: 'HOME-001', name: '北欧风台灯' },
    { code: 'HOME-002', name: '床头收纳架' },
    { code: 'HOME-003', name: '香薰蜡烛礼盒' },
    { code: 'HOME-004', name: '懒人沙发豆袋' },
    { code: 'HOME-005', name: '竹制浴室置物架' },
  ],
  beauty: [
    { code: 'BEA-001', name: '玻尿酸面膜 10片装' },
    { code: 'BEA-002', name: '电动洁面仪' },
    { code: 'BEA-003', name: '便携美妆镜 LED' },
    { code: 'BEA-004', name: '护发精油 100ml' },
  ],
  sports: [
    { code: 'SPT-001', name: '智能跳绳 计数版' },
    { code: 'SPT-002', name: '瑜伽垫 6mm 加厚' },
    { code: 'SPT-003', name: '可调节哑铃 20kg' },
    { code: 'SPT-004', name: '运动护腕 双只装' },
  ],
  pet: [
    { code: 'PET-001', name: '自动喂食器' },
    { code: 'PET-002', name: '宠物饮水机' },
    { code: 'PET-003', name: '智能猫砂盆' },
    { code: 'PET-004', name: '可拆洗宠物窝' },
  ],
  baby: [
    { code: 'BAB-001', name: '婴儿安抚奶嘴' },
    { code: 'BAB-002', name: '儿童积木 100 件' },
    { code: 'BAB-003', name: '婴儿恒温奶瓶' },
  ],
  office: [
    { code: 'OFF-001', name: '人体工学椅靠垫' },
    { code: 'OFF-002', name: '桌面收纳盒套装' },
    { code: 'OFF-003', name: '可调节笔记本支架' },
  ],
  tools: [
    { code: 'TOL-001', name: '家用工具箱 40 件' },
    { code: 'TOL-002', name: '电动螺丝刀套装' },
    { code: 'TOL-003', name: '激光测距仪 30m' },
  ],
};

