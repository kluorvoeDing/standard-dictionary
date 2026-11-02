import { levelLabel } from './orgColors.js';
import { canonicalKey, getParameterMeta, splitConditionValue } from './parameterDictionary.js';
import { toText } from './testRecord.js';

// Values are compared after Unicode compatibility folding (Ω vs Ω, ℃ vs °C, full-width digits),
// unifying slash/tilde/arrow/times variants, whitespace removal and lower-casing,
// dropping English-only explanations in brackets, and folding "fully charged" synonyms,
// so formatting-only differences never count as a difference.
// A tolerance ("-40 ± 2 °C") is a real difference from a bare value ("-40 °C") and is kept.
export function normalizeForCompare(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/／/g, '/')
    .replace(/[~〜～]/g, '~')
    .replace(/->/g, '→')
    .replace(/✕/g, '×')
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/\(依(?:saej2464|ul1642|un38\.3)[^)]*\)/g, '')
    .replace(/\([a-z\-/,.]{3,}\)/g, '')
    .replace(/(100%)?(標準充電後|充滿電後|充滿電|滿充電狀態|滿充電|滿電狀態|滿電|滿充|100%soc)/g, '滿充')
    .replace(/滿充\(?滿充\)?/g, '滿充');
}

/**
 * Build the aligned rows of one test group.
 *
 * columns: one entry per selected standard, in display order:
 *   { baseId, records: [test], status: 'ok' | 'none' | 'level' }
 *   records are already limited to the active version and the selected sample levels.
 *
 * Row state (technical rows only):
 *   'diff' – at least two standards specify it and their values differ
 *   'same' – at least two standards specify it and all values agree
 *   'only' – just one standard specifies it, nothing to compare
 * Procedure rows (sample quantity, pre-conditioning, observation) are never diff-marked.
 */
export function buildGroupRows(columns) {
  const rows = new Map();

  columns.forEach((col, ci) => {
    col.records.forEach(rec => {
      Object.entries(rec.conditions || {}).forEach(([rawKey, raw]) => {
        const { value, detail, source_reference } = splitConditionValue(raw);
        if (!value && !detail) return;
        const key = canonicalKey(rawKey);
        if (!rows.has(key)) rows.set(key, { key, ...getParameterMeta(key), cells: columns.map(() => []) });
        rows.get(key).cells[ci].push({
          clause: rec.section,
          value: value || detail,
          detail: value ? detail : '',
          source_reference,
          // Checked against the source text (see scripts/audit_enrichment.mjs).
          checked: Boolean(source_reference),
        });
      });
    });
  });

  const withState = [...rows.values()].map(row => {
    if (row.category === 'procedure') return { ...row, state: 'procedure' };
    const specified = row.cells.filter(cell => cell.length > 0);
    const signatures = new Set(
      specified.map(cell => [...new Set(cell.map(e => normalizeForCompare(e.value)))].sort().join('\u0000'))
    );
    let state = 'same';
    if (specified.length < 2) state = 'only';
    else if (signatures.size > 1) state = 'diff';
    return { ...row, state };
  });

  withState.sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, 'zh-Hant'));

  const technical = withState.filter(r => r.category !== 'procedure');
  const procedure = withState.filter(r => r.category === 'procedure');
  const criteria = columns.map(col => col.records.map(rec => {
    const summary = toText(rec.acceptance_criteria?.summary);
    const details = Array.isArray(rec.acceptance_criteria?.details)
      ? rec.acceptance_criteria.details.map(toText).filter(Boolean)
      : [];
    return {
      clause: rec.section,
      summary,
      details,
    };
  }).filter(e => e.summary));

  return {
    technical,
    procedure,
    criteria,
    diffCount: technical.filter(r => r.state === 'diff').length,
  };
}

// 樣品層級的中文名稱（比對頁一律只顯示中文）。
export function levelLabelZh(obj = '') {
  return levelLabel(obj);
}

// 測試名稱只留中文：去掉結尾括號內的英文說明。
export function stripEnglishNote(name = '') {
  return String(name).replace(/\s*[(（][^()（）]*[A-Za-z][^()（）]*[)）]\s*$/, '').trim();
}
