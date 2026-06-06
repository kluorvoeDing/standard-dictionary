import React, { useState, useEffect, useRef, useMemo } from 'react';
import useIsMobile from '../hooks/useIsMobile';

export default function Sidebar({ catalog, selectedDocs, toggleDocument, theme, toggleTheme, isMinimized, setIsMinimized }) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      let newX = e.clientX - rel.x;
      let newY = e.clientY - rel.y;
      
      // keep in bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
      
      setPos({ x: newX, y: newY });
      e.stopPropagation();
      e.preventDefault();
    };

    const onMouseUp = (e) => {
      setDragging(false);
      e.stopPropagation();
      e.preventDefault();
    };

    if (dragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, rel]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter(doc => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (doc.display_name && doc.display_name.toLowerCase().includes(term)) ||
        (doc.full_name && doc.full_name.toLowerCase().includes(term))
      );
    });
  }, [catalog, searchTerm]);

  const getApplication = (docId) => {
    if (docId === 'GB38031' || docId === 'ULC-2580' || docId === 'AIS-038') return '電動汽車 (EV)';
    if (docId === 'GB43854') return '電動自行車 (E-Bike)';
    if (docId === 'GB31241' || docId === 'IEC62133-2') return '便攜式電子 (Portable)';
    if (docId === 'UL-2271' || docId === 'AIS-156') return '輕型電動車 (LEV)';
    if (docId === 'GB44240' || docId === 'GBT-36276' || docId === 'UL-9540A' || docId === 'SAND2017-6925' || docId === 'UL-1973') return '儲能系統 (ESS)';
    if (docId === 'IEC62619') return '工業應用 (Industrial)';
    if (docId === 'UL-3030') return '無人機 (UAS)';
    if (docId === 'UN38.3') return '運輸安全 (Transport)';
    return '一般應用';
  };

  const groupedCatalog = useMemo(() => {
    // 1. Group by base_standard_id to only keep the latest version for the sidebar
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

    const groups = [
      { id: 'GB', title: '中國標準 (GB)', docs: [] },
      { id: 'UL', title: '北美標準 (UL)', docs: [] },
      { id: 'INTL', title: '國際標準 (IEC / UN)', docs: [] },
      { id: 'OTHER', title: '其他區域與領域', docs: [] }
    ];

    let filtered = uniqueDocs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = uniqueDocs.filter(doc => 
        (doc.display_name && doc.display_name.toLowerCase().includes(term)) ||
        (doc.full_name && doc.full_name.toLowerCase().includes(term))
      );
    }

    const sortedFilteredCatalog = [...filtered].sort((a, b) => {
      const getPriority = (docId) => {
        const app = getApplication(docId);
        // Priority 1: 通用 (General/Transport)
        if (app.includes('一般應用') || app.includes('運輸安全') || docId === 'UL1642') return 1;
        // Priority 2: 電動車 (EV/E-Bike/LEV)
        if (app.includes('EV') || app.includes('LEV') || app.includes('E-Bike') || app.includes('電動')) return 2;
        // Priority 3: 便攜式 (Portable/Consumer)
        if (app.includes('便攜') || app.includes('Portable') || app.includes('家用') || app.includes('行動電源') || app.includes('無人機')) return 3;
        // Priority 4: 儲能與其他 (ESS/Industrial)
        return 4;
      };

      const prioA = getPriority(a.document_id);
      const prioB = getPriority(b.document_id);
      
      if (prioA !== prioB) return prioA - prioB;
      return a.document_id.localeCompare(b.document_id);
    });

    sortedFilteredCatalog.forEach(doc => {
      const id = doc.document_id;
      if (id.startsWith('GB')) groups[0].docs.push(doc);
      else if (id.startsWith('UL')) groups[1].docs.push(doc);
      else if (id.startsWith('IEC') || id.startsWith('UN')) groups[2].docs.push(doc);
      else groups[3].docs.push(doc);
    });

    return groups.filter(g => g.docs.length > 0);
  }, [catalog, searchTerm]);

  if (isMinimized) {
    return (
      <div 
        onMouseDown={onMouseDown}
        onClick={() => { if(!dragging) setIsMinimized(false); }}
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          cursor: dragging ? 'grabbing' : 'pointer',
          transition: dragging ? 'none' : 'transform var(--transition-fast)'
        }}
        onMouseEnter={(e) => { if(!dragging) e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { if(!dragging) e.currentTarget.style.transform = 'scale(1)'; }}
        title="打開標準清單"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => setIsMinimized(true)}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)'
        }}
      />
      <div
        style={{
          position: 'fixed', zIndex: 1000, display: 'flex', flexDirection: 'column',
          backgroundColor: 'var(--bg-panel)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          ...(isMobile
            ? { left: 0, top: 0, width: '100vw', height: '100dvh', borderRadius: 0, border: 'none' }
            : { left: pos.x, top: pos.y, width: '95vw', maxWidth: '1500px', maxHeight: '85vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' })
        }}
      >
      {/* Draggable Header (drag disabled on mobile) */}
      <div
        onMouseDown={isMobile ? undefined : onMouseDown}
        style={{
          padding: '1rem', backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)',
          cursor: isMobile ? 'default' : (dragging ? 'grabbing' : 'grab'), display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          標準選擇器 (Standard Selector)
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} title="切換深淺色" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>{theme === 'light' ? '🌙' : '☀️'}</button>
          <button onClick={() => setIsMinimized(true)} title="收起選單" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>➖</button>
        </div>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <input 
          type="text" 
          placeholder="搜尋標準名稱..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
        />
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>已選取: {selectedDocs.length} / 5</div>
      </div>

      <div className="scrollable" style={{ flexGrow: 1, padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '1rem' : '1.5rem', alignItems: 'start' }}>
          {groupedCatalog.map(group => (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.25rem', fontSize: '1rem' }}>
                {group.title}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {group.docs.map(doc => {
                  const baseId = doc.base_standard_id || doc.document_id;
                  const isSelected = selectedDocs.includes(baseId);
                  const application = getApplication(doc.document_id);
                  const rawLevels = (doc.available_objects || []).map(o => {
                    if (o === 'PACK_SYSTEM') return 'System';
                    if (o === 'SINGLE_CELL_BATTERY') return 'Single Cell';
                    if (o === 'COMPONENT_CELL') return 'Comp. Cell';
                    if (o === 'BATTERY_SYSTEM') return 'Batt. System';
                    return o.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  });
                  const levelOrder = { 'CELL': 1, 'MODULE': 2, 'PACK': 3 };
                  const levels = [...rawLevels].sort((a, b) => {
                    const orderA = levelOrder[a.toUpperCase()] || 99;
                    const orderB = levelOrder[b.toUpperCase()] || 99;
                    if (orderA !== orderB) return orderA - orderB;
                    return a.localeCompare(b);
                  });
                  
                  return (
                    <div 
                      key={baseId}
                      onClick={() => toggleDocument(baseId)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'var(--accent-bg)' : 'var(--bg-color)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--accent-hover)' : 'var(--text-primary)' }}>
                          {doc.display_name}
                        </strong>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          style={{ pointerEvents: 'none' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {doc.full_name}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            {doc.test_count_v2} 測試
                          </span>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            {application}
                          </span>
                          {doc.document_type === 'guidance' && (
                            <span className="badge" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)' }}>
                              建議
                            </span>
                          )}
                        </div>
                        {levels.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {levels.map(level => (
                              <span key={level} className="badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-hover)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                {level}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
