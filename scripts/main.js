/* ============================================
   主入口 · DOMContentLoaded 初始化
   抽取自 创建需求-上传页面.html
   ============================================ */

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 顶栏日期
  updateTopbarDate();
  setInterval(updateTopbarDate, 60 * 1000);

  // 静态图标 / 按钮注入
  fillStaticIcons();

  // 列表页相关
  renderSidebar();
  renderPersonValueOptions('writer');
  renderListTable();
  if (typeof renderCfPersonValueOptions === 'function') renderCfPersonValueOptions('writer');
  if (typeof renderCopyListTable === 'function') renderCopyListTable();

  // 需求类型选择器
  renderBizGrid();
  renderSubGrid();
  syncReqType();

  // 飞书链接默认 1 个
  if (feishuLinks.length === 0) {
    addFeishuLinkSilent();
    renderFeishuLinks();
  }

  // 列表页 SKU 筛选数据（本地）
  rebuildFilterSkuPool();

  // 加载子品类（API），完成后再恢复视图
  loadSubCategories().finally(() => {
    restoreSavedView();
  });
});
