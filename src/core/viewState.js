const VIEW_KEY = 'ptm.vue.activeView';

export function getSavedView() {
  return window.sessionStorage.getItem(VIEW_KEY);
}

export function saveView(viewId) {
  window.sessionStorage.setItem(VIEW_KEY, viewId);
}
