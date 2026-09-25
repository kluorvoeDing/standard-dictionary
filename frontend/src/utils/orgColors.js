// Standard-body color tokens (defined in index.css) keyed off the document id prefix.
export function getOrgColor(baseId = '') {
  if (baseId.startsWith('GB')) return { solid: 'var(--org-gb-solid)', text: 'var(--org-gb-text)', fill: 'var(--org-gb-fill)', border: 'var(--org-gb-border)' };
  if (baseId.startsWith('UL')) return { solid: 'var(--org-ul-solid)', text: 'var(--org-ul-text)', fill: 'var(--org-ul-fill)', border: 'var(--org-ul-border)' };
  if (baseId.startsWith('IEC') || baseId.startsWith('UN')) return { solid: 'var(--org-intl-solid)', text: 'var(--org-intl-text)', fill: 'var(--org-intl-fill)', border: 'var(--org-intl-border)' };
  return { solid: 'var(--org-other-solid)', text: 'var(--org-other-text)', fill: 'var(--org-other-fill)', border: 'var(--org-other-border)' };
}

// Display name for a test_objects / available_objects token.
export function levelLabel(obj = '') {
  if (obj === 'PACK_SYSTEM') return 'Pack / System';
  if (obj === 'SINGLE_CELL_BATTERY') return 'Single Cell';
  if (obj === 'COMPONENT_CELL') return 'Comp. Cell';
  if (obj === 'BATTERY_SYSTEM') return 'Batt. System';
  return obj.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
