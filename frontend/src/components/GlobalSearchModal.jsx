import { useState, useEffect, useMemo, useRef } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import Icon from './Icon';
import { getOrgColor } from '../utils/orgColors';
import { getParameterMeta } from '../utils/parameterDictionary';

function normalizeStandardData(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (!Array.isArray(out.tests) && Array.isArray(out.test_items)) {
    out.tests = out.test_items;
  }
  return out;
}

const QUICK_SUGGESTIONS = [
  '過充 6V',
  '3C 充電',
  '7天',
  '13 kN 擠壓',
  '80 mΩ 短路',
  '85 °C 熱濫用',
  '熱失控 蔓延',
  '針刺'
];

export default function GlobalSearchModal({
  isOpen,
  onClose,
  catalog,
  selectedDocs,
  toggleDocument,
  onAskAi
}) {
  const isMobile = useIsMobile();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [allStandardsData, setAllStandardsData] = useState([]);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setExpandedTestId(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Load and cache all standard JSON files once
  useEffect(() => {
    if (!isOpen || allStandardsData.length > 0) return;

    let isMounted = true;
    setLoading(true);

    const loadAll = async () => {
      try {
        const baseMap = new Map();
        catalog.forEach(doc => {
          const baseId = doc.base_standard_id || doc.document_id;
          if (!baseMap.has(baseId)) {
            baseMap.set(baseId, doc);
          } else {
            const existing = baseMap.get(baseId);
            if (doc.is_latest && !existing.is_latest) baseMap.set(baseId, doc);
            else if (doc.publication_date > existing.publication_date) baseMap.set(baseId, doc);
          }
        });

        const uniqueDocs = Array.from(baseMap.values()).filter(d => d.schema_v2_json);

        const promises = uniqueDocs.map(doc =>
          fetch(`/${doc.schema_v2_json}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => ({
              doc,
              baseId: doc.base_standard_id || doc.document_id,
              data: normalizeStandardData(data)
            }))
            .catch(err => {
              console.warn("Failed to fetch", doc.schema_v2_json, err);
              return null;
            })
        );

        const results = await Promise.all(promises);
        if (isMounted) {
          setAllStandardsData(results.filter(Boolean));
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load standards for search:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadAll();

    return () => { isMounted = false; };
  }, [isOpen, catalog, allStandardsData.length]);

  // Flatten tests with pre-computed searchable index
  const flattenedIndex = useMemo(() => {
    if (allStandardsData.length === 0) return [];

    const items = [];

    allStandardsData.forEach(({ doc, baseId, data }) => {
      const tests = data?.tests || [];
      const docFullName = doc.full_name || doc.display_name || '';
      const docFullNameZh = doc.full_name_zh || '';
      const docApp = doc.application || '一般應用 (General)';

      // All text across entire standard for standard-level matching
      let standardCorpus = `${baseId} ${docFullName} ${docFullNameZh} ${docApp} `.toLowerCase();

      tests.forEach(t => {
        standardCorpus += `${t.name_zh || ''} ${t.name_en || ''} ${t.section || ''} `;
        if (t.conditions && typeof t.conditions === 'object') {
          Object.entries(t.conditions).forEach(([k, v]) => {
            if (typeof v === 'string') standardCorpus += `${k} ${v} `;
            else if (v && typeof v === 'object') {
              standardCorpus += `${k} ${v.value || ''} ${v.detail || ''} `;
            }
          });
        }
      });

      tests.forEach((test, idx) => {
        const testId = test.id || `${baseId}-${test.section || idx}`;
        const nameZh = test.name_zh || '';
        const nameEn = test.name_en || '';
        const section = test.section || '';
        const category = test.category || '';
        const subcategory = test.subcategory || '';
        const passSummary = test.acceptance_criteria?.summary || '';
        const passDetails = Array.isArray(test.acceptance_criteria?.details) 
          ? test.acceptance_criteria.details.join(' ') 
          : '';

        // Flatten conditions into searchable tokens and key-value list
        const conditionList = [];
        let conditionsText = '';

        if (test.conditions && typeof test.conditions === 'object') {
          Object.entries(test.conditions).forEach(([key, val]) => {
            let valStr = '';
            let detailStr = '';
            if (typeof val === 'string') {
              valStr = val;
            } else if (val && typeof val === 'object') {
              valStr = val.value || '';
              detailStr = val.detail || '';
            }
            conditionList.push({
              key,
              value: valStr,
              detail: detailStr,
              fullText: `${key} ${valStr} ${detailStr}`.toLowerCase()
            });
            conditionsText += `${key} ${valStr} ${detailStr} `;
          });
        }

        const testCorpus = `${baseId} ${docFullNameZh} ${docFullName} ${section} ${nameZh} ${nameEn} ${category} ${subcategory} ${conditionsText} ${passSummary} ${passDetails}`.toLowerCase();

        items.push({
          id: testId,
          baseId,
          doc,
          docApp,
          docFullNameZh,
          section,
          nameZh,
          nameEn,
          category,
          subcategory,
          conditions: test.conditions,
          conditionList,
          acceptanceCriteria: test.acceptance_criteria,
          testCorpus,
          standardCorpus
        });
      });
    });

    return items;
  }, [allStandardsData]);

  // Search matching and scoring
  const searchResults = useMemo(() => {
    const rawQ = query.trim().toLowerCase();
    if (!rawQ) return [];

    const tokens = rawQ.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    const scored = [];

    flattenedIndex.forEach(item => {
      let testHits = 0;
      let standardHits = 0;
      const matchedConditions = [];

      tokens.forEach(tok => {
        const inTest = item.testCorpus.includes(tok);
        if (inTest) testHits++;

        const inStandard = item.standardCorpus.includes(tok);
        if (inStandard) standardHits++;

        // Find which condition field hit this token
        item.conditionList.forEach(c => {
          if (c.fullText.includes(tok)) {
            if (!matchedConditions.some(m => m.key === c.key)) {
              matchedConditions.push(c);
            }
          }
        });
      });

      // Match evaluation:
      // Option chosen by user: "允許標準跨項目寬鬆匹配：同一標準內任一測試有「過充」且另一測試有「6V」即視為符合，並依匹配相關度排序"
      if (testHits === tokens.length) {
        // Perfect hit inside single test item (highest relevance)
        let score = 200 + (matchedConditions.length * 10);
        if (item.nameZh.toLowerCase().includes(rawQ) || item.section.toLowerCase().includes(rawQ)) score += 50;
        scored.push({ item, score, matchedConditions, isTestLevelMatch: true });
      } else if (standardHits === tokens.length && testHits > 0) {
        // Standard-wide match, and this test item has at least one matching token
        const score = 100 + (testHits * 20) + (matchedConditions.length * 5);
        scored.push({ item, score, matchedConditions, isTestLevelMatch: false });
      }
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [query, flattenedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, searchResults.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (searchResults[selectedIndex]) {
        e.preventDefault();
        const curId = searchResults[selectedIndex].item.id;
        setExpandedTestId(prev => prev === curId ? null : curId);
      }
    }
  };

  if (!isOpen) return null;

  const libraryCount = new Set(catalog.map(c => c.base_standard_id || c.document_id)).size;

  const highlightMatches = (text, q) => {
    if (!text || !q.trim()) return text;
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="hl">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem 0.5rem' : '2rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '840px',
          maxWidth: '100%',
          maxHeight: isMobile ? '92vh' : '85vh',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.2s ease-out'
        }}
      >
        {/* Search Input Header */}
        <div style={{
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          backgroundColor: 'var(--bg-color)'
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="全域搜尋條款與參數，如「6V」、「3C」、「過充 7天」、「80mΩ」、「擠壓 13kN」..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: isMobile ? '1rem' : '1.12rem',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              style={{ display: 'inline-flex', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px' }}
              title="清除"
              aria-label="清除搜尋"
            >
              <Icon name="x" size={16} />
            </button>
          )}
          <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap'
          }}>
            ESC 關閉
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', backgroundColor: 'var(--bg-panel)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>快速檢索範例：</span>
            {QUICK_SUGGESTIONS.map(s => (
              <button
                key={s}
                className="btn-pill"
                onClick={() => { setQuery(s); inputRef.current?.focus(); }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Results Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.25rem' }}>
          {loading && allStandardsData.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '0.8rem' }} />
              <div>正在載入 {libraryCount} 份標準的條款索引…</div>
            </div>
          ) : !query.trim() ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                跨 {libraryCount} 份標準的參數檢索
              </div>
              <div style={{ fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
                可同時輸入測試條件（如 <code style={{ color: 'var(--accent-color)' }}>6V</code>、<code style={{ color: 'var(--accent-color)' }}>3C</code>、<code style={{ color: 'var(--accent-color)' }}>7天</code>）、條款名稱或標準名稱，瞬間查出對應規範條款。
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icon name="search" size={28} strokeWidth={1.5} style={{ marginBottom: '0.6rem', opacity: 0.6 }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                找不到完全符合「{query}」的條款
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                建議：嘗試減少關鍵字或分開搜尋（例如先搜尋「6V」或「過充」）。
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>找到 {searchResults.length} 筆相符條款</span>
                <span>↑↓ 切換 / Enter 展開</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {searchResults.map(({ item, matchedConditions, isTestLevelMatch }, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isExpanded = expandedTestId === item.id;
                  const isDocInComparison = selectedDocs.includes(item.baseId);
                  const orgCol = getOrgColor(item.baseId);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedTestId(isExpanded ? null : item.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? 'var(--bg-color)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, border-color 0.15s'
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      {/* Top Header of Card */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '5px',
                            backgroundColor: orgCol.solid,
                            color: '#fff',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.baseId}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.section && <span style={{ color: 'var(--text-muted)', marginRight: '0.35rem' }}>§{item.section}</span>}
                            {highlightMatches(item.nameZh || item.nameEn, query)}
                          </span>
                          {!isTestLevelMatch && (
                            <span className="tag" title="關鍵字分散在同一份標準的不同測試項目中">
                              同標準其他項目相關
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <button
                            className={`btn-pill${isDocInComparison ? ' is-on' : ''}`}
                            onClick={() => toggleDocument(item.baseId)}
                            title={isDocInComparison ? '從比對清單移除' : '加入首頁的比對清單'}
                          >
                            <Icon name={isDocInComparison ? 'check' : 'plus'} size={13} />
                            {isDocInComparison ? '已在比對中' : '加入比對'}
                          </button>
                          {onAskAi && (
                            <button
                              className="btn-text"
                              onClick={() => {
                                onClose();
                                onAskAi(`請為我深度解析 ${item.baseId} 的第 ${item.section} 節（${item.nameZh}）試驗條件與判定依據。`, [item.baseId]);
                              }}
                              title="向 AI 小幫手提問此條款"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Icon name="message" size={13} />
                              問 AI
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Matched condition snippet */}
                      {matchedConditions.length > 0 && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {matchedConditions.map((c, ci) => (
                            <div key={ci} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-panel)', padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid var(--border-color)', lineHeight: 1.4 }}>
                              <strong style={{ color: 'var(--text-primary)', marginRight: '0.4rem' }}>{getParameterMeta(c.key).label}</strong>
                              <span>{highlightMatches(c.value, query)}</span>
                              {c.detail && c.detail !== c.value && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem', fontSize: '0.76rem' }}>
                                  ({highlightMatches(c.detail, query)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Summary of Acceptance Criteria */}
                      {item.acceptanceCriteria?.summary && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          <span style={{ fontWeight: 600 }}>判定標準：</span>
                          {highlightMatches(item.acceptanceCriteria.summary, query)}
                        </div>
                      )}

                      {/* Expanded View for All Conditions */}
                      {isExpanded && (
                        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            完整試驗條件
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                            {item.conditionList.map((c, i) => (
                              <div key={i} style={{ backgroundColor: 'var(--bg-panel)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                                  {getParameterMeta(c.key).label}
                                </div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                  {highlightMatches(c.value, query)}
                                </div>
                                {c.detail && c.detail !== c.value && (
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.73rem', marginTop: '0.15rem' }}>
                                    {highlightMatches(c.detail, query)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {item.acceptanceCriteria?.details?.length > 0 && (
                            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                                判定要求
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {item.acceptanceCriteria.details.map((d, di) => (
                                  <li key={di}>{highlightMatches(d, query)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-color)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            支援單詞與多詞搜尋（如「<span style={{ color: 'var(--text-secondary)' }}>過充 6V</span>」）
          </div>
          <div>
            快捷鍵：<kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>⌘K</kbd> / <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>Ctrl+K</kbd>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(15px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
