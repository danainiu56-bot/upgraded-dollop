export function priorityOf(type = '') {
  if (/视频|FQA|Listing/.test(type)) return 'P1';
  if (/优化|图片/.test(type)) return 'P2';
  return 'P0';
}

export function formatDate(dateText) {
  if (!dateText) return '-';
  return String(dateText).replace(/\//g, '-').slice(0, 10);
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
