// 畫面狀態 <-> 網址。
//   比對：?c=A,B,C&lv=CELL,MODULE&cat=ELEC&diff=1&v=UL1642:UL1642-2022（與舊版相容）
//   查閱：?doc=UL1642-2022&test=UL1642-T10（doc 可省略；可與比對參數並存）
import { baseOf } from './library.js';
import { LEVELS } from './compare.js';

export const MAX_COMPARE = 5;
export const DEFAULT_VIEW = { levels: ['CELL'], category: 'ALL', diffOnly: false, versions: {} };

const list = (text) => (text ? text.split(',').map(decodeURIComponent).filter(Boolean) : []);
const join = (items) => items.map(encodeURIComponent).join(',');

export function parseUrl(search, catalog) {
  const q = new URLSearchParams(search);
  const bases = new Set(catalog.map(baseOf));
  const state = { mode: 'home', selected: [], view: { ...DEFAULT_VIEW, versions: {} }, viewer: null };

  if (q.has('c')) {
    state.selected = [...new Set(list(q.get('c')))].filter(id => bases.has(id)).slice(0, MAX_COMPARE);
    if (state.selected.length >= 2) state.mode = 'compare';
    if (q.has('lv')) {
      const levels = list(q.get('lv')).filter(l => LEVELS.includes(l));
      if (levels.length) state.view.levels = levels;
    }
    if (q.get('cat')) state.view.category = q.get('cat');
    state.view.diffOnly = q.get('diff') === '1';
    list(q.get('v')).forEach(pair => {
      const [base, docId] = pair.split(':');
      const ok = catalog.some(c => c.document_id === docId && baseOf(c) === base);
      if (ok && state.selected.includes(base)) state.view.versions[base] = docId;
    });
  }
  if (q.get('doc') || q.get('test')) state.viewer = { docId: q.get('doc') || '', testId: q.get('test') || '' };
  return state;
}

export function buildUrl({ mode, selected, view, viewer }) {
  const parts = [];
  if (mode === 'compare') {
    parts.push(`c=${join(selected)}`, `lv=${join(view.levels)}`);
    if (view.category !== 'ALL') parts.push(`cat=${encodeURIComponent(view.category)}`);
    if (view.diffOnly) parts.push('diff=1');
    const versions = Object.entries(view.versions || {}).filter(([base]) => selected.includes(base));
    if (versions.length) parts.push(`v=${versions.map(([b, d]) => `${encodeURIComponent(b)}:${encodeURIComponent(d)}`).join(',')}`);
  }
  if (viewer?.docId) parts.push(`doc=${encodeURIComponent(viewer.docId)}`);
  if (viewer?.testId) parts.push(`test=${encodeURIComponent(viewer.testId)}`);
  return parts.length ? `/?${parts.join('&')}` : '/';
}
