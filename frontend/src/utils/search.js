// 全域檢索：純函式，不依賴 DOM，可在 node 直接執行（scripts/check_search.mjs 會用到）。
//
// 重點：
//   1. 數值查詢（6V、3C、80mΩ、13kN、1m、7天）比對「同單位且數值相等」的量，
//      不做子字串比對，所以 6V 命中 6.0 V，但不命中 16 V；1m 不命中 1 mm、10 m。
//   2. 單一字元的詞（V、m、C）不當獨立詞比對。
//   3. 多詞為 AND，且必須落在同一個測試內。
//   4. 排序：命中測試名稱 > 命中參數值 > 命中標準名。
import { getParameterMeta, canonicalKey } from './parameterDictionary.js';

// ───────── 正規化 ─────────

// 單位表：canon 為內部代號，aliases 為正規化後（NFKC、小寫）的寫法，
// raw 為 highlight 用的原文寫法（正規表示式片段）。
const UNIT_DEFS = [
  { canon: 'v', aliases: ['v', '伏'] },
  { canon: 'mv', aliases: ['mv'] },
  { canon: 'kv', aliases: ['kv'] },
  { canon: 'a', aliases: ['a', '安'] },
  { canon: 'ma', aliases: ['ma'] },
  { canon: 'ω', aliases: ['ω', 'ohm', 'ohms', '歐姆', '歐'] },
  { canon: 'mω', aliases: ['mω', 'mohm', '毫歐'] },
  { canon: 'kω', aliases: ['kω', 'kohm'] },
  { canon: 'c', aliases: ['c'] },
  { canon: '°c', aliases: ['°c', '度'] },
  { canon: '°f', aliases: ['°f'] },
  { canon: 'h', aliases: ['h', 'hr', 'hrs', 'hour', 'hours', '小時', '小时'] },
  { canon: 'min', aliases: ['min', 'mins', '分鐘', '分钟'] },
  { canon: 's', aliases: ['s', 'sec', 'secs', '秒'] },
  { canon: 'ms', aliases: ['ms'] },
  { canon: 'd', aliases: ['d', 'day', 'days', '天', '日'] },
  { canon: 'mm', aliases: ['mm'] },
  { canon: 'cm', aliases: ['cm'] },
  { canon: 'm', aliases: ['m'] },
  { canon: 'km', aliases: ['km'] },
  { canon: 'mm/s', aliases: ['mm/s'] },
  { canon: 'm/s', aliases: ['m/s'] },
  { canon: 'mm/min', aliases: ['mm/min'] },
  { canon: '°c/min', aliases: ['°c/min', '°c/分鐘'] },
  { canon: 'kg', aliases: ['kg'] },
  { canon: 'g', aliases: ['g'] },
  { canon: 'mg', aliases: ['mg'] },
  { canon: 'gn', aliases: ['gn'] },
  { canon: 'n', aliases: ['n', '牛頓'] },
  { canon: 'kn', aliases: ['kn'] },
  { canon: 'hz', aliases: ['hz'] },
  { canon: 'khz', aliases: ['khz'] },
  { canon: 'pa', aliases: ['pa'] },
  { canon: 'kpa', aliases: ['kpa'] },
  { canon: 'mpa', aliases: ['mpa'] },
  { canon: '%', aliases: ['%'] },
  { canon: 'wh', aliases: ['wh'] },
  { canon: 'kwh', aliases: ['kwh'] },
  { canon: 'ah', aliases: ['ah'] },
  { canon: 'mah', aliases: ['mah'] },
  { canon: 'w', aliases: ['w'] },
  { canon: 'kw', aliases: ['kw'] },
  { canon: 'j', aliases: ['j'] },
  { canon: 'kj', aliases: ['kj'] },
  { canon: '次', aliases: ['次'] },
  { canon: '個', aliases: ['個', '个'] },
  { canon: '顆', aliases: ['顆', '颗'] },
  { canon: '組', aliases: ['組', '组'] },
];

const UNIT_LOOKUP = new Map();
for (const { canon, aliases } of UNIT_DEFS) for (const a of aliases) UNIT_LOOKUP.set(a, canon);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// 較長的寫法優先，避免 mm 被當成 m。
const UNIT_ALTS = [...UNIT_LOOKUP.keys()].sort((a, b) => b.length - a.length).map(escapeRe).join('|');
// 單位後面不可再接字母（m 不能吃掉 mm 的第一個字、c 不能吃掉 cm）。
const AFTER_UNIT = '(?![a-zμω°])';
const NUM = '\\d+(?:\\.\\d+)?';

export function normalize(input) {
  let s = String(input ?? '').normalize('NFKC').toLowerCase();
  s = s.replace(/µ/g, 'μ');
  // 數字與單位之間的空白一律移除：「6.0 V」→「6.0v」、「7 天」→「7天」。
  s = s.replace(/(\d)\s+(?=[a-zμω°%一-鿿])/g, '$1');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// 從已正規化的文字取出所有「數值＋單位」。
const QUANT_RE = new RegExp(
  `(?<![\\d./a-z])(${NUM})(?:\\s*±\\s*${NUM})?(?:\\s*[~～至]\\s*(${NUM}))?\\s*(${UNIT_ALTS})${AFTER_UNIT}`,
  'g'
);

export function extractQuantities(normText) {
  const out = [];
  QUANT_RE.lastIndex = 0;
  let m;
  while ((m = QUANT_RE.exec(normText))) {
    const unit = UNIT_LOOKUP.get(m[3]);
    out.push({ v: parseFloat(m[1]), u: unit });
    if (m[2]) out.push({ v: parseFloat(m[2]), u: unit });
  }
  return out;
}

// ───────── 查詢解析 ─────────

const QUERY_TOKEN_QUANT = new RegExp(`^(${NUM})(${UNIT_ALTS})$`);
const QUERY_TOKEN_NUM = new RegExp(`^${NUM}$`);

export function parseQuery(query) {
  let s = normalize(query);
  // 「過充6v」「3c充電」這類沒有空格的寫法：在中文與「數字＋拉丁單位」交界補空格。
  s = s.replace(/([一-鿿])(?=\d)/g, '$1 ');
  s = s.replace(/(\d+(?:\.\d+)?[a-zμω°%]+)(?=[一-鿿])/g, '$1 ');
  const terms = [];
  const ignored = [];
  for (const tok of s.split(/\s+/).filter(Boolean)) {
    const q = tok.match(QUERY_TOKEN_QUANT);
    if (q) {
      terms.push({ type: 'quant', raw: tok, v: parseFloat(q[1]), numStr: q[1], u: UNIT_LOOKUP.get(q[2]), unitStr: q[2] });
    } else if (QUERY_TOKEN_NUM.test(tok)) {
      terms.push({ type: 'num', raw: tok, v: parseFloat(tok), numStr: tok });
    } else if ([...tok].length < 2) {
      ignored.push(tok);
    } else {
      terms.push({ type: 'text', raw: tok });
    }
  }
  return { terms, ignored };
}

// ───────── 索引 ─────────

function condParts(raw) {
  if (raw == null) return { value: '', detail: '' };
  if (typeof raw === 'string' || typeof raw === 'number') return { value: String(raw), detail: '' };
  return {
    value: raw.value == null ? '' : String(raw.value),
    detail: raw.detail == null ? '' : String(raw.detail),
  };
}

function acceptanceTexts(ac) {
  if (!ac || typeof ac !== 'object') return [];
  const out = [];
  if (ac.summary) out.push(String(ac.summary));
  if (Array.isArray(ac.details)) {
    for (const d of ac.details) {
      if (typeof d === 'string') out.push(d);
      else if (d && typeof d === 'object') out.push(String(d.rule_zh || d.rule_en || ''));
    }
  }
  return out.filter(Boolean);
}

/**
 * standards: [{ id, doc, data }]  id 為標準代號，doc 為 catalog 項目，data 為標準 JSON（含 tests）。
 */
export function buildIndex(standards) {
  const items = [];
  for (const std of standards) {
    const baseId = std.id;
    const doc = std.doc || {};
    const tests = std.data?.tests || std.data?.test_items || [];
    const stdText = [baseId, doc.full_name, doc.full_name_zh, doc.display_name, doc.application].filter(Boolean).join(' ');
    const stdNorm = normalize(stdText);

    tests.forEach((t, idx) => {
      const fields = [];
      const seen = new Map();
      for (const [rawKey, raw] of Object.entries(t.conditions || {})) {
        const { value, detail } = condParts(raw);
        if (!value && !detail) continue;
        const key = canonicalKey(rawKey);
        const label = getParameterMeta(rawKey).label;
        const text = detail && detail !== value ? `${value} ${detail}` : value;
        const norm = normalize(text);
        const f = {
          key, label, value, detail,
          procedure: getParameterMeta(rawKey).category === 'procedure',
          labelNorm: normalize(label),
          valueNorm: normalize(value),
          norm,
          quants: extractQuantities(norm),
        };
        // 同義欄位（temp 與 temperature）合併成一個，避免同一個值出現兩次。
        if (seen.has(key)) {
          const prev = seen.get(key);
          if (prev.value === value && prev.detail === detail) continue;
        }
        seen.set(key, f);
        fields.push(f);
      }
      const accTexts = acceptanceTexts(t.acceptance_criteria);
      const accept = accTexts.length
        ? { texts: accTexts, norm: normalize(accTexts.join(' ')), quants: extractQuantities(normalize(accTexts.join(' '))) }
        : null;

      const nameNorm = normalize(`${t.name_zh || ''} ${t.name_en || ''}`);
      const subNorm = normalize(`${t.subcategory || ''} ${t.section || ''}`);
      items.push({
        id: t.id || `${baseId}-${t.section || idx}`,
        baseId,
        doc,
        application: doc.application || '',
        section: t.section ? String(t.section) : '',
        nameZh: t.name_zh || '',
        nameEn: t.name_en || '',
        objects: Array.isArray(t.test_objects) ? t.test_objects : [],
        nameNorm,
        subNorm,
        stdNorm,
        fields,
        accept,
      });
    });
  }
  return items;
}

// ───────── 比對 ─────────

const W_NAME = 100;
const W_SUB = 40;
const W_QUANT = 14;
const W_FIELD = 10;
const W_PROC = 5; // 樣品數量、前置處理、觀察期：多為通用補強值，相關度較低
const W_ACCEPT = 6;
const W_LABEL = 3;
const W_STD = 1;

const sameNum = (a, b) => Math.abs(a - b) < 1e-9;

function quantHit(quants, term) {
  return quants.some((q) => sameNum(q.v, term.v) && (term.type === 'num' || q.u === term.u));
}

function fieldHit(f, term) {
  if (term.type === 'text') return f.norm.includes(term.raw);
  return quantHit(f.quants, term);
}

function matchItem(item, terms) {
  let score = 0;
  let allName = true;
  const hits = new Map(); // field → { count, quant }：只記沒被測試名稱涵蓋的詞，用來決定顯示哪些命中欄位
  let acceptHit = false;

  for (const term of terms) {
    let best = 0;

    if (term.type === 'text') {
      if (item.nameNorm.includes(term.raw)) best = W_NAME;
      else allName = false;
      if (best < W_SUB && item.subNorm.includes(term.raw)) best = W_SUB;
    } else {
      allName = false;
      if (term.type === 'num' && item.section && (item.section === term.numStr || item.section.startsWith(`${term.numStr}.`))) best = W_SUB;
    }

    const nameCovered = best === W_NAME;
    for (const f of item.fields) {
      if (fieldHit(f, term)) {
        if (!nameCovered) {
          const h = hits.get(f) || { count: 0, quant: false };
          h.count += 1;
          h.quant = h.quant || term.type !== 'text';
          hits.set(f, h);
        }
        const w = f.procedure ? W_PROC : term.type === 'text' ? W_FIELD : W_QUANT;
        if (w > best) best = w;
      } else if (term.type === 'text' && best < W_LABEL && f.labelNorm.includes(term.raw)) {
        best = W_LABEL;
      }
    }

    if (item.accept) {
      const ok = term.type === 'text' ? item.accept.norm.includes(term.raw) : quantHit(item.accept.quants, term);
      if (ok) {
        if (!nameCovered) acceptHit = true;
        if (W_ACCEPT > best) best = W_ACCEPT;
      }
    }

    if (best < W_STD && (term.type === 'text' || (term.type === 'num' && term.raw.length >= 3))) {
      if (item.stdNorm.includes(term.raw)) best = W_STD;
    }

    if (best === 0) return null;
    score += best;
  }
  if (allName && terms.length > 1) score += 50;
  const hitFields = [...hits.entries()]
    .sort((a, b) => Number(b[1].quant) - Number(a[1].quant) || b[1].count - a[1].count)
    .map(([f]) => f);
  return { score, hitFields, acceptHit };
}

function snippet(f, terms, highlight) {
  // 優先顯示命中的那一段；值沒命中就顯示說明文字。
  const valueHit = terms.some((t) => (t.type === 'text' ? f.valueNorm.includes(t.raw) : quantHit(extractQuantities(f.valueNorm), t)));
  const text = valueHit || !f.detail ? f.value : f.detail;
  return clip(text, highlight);
}

const CLIP = 90;
// 太長時以第一個命中處為中心截取，避免命中的字被切掉。
function clip(text, highlight) {
  if (text.length <= CLIP) return text;
  let off = 0;
  for (const seg of highlight(text)) {
    if (seg.hit) break;
    off += seg.text.length;
  }
  const start = Math.max(0, Math.min(off - 30, text.length - CLIP));
  const end = Math.min(text.length, start + CLIP);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

/**
 * 回傳依相關度排序的結果陣列，另附 results.total（未截斷的總數）。
 * 每筆：{ item, score, hits: [{ label, text }], accept: string[] }
 */
export function search(index, query, { limit = 50 } = {}) {
  const { terms } = parseQuery(query);
  const highlight = makeHighlighter(query);
  const results = [];
  results.total = 0;
  if (!terms.length) return results;

  const scored = [];
  for (const item of index) {
    const m = matchItem(item, terms);
    if (m) scored.push({ item, ...m });
  }
  scored.sort((a, b) => b.score - a.score || a.item.baseId.localeCompare(b.item.baseId, 'en', { numeric: true }) || a.item.section.localeCompare(b.item.section, 'en', { numeric: true }));
  results.total = scored.length;

  for (const s of scored.slice(0, limit)) {
    results.push({
      item: s.item,
      score: s.score,
      hits: s.hitFields.map((f) => ({ label: f.label, text: snippet(f, terms, highlight) })),
      accept: s.acceptHit ? s.item.accept.texts.filter((t) => {
        const n = normalize(t);
        return terms.some((term) => (term.type === 'text' ? n.includes(term.raw) : quantHit(extractQuantities(n), term)));
      }) : [],
    });
  }
  return results;
}

// ───────── 命中片段標示 ─────────

// 數值寫法：6 可對應 6.0；0.5 可對應 .5 與 0.50。
function numPattern(numStr) {
  const [i, f] = numStr.split('.');
  return f ? `${escapeRe(i)}\\.${escapeRe(f)}0*` : `${escapeRe(i)}(?:\\.0+)?`;
}

// 原文單位寫法（含 ℃、Ω 等相容字元），與 normalize 的對應一致。
const RAW_UNIT_EXTRA = { '°c': ['\u2103'], 'ω': ['\u2126', '\u03a9'], 'mω': ['m\u2126', 'm\u03a9'], 'kω': ['k\u2126', 'k\u03a9'] };

/**
 * 回傳 (text) → [{ text, hit }]，供畫面把命中的字標示出來。
 */
export function makeHighlighter(query) {
  const { terms } = parseQuery(query);
  const parts = [];
  for (const t of terms) {
    if (t.type === 'text') {
      parts.push(escapeRe(t.raw));
    } else if (t.type === 'quant') {
      const alts = [];
      for (const [alias, canon] of UNIT_LOOKUP) if (canon === t.u) alts.push(alias, ...(RAW_UNIT_EXTRA[alias] || []));
      alts.sort((a, b) => b.length - a.length);
      parts.push(`(?<![\\d./])${numPattern(t.numStr)}(?:\\s*±\\s*${NUM})?\\s*(?:${alts.map(escapeRe).join('|')})${AFTER_UNIT}`);
    } else {
      parts.push(`(?<![\\d./])${numPattern(t.numStr)}(?!\\d)`);
    }
  }
  if (!parts.length) return (text) => [{ text: String(text ?? ''), hit: false }];
  const re = new RegExp(parts.join('|'), 'gi');
  return (text) => {
    const s = String(text ?? '');
    const out = [];
    let last = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(s))) {
      if (!m[0]) { re.lastIndex++; continue; }
      if (m.index > last) out.push({ text: s.slice(last, m.index), hit: false });
      out.push({ text: m[0], hit: true });
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push({ text: s.slice(last), hit: false });
    return out.length ? out : [{ text: s, hit: false }];
  };
}

// ───────── 範例 ─────────
// 每一個都由 scripts/check_search.mjs 驗證：至少有一筆結果，且第一筆的名稱或命中參數含有 expect 內的每個詞。
export const SEARCH_EXAMPLES = [
  { query: '過充 6V', expect: ['過充', '6.0 V'] },
  { query: '擠壓 13kN', expect: ['擠壓', '13'] },
  { query: '外部短路 80mΩ', expect: ['短路', '80'] },
  { query: '跌落 1m', expect: ['跌落', '1'] },
  { query: '7天', expect: ['7 天'] },
  { query: '針刺 1小時', expect: ['針刺', '1 小時'] },
];
