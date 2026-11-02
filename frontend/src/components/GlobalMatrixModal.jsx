import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import '../styles/matrix.css';

function normalizeStandardData(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (!Array.isArray(out.tests) && Array.isArray(out.test_items)) {
    out.tests = out.test_items;
  }
  return out;
}

const LEVEL_KEYS = ['CELL', 'MODULE', 'PACK_SYSTEM'];

const LEVEL_HEAD = { CELL: '電芯', MODULE: '模組', PACK_SYSTEM: '電池包與系統' };

const TYPE_COLORS = {
  ELEC: 'var(--cat-elec-text)',
  MECH: 'var(--cat-mech-text)',
  THERM: 'var(--cat-therm-text)',
  ENV: 'var(--cat-env-text)',
  FIRE: 'var(--cat-fire-text)',
  BMS: 'var(--cat-bms-text)',
};

const TYPE_LABELS = {
  ELEC: '電氣安全', MECH: '機械安全', THERM: '熱安全', ENV: '環境安全', FIRE: '火燒', BMS: 'BMS 功能', OTHER: '其他',
};

// 去掉名稱結尾的英文括號，例如「外部短路測試 (External Short-Circuit Test)」
const stripEnglish = (x = '') => x.replace(/\s*[（(][A-Za-z][^)）]*[)）]/g, '').trim();

export default function GlobalMatrixModal({ isOpen, onClose, catalog }) {
  const panelRef = useRef(null);
  const [failed, setFailed] = useState([]);
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
          .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
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
      setFailed(uniqueDocs.filter((_, i) => !results[i]).map(d => d.base_standard_id || d.document_id));
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
            testName: test.name_zh || test.name_en || test.normalized_id || '',
            testTitle: stripEnglish(test.name_zh || test.name_en || test.normalized_id || ''),
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
        TYPE_LABELS[r.category]?.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q)
      );
    }
    
    const seen = new Set();
    return filtered.map(r => {
      const isFirst = !seen.has(r.docName);
      seen.add(r.docName);
      return { ...r, isFirstForDoc: isFirst };
    });
  }, [flattenedTests, searchQuery]);

  const handleExportCSV = () => {
    let csvContent = "標準,應用領域,條款,測試名稱,電芯,模組,電池包與系統,分類\n";
    filteredAndProcessedRows.forEach(row => {
      const escape = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
      const cl = row.levels.includes('CELL') ? 'x' : '';
      const ml = row.levels.includes('MODULE') ? 'x' : '';
      const sl = row.levels.includes('PACK_SYSTEM') ? 'x' : '';
      const typeLabel = TYPE_LABELS[row.category] || row.category;
      
      const csvRow = [
        escape(row.docName),
        escape(stripEnglish(row.app)),
        escape(row.section),
        escape(row.testTitle),
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
    link.setAttribute("download", "總覽矩陣.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Esc 關閉；開啟時焦點移到視窗內
  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 放到 body 底下：列印時才能隱藏其他頁面內容、讓表格完整分頁
  return createPortal(
    <div className="modal-backdrop mx-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mx-title"
        className="modal-panel mx-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close mx-noprint" onClick={onClose} aria-label="關閉"><Icon name="x" size={16} /></button>
        <div className="mx-head">
          <div>
            <h2 id="mx-title" className="mx-title">總覽矩陣</h2>
            <p className="mx-sub">所有標準的測試項目、適用層級與分類{!loading && `，共 ${filteredAndProcessedRows.length} 項`}</p>
          </div>
          <div className="mx-tools mx-noprint">
            <input
              type="search"
              className="mx-search"
              placeholder="搜尋標準、條款、測試名稱"
              aria-label="搜尋"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="button" className="topbar-btn" onClick={handleExportCSV} aria-label="匯出 CSV" title="匯出 CSV">
              <Icon name="download" size={16} />
              <span className="topbar-label">匯出 CSV</span>
            </button>
            <button type="button" className="topbar-btn" onClick={handleExportPDF} aria-label="列印" title="列印或存成 PDF">
              <Icon name="printer" size={16} />
              <span className="topbar-label">列印</span>
            </button>
          </div>
        </div>
        {failed.length > 0 && !loading && (
          <p className="mx-warn">有 {failed.length} 份標準載入失敗（{failed.join('、')}），表中未列出。</p>
        )}

        <div className="mx-body">
          {loading ? (
            <div className="mx-state">載入中…</div>
          ) : (
            <table id="matrix-table" className="mx-table">
              <thead>
                <tr>
                  <th className="c-doc">標準</th>
                  <th className="c-clause">條款</th>
                  <th className="c-app">應用領域</th>
                  <th>測試名稱</th>
                  {LEVEL_KEYS.map(lk => <th key={lk} className="c-lv">{LEVEL_HEAD[lk]}</th>)}
                  <th className="c-cat">分類</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndProcessedRows.length === 0 ? (
                  <tr><td colSpan={8} className="mx-empty">沒有符合的測試項目</td></tr>
                ) : (
                  filteredAndProcessedRows.map(row => (
                    <tr key={row.id} className={row.isFirstForDoc ? 'is-first' : undefined}>
                      <td className={`c-doc${row.isFirstForDoc ? '' : ' is-repeat'}`}>{row.docName}</td>
                      <td className="c-clause">{row.section}</td>
                      <td className={`c-app${row.isFirstForDoc ? '' : ' is-repeat'}`}>{stripEnglish(row.app)}</td>
                      <td className="c-name">
                        <span className="mx-name">
                          <span className="mx-dot" style={{ backgroundColor: TYPE_COLORS[row.category] }} aria-hidden="true" />
                          {row.testTitle}
                        </span>
                      </td>
                      {LEVEL_KEYS.map(lk => (
                        <td key={lk} className="c-lv">
                          {row.levels.includes(lk) ? <span aria-label="適用">✓</span> : null}
                        </td>
                      ))}
                      <td className="c-cat">{TYPE_LABELS[row.category] || row.category}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
