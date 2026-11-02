import { useEffect, useMemo, useRef, useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { getOrgColor } from '../utils/orgColors';
import Icon from './Icon';
import '../styles/matrix.css';

const LEVEL_ZH = { CELL: '電芯', MODULE: '模組', PACK_SYSTEM: '電池包與系統' };
const stripEnglish = (x = '') => x.replace(/\s*[（(][A-Za-z][^)）]*[)）]/g, '').trim();

// Map raw objects to major sample levels. PACK_SYSTEM (the taxonomy's pack / system level) maps to Pack.
const getMajorLevel = (raw) => {
  const upper = raw.toUpperCase();
  if (upper.includes('CELL')) return 'Cell';
  if (upper.includes('MODULE')) return 'Module';
  if (upper.includes('PACK')) return 'Pack';
  if (upper.includes('SYSTEM') || upper.includes('INSTALLATION')) return 'System';
  return 'Other';
};

const MAJOR_LEVELS = ['Cell', 'Module', 'Pack', 'System', 'Other'];
const LEVEL_CHIP_LABEL = { Cell: '電芯', Module: '模組', Pack: '電池包', System: '系統', Other: '其他' };
const LEVEL_FILTER_LABEL = { Cell: '電芯', Module: '模組', Pack: '電池包／系統', System: '系統', Other: '其他' };

// Domain display order (most specific applications first, General last)
const APP_ORDER = [
  '運輸安全 (Transport)',
  '便攜式電子 (Portable)',
  '電動自行車 (E-Bike)',
  '輕型電動車 (LEV)',
  '電動汽車 (EV)',
  '無人機 (UAS)',
  '儲能系統 (ESS)',
  '工業應用 (Industrial)',
  '一般應用 (General)',
];

export default function StandardMatrix({ catalog, toggleDocument, selectedDocs, setIsComparing, setSelectedDocs, onOpenSearch, catalogError = false, onRetryCatalog }) {
  const [activeInfoNode, setActiveInfoNode] = useState(null);
  const infoRef = useRef(null);

  // 資訊視窗：Esc 關閉、焦點移入
  useEffect(() => {
    if (!activeInfoNode) return;
    infoRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setActiveInfoNode(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeInfoNode]);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const isMobile = useIsMobile();


  const LEGEND = [
    { label: '中國 GB', solid: 'var(--org-gb-solid)' },
    { label: '北美 UL', solid: 'var(--org-ul-solid)' },
    { label: '國際 IEC · UN', solid: 'var(--org-intl-solid)' },
    { label: '其他', solid: 'var(--org-other-solid)' },
  ];

  // Group unique (latest) standards by application domain
  const { domains, levels, count } = useMemo(() => {
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

    const uniqueDocs = Array.from(baseMap.values());
    const levelsPresent = new Set();
    const groupMap = new Map();

    uniqueDocs.forEach(doc => {
      const baseId = doc.base_standard_id || doc.document_id;
      const app = doc.application || '一般應用 (General)';
      const docLevelSet = new Set((doc.available_objects || []).map(getMajorLevel));
      const lvls = MAJOR_LEVELS.filter(l => docLevelSet.has(l));
      lvls.forEach(l => levelsPresent.add(l));
      if (!groupMap.has(app)) groupMap.set(app, []);
      groupMap.get(app).push({ doc, baseId, levels: lvls });
    });

    const domains = Array.from(groupMap.entries())
      .map(([app, items]) => ({ app, items: items.sort((a, b) => a.baseId.localeCompare(b.baseId)) }))
      .sort((a, b) => {
        const ia = APP_ORDER.indexOf(a.app);
        const ib = APP_ORDER.indexOf(b.app);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.app.localeCompare(b.app);
      });

    const levels = MAJOR_LEVELS.filter(l => levelsPresent.has(l));
    return { domains, levels, count: uniqueDocs.length };
  }, [catalog]);

  return (
    <div style={{ padding: isMobile ? '1rem 0.85rem' : '2rem 2.25rem', paddingTop: isMobile ? '3.5rem' : '1.75rem', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Heading + legend */}
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.9rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
              標準應用領域導覽
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-md)', margin: 0 }}>
              依應用領域瀏覽，點擊標準加入比對，選滿 2 份開始橫向對比。
              {count > 0 && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>共 {count} 份標準</span>}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center' }}>
            {LEGEND.map(l => (
              <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: 'var(--radius-xs)', backgroundColor: l.solid, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <span className="sm-newver" />
              有新版
            </span>
          </div>
        </div>

        {catalogError && count === 0 && (
          <div className="sm-loaderr" role="alert">
            <span>無法載入標準目錄，請重新整理</span>
            <button type="button" className="btn-pill" onClick={() => (onRetryCatalog ? onRetryCatalog() : window.location.reload())}>重新載入</button>
          </div>
        )}

        {/* Prominent Search Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            onClick={onOpenSearch}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenSearch?.(); } }}
            className="sm-searchbar"
            style={{ padding: isMobile ? '0.65rem 0.9rem' : '0.8rem 1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, color: 'var(--text-muted)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: isMobile ? 'var(--fs-sm)' : 'var(--fs-md)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                搜尋測試、參數或標準
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <kbd style={{
                fontSize: 'var(--fs-2xs)',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontFamily: 'monospace'
              }}>
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Level filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1.4rem' }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginRight: '0.2rem' }}>樣品層級</span>
          {['ALL', ...levels].map(lv => (
            <button
              key={lv}
              className={`sm-filter${levelFilter === lv ? ' is-active' : ''}`}
              onClick={() => setLevelFilter(lv)}
            >
              {lv === 'ALL' ? '全部' : (LEVEL_FILTER_LABEL[lv] || lv)}
            </button>
          ))}
        </div>

        {/* Domain cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
          paddingBottom: selectedDocs.length >= 2 ? (isMobile ? '5.5rem' : '6.5rem') : '0.5rem',
        }}>
          {domains.map(({ app, items }) => {
            const visible = levelFilter === 'ALL' ? items : items.filter(it => it.levels.includes(levelFilter));
            if (visible.length === 0) return null;
            return (
              <section key={app} className="sm-card">
                <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{stripEnglish(app)}</h3>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{visible.length} 份</span>
                </header>

                {visible.map(({ doc, baseId, levels: docLevels }) => {
                  const isSelected = selectedDocs.includes(baseId);
                  const colors = getOrgColor(baseId);
                  const select = () => toggleDocument(baseId);
                  return (
                    <div
                      key={baseId}
                      className={`sm-row${isSelected ? ' is-selected' : ''}`}
                      style={{ '--c-solid': colors.solid, '--c-fill': colors.fill }}
                      title={doc.display_name || doc.full_name}
                      role="button"
                      tabIndex={0}
                      onClick={select}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-xs)', backgroundColor: colors.solid, flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums', color: isSelected ? colors.solid : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {baseId}
                        </span>
                        {doc.is_latest === false && (
                          <span className="sm-newver" title={`有新版：最新為 ${doc.latest_version || '更新版本'}`} role="img" aria-label="有新版" />
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                        {isSelected ? (
                          <span style={{ color: colors.solid, fontWeight: 700, fontSize: 'var(--fs-sm)', lineHeight: 1 }}>✓</span>
                        ) : (
                          docLevels.map(lv => (
                            <span key={lv} style={{ fontSize: 'var(--fs-2xs)', padding: '0.1rem 0.34rem', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {LEVEL_CHIP_LABEL[lv] || lv}
                            </span>
                          ))
                        )}
                        <button
                          type="button"
                          className="sm-info"
                          style={{ '--c-solid': colors.solid, '--c-fill': colors.fill }}
                          aria-label={`查看 ${baseId} 詳細資訊`}
                          title="查看詳細資訊"
                          onClick={(e) => { e.stopPropagation(); setActiveInfoNode({ ...doc, baseId, colors }); }}
                        >
                          ⓘ
                        </button>
                      </span>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>

      {/* Info Modal：外觀與比對頁的標準資訊視窗一致 */}
      {activeInfoNode && (
        <div className="modal-backdrop" onClick={() => setActiveInfoNode(null)}>
          <div
            ref={infoRef}
            tabIndex={-1}
            className="modal-panel modal-panel--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sm-info-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={() => setActiveInfoNode(null)} aria-label="關閉"><Icon name="x" size={16} /></button>

            <h2 id="sm-info-title" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '0 0 0.9rem', paddingRight: '2.5rem', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-xs)', backgroundColor: activeInfoNode.colors.solid, flexShrink: 0 }} />
              {activeInfoNode.baseId}
            </h2>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
              <span className="status-dot" style={{ background: activeInfoNode.is_latest === false ? 'var(--warning-color)' : 'var(--success-color)' }} />
              {activeInfoNode.is_latest === false
                ? <span>已有更新版本：落後 <strong style={{ color: 'var(--text-primary)' }}>{activeInfoNode.versions_behind ?? 1}</strong> 版，最新為 <strong style={{ color: 'var(--text-primary)' }}>{activeInfoNode.latest_version || '更新版本'}</strong></span>
                : <span>收錄版本即最新版{activeInfoNode.latest_version ? `（${activeInfoNode.latest_version}）` : ''}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.1rem' }}>
              <section>
                <span className="modal-section-title">標準名稱</span>
                <div style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>{activeInfoNode.full_name || activeInfoNode.display_name}</div>
              </section>
              <div className="sm-info-grid">
                <section>
                  <span className="modal-section-title">發布日期</span>
                  <div style={{ fontVariantNumeric: 'tabular-nums' }}>{activeInfoNode.publication_date || '未記載'}</div>
                </section>
                <section>
                  <span className="modal-section-title">測試項目</span>
                  <div style={{ fontVariantNumeric: 'tabular-nums' }}>{activeInfoNode.test_count_v2 || activeInfoNode.item_count || 0} 項</div>
                </section>
              </div>
              <section>
                <span className="modal-section-title">應用領域</span>
                <div>{stripEnglish(activeInfoNode.application || '一般應用')}</div>
              </section>
              {(activeInfoNode.available_objects || []).length > 0 && (
                <section>
                  <span className="modal-section-title">適用測試層級</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {activeInfoNode.available_objects.map(obj => <span key={obj} className="tag">{LEVEL_ZH[obj] || obj}</span>)}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      {selectedDocs.length >= 2 && (
        <div className="sm-actionbar" role="region" aria-label="已選取的標準">
          {!isMobile && <span className="sm-actionbar-label">已選取</span>}
          <div className="sm-actionbar-list">
            {selectedDocs.map(id => (
              <span key={id} className="sm-chip" style={{ '--c-solid': getOrgColor(id).solid }}>
                <span className="sm-chip-dot" />
                {id}
              </span>
            ))}
          </div>
          <button type="button" onClick={() => setSelectedDocs([])} className="sm-clear-link">清空</button>
          <button type="button" onClick={() => setIsComparing(true)} className="sm-go">
            確認比對
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
