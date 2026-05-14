export const iconMap = {
  workbench: '⌁',
  list: '≡',
  review: '✓',
  wizard: '+',
  result: '◆',
  ai: 'AI',
};

export function iconOf(viewId) {
  if (viewId === 'workbench') return iconMap.workbench;
  if (viewId.includes('Review')) return iconMap.review;
  if (viewId === 'wizard') return iconMap.wizard;
  if (viewId === 'result') return iconMap.result;
  if (viewId === 'aiChat') return iconMap.ai;
  return iconMap.list;
}
