import React, { useState, useEffect, useMemo } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import Icon from './Icon';

function normalizeStandardData(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (!Array.isArray(out.tests) && Array.isArray(out.test_items)) {
    out.tests = out.test_items;
  }
  return out;
}

const LEVEL_KEYS = ['CELL', 'MODULE', 'PACK_SYSTEM'];

const TYPE_COLORS = {
  'ELEC': '#ef4444', 
  'MECH': '#ef4444',
  'THERM': '#ef4444',
};

const TYPE_LABELS = {
  'ELEC': 'Safety / Abuse-Electrical',
  'MECH': 'Safety / Abuse-Mechanical',
  'THERM': 'Safety / Abuse-Thermal',
};

export default function GlobalMatrixModal({ isOpen, onClose, catalog }) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [flattenedTests, setFlattenedTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const fetchAll = async () => {
      // Group by base standard ID to get the latest
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
        fetch(`/${doc.schema_v2_json}`)
          .then(res => res.json())
          .then(data => ({
             doc,
             data: normalizeStandardData(data)
          }))
          .catch(err => {
             console.error("Error fetching", doc.schema_v2_json, err);
             return null;
          })
      );

      const results = await Promise.all(promises);
      if (!isMounted) return;

      const rows = [];
      results.forEach(res => {
        if (!res || !res.data || !res.data.tests) return;
        
        const docName = res.doc.base_standard_id || res.doc.document_id;
        const app = res.doc.application || '一般應用 (General)';
        
        const tests = res.data.tests;
        tests.forEach((test, idx) => {
          // ensure levels check works
          const levelsList = test.test_objects || test.applicable_objects || [];
          // we match against uppercase ID
          const levelMap = levelsList.map(l => typeof l === 'string' ? l.toUpperCase() : (l.id || '').toUpperCase());

          rows.push({
            id: `${docName}-${idx}`,
            docName,
            app,
            section: test.section || '-',
            testName: test.name_zh || test.name_en || test.normalized_id,
            category: test.category || 'UNKNOWN',
            levels: levelMap
          });
        });
      });

      setFlattenedTests(rows);
      setLoading(false);
    };

    fetchAll();
    
    return () => { isMounted = false; };
  }, [isOpen, catalog]);

  const filteredAndProcessedRows = useMemo(() => {
    let filtered = flattenedTests;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = flattenedTests.filter(r => 
        r.docName.toLowerCase().includes(q) ||
        r.app.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q)
      );
    }
    
    // Group by docName to calculate docRowSpan and isFirstForDoc
    const counts = {};
    filtered.forEach(r => {
      counts[r.docName] = (counts[r.docName] || 0) + 1;
    });

    const seen = new Set();
    return filtered.map(r => {
      const isFirst = !seen.has(r.docName);
      seen.add(r.docName);
      return {
        ...r,
        isFirstForDoc: isFirst,
        docRowSpan: counts[r.docName]
      };
    });
  }, [flattenedTests, searchQuery]);

  const handleExportCSV = () => {
    let csvContent = "Identifier,Application,Test Clause,Title & Topics,CL,ML,SL,Type\n";
    filteredAndProcessedRows.forEach(row => {
      const escape = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
      const cl = row.levels.includes('CELL') ? 'x' : '';
      const ml = row.levels.includes('MODULE') ? 'x' : '';
      const sl = row.levels.includes('PACK_SYSTEM') ? 'x' : '';
      const typeLabel = TYPE_LABELS[row.category] || row.category;
      
      const csvRow = [
        escape(row.docName),
        escape(row.app),
        escape(row.section),
        escape(row.testName),
        cl, ml, sl,
        escape(typeLabel)
      ].join(',');
      csvContent += csvRow + "\n";
    });

    // Add BOM for Excel UTF-8 support
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Standard_Matrix_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div id="global-matrix-modal" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      padding: isMobile ? '1rem' : '3rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div id="global-matrix-content" style={{
        backgroundColor: 'var(--bg-panel)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex', flexDirection: 'column',
        height: '100%', width: '100%',
        maxWidth: '1400px', margin: '0 auto',
        overflow: 'hidden'
      }}>
        <div className="no-print" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              總覽矩陣
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              總結所有標準的測試層級與分類
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="搜尋標準、項目..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)',
                minWidth: '200px'
              }}
            />
            <button onClick={handleExportCSV} style={actionBtnStyle}>
              <Icon name="download" size={15} />
              匯出 Excel (CSV)
            </button>
            <button onClick={handleExportPDF} style={actionBtnStyle}>
              <Icon name="printer" size={15} />
              匯出 PDF
            </button>
            <button type="button" className="modal-close" onClick={onClose} aria-label="關閉" style={{ position: 'static', marginLeft: '0.25rem' }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              載入中...
            </div>
          ) : (
            <table id="matrix-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <tr>
                  <th style={thStyle}>Identifier</th>
                  <th style={thStyle}>Application</th>
                  <th style={thStyle}>Test Clause</th>
                  <th style={thStyle}>Title & Topics</th>
                  <th style={thStyle}>CL</th>
                  <th style={thStyle}>ML</th>
                  <th style={thStyle}>SL</th>
                  <th style={thStyle}>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndProcessedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      沒有找到符合的測試項目
                    </td>
                  </tr>
                ) : (
                  filteredAndProcessedRows.map(row => {
                    const typeColor = TYPE_COLORS[row.category] || 'var(--text-muted)';
                    const typeLabel = TYPE_LABELS[row.category] || row.category;
                    
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
                        {row.isFirstForDoc && (
                          <td rowSpan={row.docRowSpan} style={{...tdStyle, fontWeight: 'bold', color: 'var(--accent-color)', verticalAlign: 'top', borderRight: '1px solid var(--border-color)'}}>
                            {row.docName}
                          </td>
                        )}
                        {row.isFirstForDoc && (
                          <td rowSpan={row.docRowSpan} style={{...tdStyle, color: 'var(--text-secondary)', verticalAlign: 'top', borderRight: '1px solid var(--border-color)'}}>
                            {row.app}
                          </td>
                        )}
                        <td style={tdStyle}>{row.section}</td>
                        <td style={{...tdStyle, color: 'var(--text-primary)'}}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="no-print" style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: typeColor, display: 'inline-block' }}></span>
                            {row.testName}
                          </div>
                        </td>
                        {LEVEL_KEYS.map(lk => {
                          const hasLevel = row.levels.includes(lk);
                          return (
                            <td key={lk} style={{...tdStyle, textAlign: 'center', fontWeight: 'bold', color: hasLevel ? 'var(--text-primary)' : 'transparent'}}>
                              {hasLevel ? 'x' : ''}
                            </td>
                          )
                        })}
                        <td style={{...tdStyle, color: 'var(--text-secondary)'}}>{typeLabel}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #global-matrix-modal, #global-matrix-modal * {
            visibility: visible;
          }
          #global-matrix-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            padding: 0 !important;
            background: white !important;
          }
          #global-matrix-content {
            box-shadow: none !important;
            border: none !important;
            max-width: none !important;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          #matrix-table {
            page-break-inside: auto;
            width: 100% !important;
          }
          #matrix-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          #matrix-table th, #matrix-table td {
            color: black !important;
            border: 1px solid #ddd !important;
            padding: 4px 8px !important;
          }
          #matrix-table thead {
            display: table-header-group;
          }
          #matrix-table tbody {
            display: table-row-group;
          }
        }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  borderBottom: '2px solid var(--border-color)'
};

const tdStyle = {
  padding: '0.6rem 0.75rem',
  borderBottom: '1px solid var(--border-color)'
};

const actionBtnStyle = {
  padding: '0.5rem 1rem', borderRadius: '6px',
  backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)',
  border: '1px solid var(--border-color)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontWeight: '600', fontSize: '0.85rem',
  boxShadow: 'var(--shadow-sm)'
};
