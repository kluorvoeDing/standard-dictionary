import React, { useMemo, useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';

// Application Category Helper
const getApplication = (docId) => {
  if (docId === 'GB38031' || docId === 'ULC-2580' || docId === 'AIS-038') return '電動汽車 (EV)';
  if (docId === 'GB43854') return '電動自行車 (E-Bike)';
  if (docId === 'GB31241' || docId === 'GB31241.4' || docId === 'GB47372' || docId === 'IEC62133-2') return '便攜式電子 (Portable)';
  if (docId === 'UL-2271' || docId === 'AIS-156' || docId === 'GB40559' || docId === 'GB47741') return '輕型電動車 (LEV)';
  if (docId === 'GB44240' || docId === 'GBT-36276' || docId === 'UL-9540A' || docId === 'SAND2017-6925' || docId === 'UL-1973') return '儲能系統 (ESS)';
  if (docId === 'IEC62619' || docId === 'GB40165') return '工業應用 (Industrial)';
  if (docId === 'UL-3030') return '無人機 (UAS)';
  if (docId === 'UN38.3') return '運輸安全 (Transport)';
  return '一般應用 (General)';
};

// Map raw objects to major sample levels
const getMajorLevel = (raw) => {
  const upper = raw.toUpperCase();
  if (upper.includes('CELL')) return 'Cell';
  if (upper.includes('MODULE')) return 'Module';
  if (upper.includes('SYSTEM') || upper.includes('INSTALLATION')) return 'System';
  if (upper.includes('PACK')) return 'Pack';
  return 'Other';
};

const MAJOR_LEVELS = ['Cell', 'Module', 'Pack', 'System', 'Other'];

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

export default function StandardMatrix({ catalog, toggleDocument, selectedDocs, setIsComparing, setSelectedDocs }) {
  const [activeInfoNode, setActiveInfoNode] = useState(null);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const isMobile = useIsMobile();

  const getOrgColor = (baseId) => {
    if (baseId.startsWith('GB')) return { solid: 'var(--org-gb-solid)', text: 'var(--org-gb-text)', fill: 'var(--org-gb-fill)', border: 'var(--org-gb-border)' };
    if (baseId.startsWith('UL')) return { solid: 'var(--org-ul-solid)', text: 'var(--org-ul-text)', fill: 'var(--org-ul-fill)', border: 'var(--org-ul-border)' };
    if (baseId.startsWith('IEC') || baseId.startsWith('UN')) return { solid: 'var(--org-intl-solid)', text: 'var(--org-intl-text)', fill: 'var(--org-intl-fill)', border: 'var(--org-intl-border)' };
    return { solid: 'var(--org-other-solid)', text: 'var(--org-other-text)', fill: 'var(--org-other-fill)', border: 'var(--org-other-border)' };
  };

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
      const app = getApplication(baseId);
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: 0 }}>
              依應用領域瀏覽，點擊標準加入比對，選滿 2 份開始橫向對比。
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>共 {count} 份標準</span>
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center' }}>
            {LEGEND.map(l => (
              <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: l.solid, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Level filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>樣品層級</span>
          {['ALL', ...levels].map(lv => (
            <button
              key={lv}
              className={`sm-filter${levelFilter === lv ? ' is-active' : ''}`}
              onClick={() => setLevelFilter(lv)}
            >
              {lv === 'ALL' ? '全部' : lv}
            </button>
          ))}
        </div>

        {/* Domain cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
          paddingBottom: selectedDocs.length >= 2 ? '92px' : '0.5rem',
        }}>
          {domains.map(({ app, items }) => {
            const visible = levelFilter === 'ALL' ? items : items.filter(it => it.levels.includes(levelFilter));
            if (visible.length === 0) return null;
            return (
              <section key={app} className="sm-card">
                <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{app}</h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{visible.length} 份</span>
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
                        <span style={{ width: '8px', height: '8px', borderRadius: '2.5px', backgroundColor: colors.solid, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums', color: isSelected ? colors.solid : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {baseId}
                        </span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                        {isSelected ? (
                          <span style={{ color: colors.solid, fontWeight: 700, fontSize: '0.85rem', lineHeight: 1 }}>✓</span>
                        ) : (
                          docLevels.map(lv => (
                            <span key={lv} style={{ fontSize: '0.62rem', padding: '0.1rem 0.34rem', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              {lv}
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

      {/* Info Modal */}
      {activeInfoNode && (
        <div
          onClick={() => setActiveInfoNode(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : '2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideIn 0.25s ease-out',
            ...(isMobile
              ? { width: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }
              : { width: '360px', maxWidth: '100%', borderRadius: 'var(--radius-lg)' })
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: activeInfoNode.colors.solid, flexShrink: 0 }} />
              {activeInfoNode.baseId}
            </h3>
            <button onClick={() => setActiveInfoNode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>全名</strong>
              <span style={{ color: 'var(--text-primary)' }}>{activeInfoNode.full_name || activeInfoNode.display_name}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>應用領域</strong>
              <span style={{ color: 'var(--text-primary)' }}>{getApplication(activeInfoNode.baseId)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>層級</strong>
                <span style={{ color: 'var(--text-primary)' }}>{activeInfoNode.available_objects?.length || 0} 種</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>測試項目</strong>
                <span style={{ color: 'var(--text-primary)' }}>{activeInfoNode.test_count_v2 || activeInfoNode.item_count} 項</span>
              </div>
            </div>
            {activeInfoNode.publication_date && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>發布日期</strong>
                <span style={{ color: 'var(--text-primary)' }}>{activeInfoNode.publication_date}</span>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      {selectedDocs.length >= 2 && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '1rem' : '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--accent-color)',
          borderRadius: isMobile ? '16px' : '50px',
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.5rem',
          maxWidth: 'calc(100vw - 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.5rem' : '1.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 20,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flexShrink: 1 }}>
            {!isMobile && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>已選取:</span>}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', minWidth: 0 }}>
              {selectedDocs.map(id => {
                const colors = getOrgColor(id);
                return (
                  <span key={id} style={{ backgroundColor: colors.solid, color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {id}
                  </span>
                )
              })}
            </div>
            <button
              onClick={() => setSelectedDocs([])}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid #ef4444',
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            >
              ✕ 清空
            </button>
          </div>
          <button
            onClick={() => setIsComparing(true)}
            style={{
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '0.5rem 0.9rem' : '0.6rem 1.25rem',
              borderRadius: '20px',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            確認比對 →
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="slideIn"], [style*="slideUp"], [style*="fadeIn"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
