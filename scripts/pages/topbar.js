/* ============================================
   顶栏日期 + 全局静态图标注入
   updateTopbarDate / fillStaticIcons
   抽取自 创建需求-上传页面.html line 4126-4176
   ============================================ */

function updateTopbarDate() {
  const calNum = document.getElementById('cal-day');
  const dateText = document.getElementById('date-text');
  if (!calNum || !dateText) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  calNum.textContent = day;
  dateText.textContent = `${year}年${month}月${day}日 ${weekNames[now.getDay()]}`;
}

// ===== 静态按钮/图标初始化（统一注入 SVG）=====
function fillStaticIcons() {
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  // Step 1
  set('step1-card-icon', I('product', 18));
  set('stage-icon-new', I('plus', 22));
  set('stage-icon-old', I('refresh', 22));
  set('step1-next-btn', `<span>下一步：上传文件</span>${I('arrowR', 14)}`);
  // Step 2
  set('step2-card-icon', I('upload', 18));
  set('summary-label', `${I('checkc', 14)}<span>基础信息确认</span>`);
  set('summary-edit-btn', `${I('edit', 12)}<span>修改</span>`);
  set('method-icon-1', IL('link', 28));
  set('method-icon-2', IL('template', 28));
  set('feishu-hint-icon', I('bulb', 18));
  set('feishu-warning-icon', I('alert-triangle', 16));
  set('add-link-btn', `${I('plus', 16)}<span>添加飞书文档链接（${(window.feishuLinks || []).length || 1}/10）</span>`);
  set('template-download-icon', IL('download', 26));
  set('download-template-btn', `${I('download', 14)}<span>下载模板</span>`);
  set('upload-icon', IL('upload', 36));
  set('uploaded-file-icon', IL('template', 22));
  set('start-parse-btn', `${I('search', 16)}<span>开始解析</span>`);
  set('step2-prev-btn', `${I('arrowL', 14)}<span>上一步</span>`);
  // 解析中
  set('parsing-icon-inner', IL('brain', 22));
  // 结果页
  set('result-top-icon', I('check', 22));
  set('result-export-btn', `${I('download', 12)}<span>导出</span>`);
  set('result-back-btn', `${I('arrowL', 12)}<span>返回</span>`);
  set('result-submit-btn', `${I('check', 12)}<span>确认提交</span>`);
  set('nav-title-text', `${I('bullets', 14)}<span>内容大纲</span>`);
  set('result-footer-back-btn', `${I('arrowL', 14)}<span>返回修改</span>`);
  set('create-demand-btn', `${I('plus', 14)}<span>创建需求</span>`);
  set('result-footer-submit-btn', `${I('check', 14)}<span>确认提交审核</span>`);
  // 弹窗
  set('modal-close-btn', I('close', 14));
  set('modal-copy-btn', `${I('copy', 14)}<span>复制内容</span>`);
  // 列表页
}
