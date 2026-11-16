import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { Modal } from '../lib/ui';
import { getOrgColor } from '../utils/orgColors';
import { buildIndex, search, makeHighlighter, SEARCH_EXAMPLES } from '../utils/search';
import { standardsOf, titleOf } from '../lib/library';
import { cleanTestName } from '../lib/compare';
import { MAX_COMPARE } from '../lib/url';

const LIMIT = 40;

function Marked({ text, highlight }) {
  return highlight(text).map((seg, i) => (seg.hit ? <mark key={i}>{seg.text}</mark> : <span key={i}>{seg.text}</span>));
}

/** 全站唯一的搜尋：標準、測試項目、數值加單位。Enter 查閱，⌘/Ctrl+Enter 加入比對。 */
export default function Palette({ library, ready, selected, onClose, onOpenTest, onOpenStandard, onToggle, onAskAi }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef(null);

  const standards = useMemo(() => standardsOf(library.catalog), [library.catalog]);
  const index = useMemo(
    () => buildIndex(standards.map(s => ({ id: s.baseId, doc: s.latest, data: library.docs[s.latest.document_id] })).filter(s => s.data)),
    [standards, library.docs]
  );
  const q = query.trim();
  const highlight = useMemo(() => makeHighlighter(q), [q]);
  const stdHits = useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase().replace(/[\s-]/g, '');
    return standards.filter(s => `${s.baseId}${titleOf(s.latest, library.docs[s.latest.document_id])}`.toLowerCase().replace(/[\s-]/g, '').includes(needle)).slice(0, 5);
  }, [q, standards, library.docs]);
  const results = useMemo(() => (q ? search(index, q, { limit: LIMIT }) : []), [index, q]);

  const items = [
    ...stdHits.map(s => ({ kind: 'std', key: `s:${s.baseId}`, std: s })),
    ...results.map(r => ({ kind: 'test', key: `t:${r.item.doc.document_id}:${r.item.id}`, result: r })),
  ];
  const active = Math.min(cursor, Math.max(0, items.length - 1));

  useEffect(() => { listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }); }, [active, q]);

  const open = (item) => {
    if (item.kind === 'std') onOpenStandard(item.std.latest.document_id);
    else onOpenTest(item.result.item.doc.document_id, item.result.item.id);
  };
  const add = (item) => {
    const baseId = item.kind === 'std' ? item.std.baseId : item.result.item.baseId;
    if (!selected.includes(baseId) && selected.length < MAX_COMPARE) onToggle(baseId);
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(Math.min(active + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter' && items[active]) {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) add(items[active]); else open(items[active]);
    }
  };

  return (
    <Modal onClose={onClose} label="搜尋" className="v-palette">
      <div className="v-palette-input">
        <Icon name="search" size={18} />
        <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setCursor(0); }} onKeyDown={onKeyDown}
          placeholder="標準、測試項目或數值，例如「過充 6V」" aria-label="搜尋" />
        <kbd>Esc</kbd>
      </div>

      <div ref={listRef} className="v-palette-list">
        {!q && (
          <div className="v-palette-hint">
            <p>可同時輸入多個詞；數值請連同單位（6V、80mΩ、7天）。</p>
            <div>{SEARCH_EXAMPLES.map(ex => <button key={ex.query} type="button" className="v-chip" onClick={() => setQuery(ex.query)}>{ex.query}</button>)}</div>
          </div>
        )}
        {q && !ready && <p className="v-toc-note">資料載入中…</p>}
        {q && ready && items.length === 0 && (
          <div className="v-palette-hint">
            <p>找不到符合「{q}」的標準或測試。</p>
            <div><button type="button" className="v-chip" onClick={() => onAskAi(q)}><Icon name="sparkles" size={13} />改問 AI 小幫手</button></div>
          </div>
        )}
        {items.map((item, i) => {
          const baseId = item.kind === 'std' ? item.std.baseId : item.result.item.baseId;
          const isOn = selected.includes(baseId);
          return (
            <div key={item.key} className={`v-hit${i === active ? ' is-active' : ''}`} onMouseMove={() => setCursor(i)}>
              <button type="button" className="v-hit-main" onClick={() => open(item)}>
                <i style={{ background: getOrgColor(baseId).solid }} />
                {item.kind === 'std' ? (
                  <span className="v-hit-text">
                    <strong><Marked text={baseId} highlight={highlight} /></strong>
                    <span className="v-hit-sub"><Marked text={titleOf(item.std.latest, library.docs[item.std.latest.document_id])} highlight={highlight} /></span>
                  </span>
                ) : (
                  <span className="v-hit-text">
                    <strong>{baseId}<em>§ {item.result.item.section}</em><Marked text={cleanTestName(item.result.item.nameZh)} highlight={highlight} /></strong>
                    {[...item.result.hits.slice(0, 3).map(h => [h.label, h.text]), ...item.result.accept.slice(0, 1).map(t => ['判定要求', t])].map(([label, text], k) => (
                      <span key={k} className="v-hit-sub"><b>{label}</b><Marked text={text} highlight={highlight} /></span>
                    ))}
                  </span>
                )}
              </button>
              <button type="button" className={`v-hit-add${isOn ? ' is-on' : ''}`} onClick={() => onToggle(baseId)} disabled={!isOn && selected.length >= MAX_COMPARE}
                aria-label={isOn ? `取消比對 ${baseId}` : `把 ${baseId} 加入比對`}>
                <Icon name={isOn ? 'check' : 'plus'} size={13} />{isOn ? '已選' : '比對'}
              </button>
            </div>
          );
        })}
        {results.total > LIMIT && <p className="v-toc-note">共 {results.total} 筆，僅列出前 {LIMIT} 筆；請加上更多關鍵字。</p>}
      </div>

      <footer className="v-palette-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd>選擇</span><span><kbd>Enter</kbd>查閱</span><span><kbd>⌘</kbd><kbd>Enter</kbd>加入比對</span>
      </footer>
    </Modal>
  );
}
