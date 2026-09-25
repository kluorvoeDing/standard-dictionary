// Data is not always clean: some standards (AIS-038, ULC2580, UL3030, …) carry
// structured objects like { id, rule_zh, rule_en } inside arrays/values that are
// otherwise strings. Rendering an object as a React child throws and blanks the
// whole app, so coerce anything non-primitive into readable text.
export function toText(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join('；');
  if (typeof v === 'object') {
    return v.rule_zh || v.rule_en || v.value || v.detail || v.text || v.name_zh || '';
  }
  return String(v);
}

export function hasExemptions(record) {
  const ex = record?.exemptions;
  return Array.isArray(ex) && ex.length > 0 && ex[0] !== 'None';
}
