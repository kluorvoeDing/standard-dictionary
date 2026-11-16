// 比對核心：把多份標準的同一項測試排成對齊的列，並判定每一列的狀態。
// 純函式，不依賴 DOM，可在 node 直接測試（compare.test.mjs）。
//
// 列的狀態（state，與呈現契約一致，嚴格比對）：
//   same  兩份以上有規定，正規化後文字相同
//   diff  兩份以上有規定，文字不同
//   only  只有一份有規定
// 另有呈現用的層級（tier），只影響標示，不改變 state：
//   differ   數值、單位或限定詞不同：真正的差異，醒目標示並計數
//   wording  數值、單位、比較符號與限定詞都相同，只是寫法不同：不標示為差異
//   same / only  同 state
import { canonicalKey, getParameterMeta, splitConditionValue } from '../utils/parameterDictionary.js';
import { normalizeForCompare } from '../utils/compareRows.js';
import { toText } from '../utils/testRecord.js';
import EQUIVALENTS from './equivalents.json' with { type: 'json' };

export const CATEGORY_ORDER = ['ELEC', 'MECH', 'THERM', 'ENV', 'FIRE', 'BMS', 'OTHER'];
export const CATEGORY_LABELS = {
  ALL: '全部', ELEC: '電氣', MECH: '機械', THERM: '熱', ENV: '環境', FIRE: '火燒', BMS: '保護功能', OTHER: '其他',
};
export const LEVELS = ['CELL', 'MODULE', 'PACK_SYSTEM'];

export function categoryOf(test) {
  const prefix = (test.normalized_id || '').split('-')[0];
  if (CATEGORY_ORDER.includes(prefix)) return prefix;
  if (CATEGORY_ORDER.includes(test.category)) return test.category;
  return 'OTHER';
}

// 測試名稱只留中文：去掉括號內的英文說明與結尾的「試驗／測試」。
export function cleanTestName(name = '') {
  // 去掉英文括號與結尾的「試驗／測試」；「— 適用於…」是適用條件，必須保留。
  const text = String(name).replace(/\s*[(（][^()（）]*[A-Za-z][^()（）]*[)）]/g, '');
  const m = text.match(/^(.*?)\s*[—–]\s*(適用於.*)$/);
  const head = (m ? m[1] : text).replace(/(試驗|測試)$/g, '').trim();
  return m ? `${head}（${m[2].trim()}）` : head;
}

// ───────── 數值指紋 ─────────

const CJK_UNITS = '小時|分鐘|秒|天|日|週|個月|年|次|個|顆|組|只|倍|循環|軸|面|方向|公尺|公分|公斤';
const QUANT = new RegExp(
  `(?<![A-Za-z\\d.])([-−]?\\d+(?:\\.\\d+)?)(?:±(\\d+(?:\\.\\d+)?))?((?:${CJK_UNITS})|[%°A-Za-zΩμ²³]+(?:/[A-Za-z]+)?|[\\u4e00-\\u9fff])?`,
  'g'
);
const num = (s) => String(parseFloat(String(s).replace('−', '-')));

// 會改變意義的比較與限定：出現的種類必須一致，才可能只是「寫法不同」。
const MARKERS = [
  ['≤', /≤|<=|≦|不超過|不大於|不高於|至多|最多|以內|以下/g],
  ['≥', /≥|>=|≧|不小於|不低於|不少於|至少|最少|以上/g],
  ['<', /<|小於|低於|少於/g],
  ['>', />|大於|高於|超過|多於/g],
  ['或', /或|方式[一二三]|取先到者|取較[大小高低嚴]者/g],
  ['範圍', /~|至(?=\d)/g],
];
const QUALIFIERS = [
  '圓柱', '方形', '軟包', '袋', '紐扣', '鈕扣', '硬殼',
  '電芯', '電池組', '電池包', '模組', '系統', '原電池', '小型', '大型',
  '充電', '放電', '開路', '高溫', '低溫', '最大', '最小', '上限', '下限', '額定', '標稱',
  '每', '共', '總', '平均', '峰', '有效值', '半正弦', '正弦', '隨機', '對數',
  '垂直', '水平', '縱', '橫', '長軸', '短軸', '寬面', '窄面', '正', '反',
  '表面', '內部', '外部', '環境', '製造商', '直到', '之前', '之後', '試驗後', '循環壽命', '靜置',
];

/**
 * 取出文字中的「數值＋單位」與意義標記，排序後串成指紋。
 * 沒有任何數值時回傳空字串（純文字無法用指紋判斷同義）。
 */
export function numericSignature(value) {
  const text = String(value ?? '').normalize('NFKC').replace(/\s+/g, '').replace(/℃/g, '°C').replace(/[~〜～]/g, '~');
  // 括號內多半是補充說明（英制換算、掃頻範圍、依據）：數值只取括號外的，限定詞仍看全文。
  const outside = text.replace(/\([^()]*\)/g, ' ');
  const main = /\d/.test(outside) ? outside : text;
  const quantities = new Set();
  let rest = text;
  for (const m of main.matchAll(QUANT)) {
    const unit = (m[3] || '').toLowerCase();
    quantities.add(m[2] ? `${num(m[1])}±${num(m[2])}${unit}` : `${num(m[1])}${unit}`);
    rest = rest.replace(m[0], ' ');
  }
  if (!quantities.size) return '';
  const marks = [];
  // 「大於／小於」是「不大於／不小於」的子字串，先扣掉較長的詞再數。
  let scan = main;
  for (const [name, re] of MARKERS) {
    const hits = scan.match(re);
    if (hits) marks.push(name === '範圍' ? name : `${name}${hits.length}`);
    scan = scan.replace(re, ' ');
  }
  const quals = QUALIFIERS.filter(q => rest.includes(q));
  return [[...quantities].sort().join('|'), marks.join(''), quals.join(',')].join('#');
}

// 人工審閱過的同義寫法（純文字或指紋判不出來的），每一組內的寫法視為同義。
const EQUIVALENT_CLASS = new Map();
EQUIVALENTS.classes.forEach((group, i) => group.forEach(text => EQUIVALENT_CLASS.set(normalizeForCompare(text), i)));

function wordingKey(value) {
  const norm = normalizeForCompare(value);
  if (EQUIVALENT_CLASS.has(norm)) return `eq:${EQUIVALENT_CLASS.get(norm)}`;
  const sig = numericSignature(value);
  return sig ? `sig:${sig}` : `txt:${norm}`;
}

const signatureOf = (cell, fn) => [...new Set(cell.map(e => fn(e.value)))].sort().join('\u0000');

/** 一列的 state 與 tier。cells：每份標準一個陣列，元素為 { value }。 */
export function judgeRow(cells) {
  const specified = cells.filter(cell => cell.length > 0);
  if (specified.length === 0) return { state: 'none', tier: 'none' };
  if (specified.length < 2) return { state: 'only', tier: 'only' };
  const strict = new Set(specified.map(cell => signatureOf(cell, normalizeForCompare)));
  if (strict.size === 1) return { state: 'same', tier: 'same' };
  const loose = new Set(specified.map(cell => signatureOf(cell, wordingKey)));
  return { state: 'diff', tier: loose.size === 1 ? 'wording' : 'differ' };
}

// ───────── 對齊的列 ─────────

/**
 * columns: [{ docId, records: [test], status: 'ok' | 'uncovered' | 'na' }]
 * 回傳 { technical, procedure, criteria, counts }。
 * 每個 cell 元素：{ testId, param, clause, value, detail, source }。
 */
export function buildRows(columns) {
  const rows = new Map();
  columns.forEach((col, ci) => {
    col.records.forEach(rec => {
      Object.entries(rec.conditions || {}).forEach(([rawKey, raw]) => {
        const { value, detail, source_reference } = splitConditionValue(raw);
        if (!value && !detail) return;
        const key = canonicalKey(rawKey);
        if (!rows.has(key)) rows.set(key, { key, ...getParameterMeta(key), cells: columns.map(() => []) });
        rows.get(key).cells[ci].push({
          testId: rec.id,
          param: rawKey,
          clause: rec.section,
          value: value || detail,
          detail: value ? detail : '',
          source: source_reference,
        });
      });
    });
  });

  const judged = [...rows.values()]
    .map(row => ({ ...row, ...judgeRow(row.cells) }))
    .sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label, 'zh-Hant'));

  const technical = judged.filter(r => r.category !== 'procedure');
  const procedure = judged.filter(r => r.category === 'procedure');
  const criteria = columns.map(col => col.records.map(rec => ({
    testId: rec.id,
    clause: rec.section,
    summary: toText(rec.acceptance_criteria?.summary),
    details: Array.isArray(rec.acceptance_criteria?.details)
      ? rec.acceptance_criteria.details.map(toText).filter(Boolean)
      : [],
  })).filter(e => e.summary));

  const counts = { differ: 0, wording: 0, same: 0, only: 0 };
  technical.forEach(r => { counts[r.tier] += 1; });
  return { technical, procedure, criteria, counts };
}

/**
 * 整個比對畫面的資料。
 * selected: 基準代號陣列；library: { catalog, docs, taxonomy }；
 * view: { levels: [], category, versions: { baseId: docId } }
 */
export function buildComparison(selected, library, view) {
  const { catalog, docs, taxonomy } = library;
  const names = new Map((taxonomy?.test_types || []).map(t => [t.normalized_id, t.name_zh]));
  const baseOf = d => d.base_standard_id || d.document_id;

  const columns = selected.map(baseId => {
    const versions = catalog
      .filter(c => baseOf(c) === baseId)
      .sort((a, b) => String(b.publication_date).localeCompare(String(a.publication_date)));
    const active = versions.find(v => v.document_id === view.versions?.[baseId]) || versions[0];
    const tests = docs[active?.document_id]?.tests || [];
    return { baseId, doc: active, versions, tests, loaded: Boolean(docs[active?.document_id]) };
  });

  const groups = new Map();
  columns.forEach((col, ci) => {
    col.tests.forEach(test => {
      const key = test.normalized_id || `id:${test.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name: cleanTestName(names.get(test.normalized_id) || test.name_zh || test.id),
          category: categoryOf(test),
          byColumn: columns.map(() => []),
        });
      }
      groups.get(key).byColumn[ci].push(test);
    });
  });

  const inLevel = t => (t.test_objects || []).some(o => view.levels.includes(o));
  const result = [...groups.values()].map(group => {
    const cols = group.byColumn.map((all, ci) => {
      const records = all.filter(inLevel);
      return { docId: columns[ci].doc?.document_id, records, status: records.length ? 'ok' : (all.length ? 'na' : 'uncovered') };
    });
    return { ...group, cols, ...buildRows(cols) };
  })
    .filter(g => g.cols.some(c => c.status === 'ok'))
    .filter(g => !view.category || view.category === 'ALL' || g.category === view.category)
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name, 'zh-Hant'));

  const columnStats = columns.map((col, ci) => {
    let values = 0;
    let cited = 0;
    let tests = 0;
    result.forEach(g => {
      if (g.cols[ci].status === 'ok') tests += 1;
      [...g.technical, ...g.procedure].forEach(r => r.cells[ci].forEach(e => { values += 1; if (e.source) cited += 1; }));
    });
    return { tests, values, cited };
  });

  return { columns, groups: result, columnStats };
}

/** 出處覆蓋率：一份標準的條件值中有 source_reference 的比例。 */
export function citationCoverage(doc) {
  let total = 0;
  let cited = 0;
  (doc?.tests || []).forEach(t => Object.values(t.conditions || {}).forEach(raw => {
    const { value, detail, source_reference } = splitConditionValue(raw);
    if (!value && !detail) return;
    total += 1;
    if (source_reference) cited += 1;
  }));
  return { total, cited, ratio: total ? cited / total : 0 };
}

// ───────── CSV ─────────

const TIER_TEXT = { differ: '差異', wording: '寫法不同', same: '相同', only: '僅一份規定', none: '' };
const csvCell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function comparisonToCsv(comparison) {
  const heads = ['測試項目', '參數', '判定'];
  comparison.columns.forEach(c => heads.push(c.doc.display_name || c.baseId, `${c.doc.display_name || c.baseId} 出處`));
  const lines = [heads.map(csvCell).join(',')];
  const emptyText = { uncovered: '未涵蓋此測試', na: '此層級不適用', ok: '未規定' };
  comparison.groups.forEach(g => {
    [...g.technical, ...g.procedure].forEach(row => {
      const line = [g.name, row.label, TIER_TEXT[row.tier]];
      row.cells.forEach((cell, ci) => {
        if (!cell.length) { line.push(emptyText[g.cols[ci].status], ''); return; }
        line.push(cell.map(e => e.value).join('；'), cell.map(e => e.source).filter(Boolean).join('；'));
      });
      lines.push(line.map(csvCell).join(','));
    });
    const line = [g.name, '判定要求', ''];
    g.criteria.forEach((list, ci) => {
      line.push(list.length ? list.map(e => e.summary).join('；') : emptyText[g.cols[ci].status], list.map(e => e.clause).filter(Boolean).join('；'));
    });
    lines.push(line.map(csvCell).join(','));
  });
  return `\uFEFF${lines.join('\r\n')}`;
}
