import { canonicalKey, getParameterMeta, splitConditionValue } from './parameterDictionary.js';
import { toText } from './testRecord.js';

// Values are compared after Unicode compatibility folding (Ω vs Ω, full-width digits),
// whitespace removal and lower-casing, so formatting-only differences never count as a difference.
export function normalizeForCompare(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
}

/**
 * Build the aligned rows of one test group.
 *
 * columns: one entry per selected standard, in display order:
 *   { baseId, records: [test], status: 'ok' | 'none' | 'level' }
 *   records are already limited to the active version and the selected sample levels.
 *
 * Row state (technical rows only):
 *   'diff'    – at least two standards specify it and their value sets differ
 *   'partial' – some covering standards specify it, others do not
 *   'same'    – every covering standard specifies the same value(s)
 *   'single'  – only one standard covers this test, nothing to compare
 * Procedure rows (sample quantity, pre-conditioning, observation) are never diff-marked.
 */
export function buildGroupRows(columns) {
  const coveredCount = columns.filter(c => c.records.length > 0).length;
  const rows = new Map();

  columns.forEach((col, ci) => {
    col.records.forEach(rec => {
      Object.entries(rec.conditions || {}).forEach(([rawKey, raw]) => {
        const { value, detail } = splitConditionValue(raw);
        if (!value && !detail) return;
        const key = canonicalKey(rawKey);
        if (!rows.has(key)) rows.set(key, { key, ...getParameterMeta(key), cells: columns.map(() => []) });
        rows.get(key).cells[ci].push({
          clause: rec.section,
          value: value || detail,
          detail: value ? detail : '',
        });
      });
    });
  });

  const withState = [...rows.values()].map(row => {
    if (row.category === 'procedure') return { ...row, state: 'procedure' };
    if (coveredCount < 2) return { ...row, state: 'single' };
    const specified = row.cells.filter(cell => cell.length > 0);
    const signatures = new Set(
      specified.map(cell => [...new Set(cell.map(e => normalizeForCompare(e.value)))].sort().join('\u0000'))
    );
    let state = 'same';
    if (specified.length >= 2 && signatures.size > 1) state = 'diff';
    else if (specified.length < coveredCount) state = 'partial';
    return { ...row, state };
  });

  withState.sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, 'zh-Hant'));

  const technical = withState.filter(r => r.category !== 'procedure');
  const procedure = withState.filter(r => r.category === 'procedure');
  const criteria = columns.map(col => col.records.map(rec => ({
    clause: rec.section,
    summary: toText(rec.acceptance_criteria?.summary),
  })).filter(e => e.summary));

  return {
    technical,
    procedure,
    criteria,
    diffCount: technical.filter(r => r.state === 'diff').length,
    // Nothing to see in diff-only mode: every standard covers the test and all technical rows agree.
    identical: columns.every(c => c.status === 'ok') && technical.every(r => r.state === 'same'),
  };
}
