// Standard-body color tokens (defined in index.css) keyed off the document id prefix.
export function getOrgColor(baseId = '') {
  if (baseId.startsWith('GB')) return { solid: 'var(--org-gb-solid)', text: 'var(--org-gb-text)', fill: 'var(--org-gb-fill)', border: 'var(--org-gb-border)' };
  if (baseId.startsWith('UL')) return { solid: 'var(--org-ul-solid)', text: 'var(--org-ul-text)', fill: 'var(--org-ul-fill)', border: 'var(--org-ul-border)' };
  if (baseId.startsWith('IEC') || baseId.startsWith('UN')) return { solid: 'var(--org-intl-solid)', text: 'var(--org-intl-text)', fill: 'var(--org-intl-fill)', border: 'var(--org-intl-border)' };
  return { solid: 'var(--org-other-solid)', text: 'var(--org-other-text)', fill: 'var(--org-other-fill)', border: 'var(--org-other-border)' };
}

// 樣品層級的中文名稱（test_objects / available_objects 的值）。
const LEVEL_LABELS = {
  CELL: '電芯',
  MODULE: '模組',
  PACK_SYSTEM: '電池包／系統',
  SINGLE_CELL_BATTERY: '單電芯電池',
  COMPONENT_CELL: '組件電芯',
  BATTERY_SYSTEM: '電池系統',
};
export function levelLabel(obj = '') {
  return LEVEL_LABELS[obj] || obj;
}
