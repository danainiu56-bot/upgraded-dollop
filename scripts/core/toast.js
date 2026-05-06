/* ============================================
   Toast 提示
   抽取自 创建需求-上传页面.html
   依赖：I() 图标函数（icons.js）
   ============================================ */

function showToast(msg, type = 'success') {
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
  const iconMap = { success: 'checkc', error: 'errorIcon', warning: 'warn' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = `<span class="toast-icon" style="color:${colors[type]};display:inline-flex;">${I(iconMap[type], 18)}</span>`;
  toast.innerHTML = `${icon}<span class="toast-text">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
