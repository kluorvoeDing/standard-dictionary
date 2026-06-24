import React, { useMemo, useState } from 'react';
import StandardColumn from './StandardColumn';
import useIsMobile from '../hooks/useIsMobile';

export default function SplitScreenGrid({ selectedDocIds, catalog, testsData, setIsComparing }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [infoModalDocId, setInfoModalDocId] = useState(null);
  const [activeVersions, setActiveVersions] = useState({});
  const isMobile = useIsMobile();

  const getOrgColor = (baseId = '') => {
    if (baseId.startsWith('GB')) return { solid: 'var(--org-gb-solid)', text: 'var(--org-gb-text)', fill: 'var(--org-gb-fill)' };
    if (baseId.startsWith('UL')) return { solid: 'var(--org-ul-solid)', text: 'var(--org-ul-text)', fill: 'var(--org-ul-fill)' };
    if (baseId.startsWith('IEC') || baseId.startsWith('UN')) return { solid: 'var(--org-intl-solid)', text: 'var(--org-intl-text)', fill: 'var(--org-intl-fill)' };
    return { solid: 'var(--org-other-solid)', text: 'var(--org-other-text)', fill: 'var(--org-other-fill)' };
  };
  
  const objectTypes = [
    { id: 'CELL', label: 'Cell (電芯)' },
    { id: 'MODULE', label: 'Module (模組)' },
    { id: 'PACK_SYSTEM', label: 'System (系統)' }
  ];
  const [filterObjects, setFilterObjects] = useState(['CELL']);

  const toggleObjectFilter = (objId) => {
    setFilterObjects(prev => 
      prev.includes(objId) ? prev.filter(o => o !== objId) : [...prev, objId]
    );
  };

  // Prepare grouped data
  const groupedTests = useMemo(() => {
    const groups = {};
    const categoryOrder = { 'ELEC': 1, 'MECH': 2, 'THERM': 3, 'ENV': 4, 'FIRE': 5, 'OTHER': 6 };

    selectedDocIds.forEach(baseId => {
      const versions = catalog.filter(c => (c.base_standard_id || c.document_id) === baseId);
      
      versions.forEach(ver => {
        const standardData = testsData[ver.document_id];
        if (!standardData || !standardData.tests) return;

        standardData.tests.forEach(test => {
          const nid = test.normalized_id || 'UNKNOWN';
          if (!groups[nid]) {
            let cat = 'OTHER';
            if (nid.startsWith('ELEC')) cat = 'ELEC';
            else if (nid.startsWith('MECH')) cat = 'MECH';
            else if (nid.startsWith('THERM')) cat = 'THERM';
            else if (nid.startsWith('ENV')) cat = 'ENV';
            else if (nid.startsWith('FIRE')) cat = 'FIRE';

            let rawZh = test.name_zh || test.item_name_zh || nid;
            let cleanZh = rawZh.replace(/\s*\(.*?\)\s*$/, '');
            cleanZh = cleanZh.replace(/(試驗|測試)/g, '');

            groups[nid] = {
              id: nid,
              nameZh: cleanZh,
              nameEn: test.name_en || test.item_name_en || '',
              category: cat,
              order: categoryOrder[cat] || 99,
              records: {}
            };
          }
          
          if (!groups[nid].records[baseId]) {
            groups[nid].records[baseId] = {};
          }
          if (!groups[nid].records[baseId][ver.document_id]) {
            groups[nid].records[baseId][ver.document_id] = [];
          }
          groups[nid].records[baseId][ver.document_id].push(test);
        });
      });
    });

    let arr = Object.values(groups).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.nameZh.localeCompare(b.nameZh, 'zh-Hant');
    });

    return arr.filter(g => {
      if (filterCategory !== 'ALL' && g.category !== filterCategory) return false;
      
      let groupObjects = new Set();
      Object.values(g.records).forEach(baseMap => {
        Object.values(baseMap).forEach(versionArr => {
          versionArr.forEach(record => {
            if (record.test_objects) {
              record.test_objects.forEach(obj => groupObjects.add(obj));
            }
          });
        });
      });
      
      if (groupObjects.size > 0 && filterObjects.length > 0) {
        const hasMatch = Array.from(groupObjects).some(obj => filterObjects.includes(obj));
        if (!hasMatch) return false;
      } else if (filterObjects.length === 0) {
        return false; 
      }
      
      return true;
    });
  }, [selectedDocIds, testsData, catalog, filterCategory, filterObjects]);

  const categories = ['ALL', 'ELEC', 'MECH', 'THERM', 'ENV', 'FIRE'];
  const categoryLabels = {
    'ALL': '全部', 'ELEC': '電氣安全', 'MECH': '機械安全', 'THERM': '熱安全', 'ENV': '環境安全', 'FIRE': '火燒'
  };

  const renderInfoModal = () => {
    if (!infoModalDocId) return null;
    const docData = testsData[infoModalDocId]?.document;
    if (!docData) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }} onClick={() => setInfoModalDocId(null)}>
        <div style={{
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)'
        }} onClick={(e) => e.stopPropagation()}>
          
          <button 
            onClick={() => setInfoModalDocId(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: getOrgColor(docData.id || '').solid, flexShrink: 0 }} />
            {docData.id || docData.short_name}
          </h2>

          {(() => {
            const catDoc = catalog.find(d => d.document_id === infoModalDocId);
            if (!catDoc) return null;
            return (
              <div style={{ marginTop: '1rem' }}>
                {catDoc.is_latest ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '500' }}>
                    <span>✅ 當前收錄為最新版本 ({catDoc.latest_version})</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>⚠️ 注意：本標準已有更新版本</span>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      當前收錄版本落後了 <strong style={{ fontSize: '1.1rem' }}>{catDoc.versions_behind}</strong> 版。目前最新發布版本為：<strong>{catDoc.latest_version}</strong>。
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>標準名稱 (中/英)</strong>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                {docData.full_name_zh || '無中文名稱'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {docData.full_name || 'No English Name'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>發布機構</strong>
                <div style={{ color: 'var(--text-primary)' }}>{docData.publisher || '未知'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>發布日期</strong>
                <div style={{ color: 'var(--text-primary)' }}>{docData.publication_date || '未知'}</div>
              </div>
            </div>

            {docData.scope && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>簡介與適用範圍 (Scope)</strong>
                <div style={{ 
                  backgroundColor: 'var(--bg-color)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {docData.scope}
                </div>
              </div>
            )}
            
            {docData.applicable_objects && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>適用測試層級</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {docData.applicable_objects.map(obj => (
                    <span key={obj} style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-hover)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: isMobile ? '0.75rem 0.85rem' : '0.9rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.9rem' }}>
        <button
          className="cmp-back"
          onClick={() => setIsComparing && setIsComparing(false)}
          style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <span aria-hidden="true">←</span>{isMobile ? '' : ' 返回'}
        </button>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: '0.55rem', fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
          橫向對比
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {selectedDocIds.length} 份標準 · {groupedTests.length} 項測試
          </span>
        </h2>
      </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem 1.5rem', alignItems: 'center', padding: isMobile ? '0.85rem' : '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.1rem' }}>測試類別</span>
            {categories.map(cat => (
              <button
                key={cat}
                className={`sm-filter${filterCategory === cat ? ' is-active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '1.4rem', backgroundColor: 'var(--border-color)' }}></div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.1rem' }}>樣品層級</span>
            {objectTypes.map(obj => {
              const isActive = filterObjects.includes(obj.id);
              return (
                <button
                  key={obj.id}
                  className={`sm-filter${isActive ? ' is-active' : ''}`}
                  onClick={() => toggleObjectFilter(obj.id)}
                >
                  {isActive ? '✓ ' : ''}{obj.label}
                </button>
              );
            })}
          </div>
        </div>

      <div className="scrollable" style={{ flexGrow: 1, padding: isMobile ? '0.75rem' : '1rem', overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? `minmax(120px, 140px) repeat(${selectedDocIds.length}, minmax(220px, 1fr))`
            : `minmax(180px, 220px) repeat(${selectedDocIds.length}, minmax(280px, 1fr))`,
          gap: isMobile ? '0.6rem' : '1rem'
        }}>
          {/* Header Row */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: 'var(--bg-color)', paddingBottom: '0.5rem' }}>
            <div style={{ fontWeight: '600', padding: '0.5rem', color: 'var(--text-secondary)' }}>測試項目</div>
          </div>
          {selectedDocIds.map(baseId => {
            const versions = catalog.filter(c => (c.base_standard_id || c.document_id) === baseId)
                                   .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
            const activeDocId = activeVersions[baseId] || (versions[0] ? versions[0].document_id : baseId);
            const doc = versions.find(v => v.document_id === activeDocId) || {};
            const colors = getOrgColor(baseId);

            return (
              <div
                key={baseId}
                style={{
                  position: 'sticky', top: 0, zIndex: 5, backgroundColor: 'var(--bg-color)', paddingBottom: '0.5rem',
                  minWidth: 0
                }}
              >
                <div
                  className="cmp-colhead"
                  onClick={() => setInfoModalDocId(activeDocId)}
                  title={`查看 ${doc.display_name} 詳細資訊`}
                  style={{
                    '--c-solid': colors.solid,
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `3px solid ${colors.solid}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 0.8rem',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2.5px', backgroundColor: colors.solid, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.display_name}
                      </span>
                    </div>

                    {versions.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {versions.map((ver) => {
                          const isActive = ver.document_id === activeDocId;
                          const yearLabel = String(new Date(ver.publication_date).getFullYear());
                          return (
                            <button
                              key={ver.document_id}
                              className={`cmp-ver${isActive ? ' is-active' : ''}`}
                              onClick={() => setActiveVersions(prev => ({...prev, [baseId]: ver.document_id}))}
                              style={{
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                fontVariantNumeric: 'tabular-nums',
                                backgroundColor: isActive ? colors.solid : 'transparent',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                border: `1px solid ${isActive ? colors.solid : 'var(--border-color)'}`,
                                cursor: 'pointer'
                              }}
                            >
                              {yearLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Data Rows */}
          {groupedTests.map(group => (
            <React.Fragment key={group.id}>
              {/* Left Column: Test Name */}
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.25rem',
                minWidth: 0,
                height: '100%'
              }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: '700',
                  color: `var(--cat-${group.category.toLowerCase()}-text, var(--text-muted))`,
                  backgroundColor: `var(--cat-${group.category.toLowerCase()}, var(--bg-color))`,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  alignSelf: 'flex-start'
                }}>
                  {group.id}
                </span>
                <strong style={{ fontSize: '0.9rem' }}>{group.nameZh}</strong>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: '1.4'
                }}>{group.nameEn}</span>
              </div>

              {/* Standard Columns */}
              {selectedDocIds.map(baseId => {
                const versions = catalog.filter(c => (c.base_standard_id || c.document_id) === baseId)
                                       .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
                const activeDocId = activeVersions[baseId] || (versions[0] ? versions[0].document_id : baseId);
                const recordsForActiveVersion = group.records[baseId] ? group.records[baseId][activeDocId] : null;

                const activeDoc = versions.find(v => v.document_id === activeDocId);
                const prerequisites = activeDoc && activeDoc.prerequisites ? activeDoc.prerequisites : {};

                return (
                  <StandardColumn 
                    key={`${group.id}-${baseId}`} 
                    docId={activeDocId}
                    testRecords={recordsForActiveVersion} 
                    filterObjects={filterObjects}
                    prerequisites={prerequisites}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {renderInfoModal()}
    </div>
  );
}
