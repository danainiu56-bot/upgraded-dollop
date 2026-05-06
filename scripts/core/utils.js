/* ============================================
   通用工具函数（可编辑字段 / 复制 / 转义 / 用户首字母）
   抽取自 创建需求-上传页面.html
   ============================================ */

// ----- setByPath -----
function setByPath(path, value) {
  const parts = path.split('.');
  let obj = MOCK_DATA;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    obj = isNaN(k) ? obj[k] : obj[parseInt(k)];
  }
  const last = parts[parts.length - 1];
  if (isNaN(last)) obj[last] = value;
  else obj[parseInt(last)] = value;
}

// ----- editableField -----
function editableField(path, value, opts = {}) {
  const tag = opts.multiline ? 'div' : 'span';
  const cls = opts.cls || 'edit-field';
  const placeholder = opts.placeholder || '点击编辑';
  return `<${tag} class="${cls}" contenteditable="true" data-path="${path}" data-placeholder="${placeholder}"
    onfocus="onEditFocus(event)" onblur="onEditBlur(event)" onkeydown="onEditKey(event,${opts.multiline ? 'true' : 'false'})">${value || ''}</${tag}>`;
}

// ----- onEditFocus -----
function onEditFocus(e) {
  e.target.classList.add('editing');
}

// ----- onEditBlur -----
function onEditBlur(e) {
  const path = e.target.dataset.path;
  const v = e.target.innerText.trim();
  setByPath(path, v);
  e.target.classList.remove('editing');
  showToast('已保存', 'success');
}

// ----- onEditKey -----
function onEditKey(e, multiline) {
  if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.target.blur(); }
  if (e.key === 'Escape') { e.preventDefault(); e.target.blur(); }
}

// ----- copyText -----
function copyText(t) {
  try { navigator.clipboard.writeText(t); } catch (e) {}
  showToast(`已复制：${t}`, 'success');
}

// ----- escapeAiHtml -----
function escapeAiHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ----- getCurrentUserInitial -----
function getCurrentUserInitial() {
  // 取登录用户名首字母（大写）。当前 Demo 写死 Mason，可后续从全局 CURRENT_USER 读取
  const name = (typeof CURRENT_USER === 'string' && CURRENT_USER) ? CURRENT_USER : 'Mason';
  return (name.trim().charAt(0) || 'U').toUpperCase();
}

