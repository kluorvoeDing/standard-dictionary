import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from './Icon';
import { getOrgColor, levelLabel } from '../utils/orgColors';
import { getParameterMeta } from '../utils/parameterDictionary';
import { buildIndex, search, makeHighlighter, SEARCH_EXAMPLES } from '../utils/search';
import '../styles/search.css';

const MAX_COMPARE = 5;
const RESULT_LIMIT = 50;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
const ADD_KEYS = isMac ? '⌘Enter' : 'Ctrl+Enter';

// 標準 JSON 只載入一次，關閉再開啟不用重抓。
let standardsCache = null;
let standardsPromise = null;

function loadStandards(catalog) {
  if (standardsCache) return Promise.resolve(standardsCache);
  if (standardsPromise) return standardsPromise;

  const byBase = new Map();
  catalog.forEach((doc) => {
    const id = doc.base_standard_id || doc.document_id;
    const cur = byBase.get(id);
    if (!cur || (doc.is_latest && !cur.is_latest) || doc.publication_date > cur.publication_date) byBase.set(id, doc);
  });
  const docs = [...byBase.values()].filter((d) => d.schema_v2_json);

  standardsPromise = Promise.all(
    docs.map((doc) =>
      fetch(`/${doc.schema_v2_json}?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => ({ id: doc.base_standard_id || doc.document_id, doc, data }))
        .catch((err) => {
          console.warn('Failed to fetch', doc.schema_v2_json, err);
          return null;
        })
    )
  ).then((all) => {
    const ok = all.filter(Boolean);
    if (ok.length) standardsCache = ok;
    standardsPromise = null;
    return ok;
  });
  return standardsPromise;
}

// 資料中的名稱常帶英文括號（「過充電 (Over-Charging)」），畫面只留中文。
const zhName = (item) => item.nameZh.replace(/\s*[(（][A-Za-z][^)）]*[)）]\s*$/, '') || item.nameZh || item.nameEn;

// 只在開啟時才掛載內容，每次開啟都是乾淨的狀態。
export default function GlobalSearchModal(props) {
  return props.isOpen ? <SearchPanel {...props} /> : null;
}

function SearchPanel({
  onClose,
  catalog,
  selectedDocs,
  toggleDocument,
  onAskAi,
}) {
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [standards, setStandards] = useState(standardsCache || []);
  const [loading, setLoading] = useState(!standardsCache);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notice, setNotice] = useState('');

  // 載入全部標準
  useEffect(() => {
    if (standards.length > 0 || catalog.length === 0) return;
    let alive = true;
    loadStandards(catalog).then((list) => {
      if (!alive) return;
      setStandards(list);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [catalog, standards.length]);

  const index = useMemo(() => buildIndex(standards), [standards]);
  const results = useMemo(() => search(index, query, { limit: RESULT_LIMIT }), [index, query]);
  const highlight = useMemo(() => makeHighlighter(query), [query]);

  const renderHl = useCallback(
    (text) => highlight(text).map((seg, i) => (seg.hit ? <mark key={i} className="hl">{seg.text}</mark> : seg.text)),
    [highlight]
  );

  // 方向鍵移動時，讓選中的項目留在可視範圍內
  useEffect(() => {
    listRef.current?.querySelector('.sr-card.is-selected')?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, results]);

  const addToCompare = useCallback((baseId) => {
    const inList = selectedDocs.includes(baseId);
    if (!inList && selectedDocs.length >= MAX_COMPARE) {
      setNotice(`最多同時比對 ${MAX_COMPARE} 份標準，請先從清單移除一份。`);
      return;
    }
    setNotice('');
    toggleDocument(baseId);
  }, [selectedDocs, toggleDocument]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (!results.length) return;
    const onInput = e.target === inputRef.current;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && onInput) {
      e.preventDefault();
      const cur = results[selectedIndex];
      if (!cur) return;
      if (e.shiftKey || e.metaKey || e.ctrlKey) addToCompare(cur.item.baseId);
      else setExpandedId((id) => (id === cur.item.id ? null : cur.item.id));
    }
  };

  const onCardClick = (idx, id) => {
    // 正在選取文字時不收合，也不搶焦點
    if (window.getSelection()?.toString()) return;
    setSelectedIndex(idx);
    setExpandedId((cur) => (cur === id ? null : id));
    inputRef.current?.focus();
  };

  const hasQuery = query.trim().length > 0;
  const emptyState = loading && standards.length === 0
    ? <div className="sr-state"><span className="sr-spinner" />載入中</div>
    : !loading && standards.length === 0
      ? <div className="sr-state">無法載入標準資料</div>
      : hasQuery && results.length === 0
        ? <div className="sr-state">找不到「{query.trim()}」</div>
        : null;

  return (
    <div className="sr-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="sr-panel" role="dialog" aria-modal="true" aria-label="搜尋" onClick={(e) => e.stopPropagation()}>
        <div className="sr-head">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            className="sr-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); setNotice(''); }}
            placeholder="搜尋測試、參數或標準"
            aria-label="搜尋測試、參數或標準"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="sr-results"
            aria-activedescendant={results[selectedIndex] ? `sr-opt-${selectedIndex}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            autoFocus
          />
          {query && (
            <button className="sr-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="清除搜尋">
              <Icon name="x" size={16} />
            </button>
          )}
          <kbd className="sr-kbd">Esc</kbd>
        </div>

        {notice && <div className="sr-notice" role="status">{notice}</div>}

        {!hasQuery && standards.length > 0 && (
          <div className="sr-examples">
            {SEARCH_EXAMPLES.map((ex) => (
              <button
                key={ex.query}
                className="btn-pill"
                onClick={() => { setQuery(ex.query); setSelectedIndex(0); inputRef.current?.focus(); }}
              >
                {ex.query}
              </button>
            ))}
          </div>
        )}

        <div className="sr-body" ref={listRef}>
          {emptyState}
          {hasQuery && results.length > 0 && (
            <>
              <div className="sr-meta">
                {results.total > results.length ? `共 ${results.total} 筆，顯示前 ${results.length} 筆` : `${results.total} 筆`}
              </div>
              <div className="sr-list" id="sr-results" role="listbox">
                {results.map(({ item, hits, accept }, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isExpanded = expandedId === item.id;
                  const inCompare = selectedDocs.includes(item.baseId);
                  const org = getOrgColor(item.baseId);
                  return (
                    <div
                      key={item.id}
                      id={`sr-opt-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`sr-card${isSelected ? ' is-selected' : ''}`}
                      onClick={() => onCardClick(idx, item.id)}
                    >
                      <div className="sr-top">
                        <div className="sr-title">
                          <span className="sr-id" style={{ '--sr-org': org.solid }}>{item.baseId}</span>
                          <span className="sr-name">
                            {item.section && <span className="sr-sec">{item.section}</span>}
                            {renderHl(zhName(item))}
                          </span>
                          {item.objects.map((o) => <span key={o} className="tag">{levelLabel(o)}</span>)}
                        </div>
                        <div className="sr-actions" onClick={(e) => e.stopPropagation()}>
                          {isSelected && !inCompare && <span className="sr-keyhint">{ADD_KEYS} 加入比對</span>}
                          <button
                            className={`btn-pill${inCompare ? ' is-on' : ''}`}
                            onClick={() => { addToCompare(item.baseId); inputRef.current?.focus(); }}
                          >
                            <Icon name={inCompare ? 'check' : 'plus'} size={13} />
                            {inCompare ? '已加入比對' : '加入比對'}
                          </button>
                          {onAskAi && (
                            <button
                              className="btn-text"
                              onClick={() => {
                                onClose();
                                onAskAi(`請為我深度解析 ${item.baseId} 的第 ${item.section} 節（${item.nameZh}）試驗條件與判定依據。`, [item.baseId]);
                              }}
                            >
                              問 AI
                            </button>
                          )}
                        </div>
                      </div>

                      {(hits.length > 0 || accept.length > 0) && (
                        <div className="sr-hits">
                          {hits.slice(0, 3).map((h, i) => (
                            <div key={i} className="sr-hit">
                              <span className="sr-hit-label">{h.label}</span>
                              {renderHl(h.text)}
                            </div>
                          ))}
                          {accept.slice(0, 1).map((t, i) => (
                            <div key={`a${i}`} className="sr-hit">
                              <span className="sr-hit-label">判定</span>
                              {renderHl(t)}
                            </div>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="sr-detail" onClick={(e) => e.stopPropagation()}>
                          <div className="sr-grid">
                            {[...item.fields]
                              .sort((a, b) => getParameterMeta(a.key).priority - getParameterMeta(b.key).priority)
                              .map((f, i) => (
                                <div key={i} className="sr-cell">
                                  <div className="sr-cell-label">{f.label}</div>
                                  <div>{renderHl(f.value || f.detail)}</div>
                                  {f.value && f.detail && f.detail !== f.value && (
                                    <div className="sr-cell-note">{renderHl(f.detail)}</div>
                                  )}
                                </div>
                              ))}
                          </div>
                          {item.accept && (
                            <div className="sr-accept">
                              <div className="sr-cell-label">判定</div>
                              <ul>{item.accept.texts.map((t, i) => <li key={i}>{renderHl(t)}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
