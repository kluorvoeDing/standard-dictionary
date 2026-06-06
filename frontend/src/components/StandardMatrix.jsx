import React, { useMemo, useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';

// Application Category Helper
const getApplication = (docId) => {
  if (docId === 'GB38031' || docId === 'ULC-2580' || docId === 'AIS-038') return '電動汽車 (EV)';
  if (docId === 'GB43854') return '電動自行車 (E-Bike)';
  if (docId === 'GB31241' || docId === 'IEC62133-2') return '便攜式電子 (Portable)';
  if (docId === 'UL-2271' || docId === 'AIS-156') return '輕型電動車 (LEV)';
  if (docId === 'GB44240' || docId === 'GBT-36276' || docId === 'UL-9540A' || docId === 'SAND2017-6925' || docId === 'UL-1973') return '儲能系統 (ESS)';
  if (docId === 'IEC62619') return '工業應用 (Industrial)';
  if (docId === 'UL-3030') return '無人機 (UAS)';
  if (docId === 'UN38.3') return '運輸安全 (Transport)';
  return '一般應用 (General)';
};

// Map raw objects to major rows
const getMajorLevel = (raw) => {
  const upper = raw.toUpperCase();
  if (upper.includes('CELL')) return 'Cell';
  if (upper.includes('MODULE')) return 'Module';
  if (upper.includes('SYSTEM') || upper.includes('INSTALLATION')) return 'System';
  if (upper.includes('PACK')) return 'Pack';
  return 'Other';
};

const MAJOR_LEVELS = ['Cell', 'Module', 'Pack', 'System', 'Other'];

export default function StandardMatrix({ catalog, toggleDocument, selectedDocs, setIsComparing, setSelectedDocs }) {
  const [activeInfoNode, setActiveInfoNode] = useState(null);
  const isMobile = useIsMobile();

  const { applications, matrix } = useMemo(() => {
    // 1. Get unique latest standards
    const baseMap = new Map();
    catalog.forEach(doc => {
      const baseId = doc.base_standard_id || doc.document_id;
      if (!baseMap.has(baseId)) {
        baseMap.set(baseId, doc);
      } else {
        const existing = baseMap.get(baseId);
        if (doc.is_latest && !existing.is_latest) {
          baseMap.set(baseId, doc);
        } else if (doc.publication_date > existing.publication_date) {
          baseMap.set(baseId, doc);
        }
      }
    });

    const uniqueDocs = Array.from(baseMap.values());
    
    // 2. Find all applications
    const appsSet = new Set();
    uniqueDocs.forEach(doc => {
      const baseId = doc.base_standard_id || doc.document_id;
      appsSet.add(getApplication(baseId));
    });
    // Sort applications to put General last, and others alphabetically or logically
    const appOrder = ['運輸安全 (Transport)', '一般應用 (General)', '便攜式電子 (Portable)', '無人機 (UAS)', '輕型電動車 (LEV)', '電動自行車 (E-Bike)', '工業應用 (Industrial)', '電動汽車 (EV)', '儲能系統 (ESS)'];
    const applications = Array.from(appsSet).sort((a, b) => {
      const indexA = appOrder.indexOf(a);
      const indexB = appOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    // 3. Build Matrix: level -> app -> docs[]
    const mat = {};
    MAJOR_LEVELS.forEach(lvl => {
      mat[lvl] = {};
      applications.forEach(app => {
        mat[lvl][app] = [];
      });
    });

    uniqueDocs.forEach(doc => {
      const baseId = doc.base_standard_id || doc.document_id;
      const app = getApplication(baseId);
      const levels = doc.available_objects || [];
      
      const distinctLevels = new Set(levels.map(getMajorLevel));
      
      distinctLevels.forEach(lvl => {
        if (mat[lvl] && mat[lvl][app]) {
          mat[lvl][app].push(doc);
        }
      });
    });

    return { applications, matrix: mat };
  }, [catalog]);

  const getOrgColor = (baseId) => {
    if (baseId.startsWith('GB')) return { solid: '#ef4444', light: 'rgba(239, 68, 68, 0.15)' };
    if (baseId.startsWith('UL')) return { solid: '#10b981', light: 'rgba(16, 185, 129, 0.15)' };
    if (baseId.startsWith('IEC') || baseId.startsWith('UN')) return { solid: '#f59e0b', light: 'rgba(245, 158, 11, 0.15)' };
    return { solid: '#3b82f6', light: 'rgba(59, 130, 246, 0.15)' };
  };

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem' : '2rem', paddingTop: isMobile ? '3.5rem' : '1.5rem', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', position: 'relative' }}>
      <div style={{ marginBottom: '1.5rem', paddingLeft: '3.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
          標準應用領域導覽
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          從下方矩陣點擊您感興趣的標準，將自動加入比對清單。
        </p>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)', paddingBottom: selectedDocs.length >= 2 ? '80px' : '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)', position: 'sticky', top: 0, left: 0, zIndex: 10, backgroundColor: 'var(--bg-panel)', minWidth: '90px', fontSize: '0.9rem' }}>
                層級 \ 應用
              </th>
              {applications.map(app => (
                <th key={app} style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 5, backgroundColor: 'var(--bg-panel)', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                  {app}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAJOR_LEVELS.map((lvl) => {
              // Check if row is completely empty
              const isRowEmpty = applications.every(app => matrix[lvl][app].length === 0);
              if (isRowEmpty) return null;

              return (
                <tr key={lvl}>
                  <th style={{ padding: '1rem 0.5rem', borderBottom: '1px solid var(--border-color)', borderRight: '2px solid var(--border-color)', position: 'sticky', left: 0, zIndex: 5, backgroundColor: 'var(--bg-panel)', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {lvl}
                  </th>
                  {applications.map(app => (
                    <td key={app} style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {matrix[lvl][app].map(doc => {
                          const baseId = doc.base_standard_id || doc.document_id;
                          const isSelected = selectedDocs.includes(baseId);
                          const colors = getOrgColor(baseId);
                          
                          return (
                            <button
                              key={baseId}
                              onClick={() => {
                                toggleDocument(baseId);
                                setActiveInfoNode({ ...doc, baseId, colors });
                              }}
                              title={doc.display_name || doc.full_name}
                              style={{
                                width: '100%',
                                maxWidth: '105px',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '15px',
                                border: `1px solid ${colors.solid}`,
                                backgroundColor: isSelected ? colors.solid : colors.light,
                                color: isSelected ? '#fff' : 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: isSelected ? 'bold' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                boxShadow: isSelected ? `0 0 10px ${colors.solid}66` : 'none',
                                flexGrow: 1,
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = colors.solid;
                                  e.currentTarget.style.color = '#fff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = colors.light;
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }
                              }}
                            >
                              {baseId}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Panel Overlay */}
      {activeInfoNode && (
        <div style={{
          position: 'fixed',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10,
          animation: 'slideIn 0.3s ease-out',
          ...(isMobile
            ? { left: 0, right: 0, bottom: selectedDocs.length >= 2 ? '88px' : 0, width: 'auto', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }
            : { bottom: selectedDocs.length >= 2 ? '100px' : '2rem', right: '2rem', width: '320px', borderRadius: 'var(--radius-lg)' })
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: activeInfoNode.colors.solid, fontSize: '1.25rem' }}>{activeInfoNode.baseId}</h3>
            <button onClick={() => setActiveInfoNode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>全名</strong>
              <span style={{ color: 'var(--text-primary)' }}>{activeInfoNode.full_name || activeInfoNode.display_name}</span>
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
                  <span key={id} style={{ backgroundColor: colors.solid, color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
        @keyframes slideUp {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
