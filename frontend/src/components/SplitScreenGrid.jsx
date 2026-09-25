import { useMemo, useState, useCallback } from 'react';
import ComparisonGroup from './ComparisonGroup';
import TestDetailModal from './TestDetailModal';
import Icon from './Icon';
import useIsMobile from '../hooks/useIsMobile';
import { buildGroupRows } from '../utils/compareRows';
import { getOrgColor } from '../utils/orgColors';

const CATEGORY_ORDER = ['ELEC', 'MECH', 'THERM', 'ENV', 'FIRE', 'BMS', 'OTHER'];
const CATEGORY_LABELS = {
  ALL: '全部', ELEC: '電氣安全', MECH: '機械安全', THERM: '熱安全', ENV: '環境安全', FIRE: '火燒', BMS: 'BMS 功能', OTHER: '其他',
};
const OBJECT_TYPES = [
  { id: 'CELL', label: 'Cell（電芯）' },
  { id: 'MODULE', label: 'Module（模組）' },
  { id: 'PACK_SYSTEM', label: 'Pack / System（電池包／系統）' },
];

function categoryOf(test) {
  const prefix = (test.normalized_id || '').split('-')[0];
  if (CATEGORY_ORDER.includes(prefix)) return prefix;
  if (CATEGORY_ORDER.includes(test.category)) return test.category;
  return 'OTHER';
}

function prerequisitesFor(doc, filterObjects) {
  const prereq = doc?.prerequisites || {};
  const list = [];
  filterObjects.forEach(obj => {
    const found = prereq[obj] || prereq[obj.replace('_SYSTEM', '')];
    if (found) list.push(...found);
  });
  return [...new Set(list)];
}

export default function SplitScreenGrid({ selectedDocIds, catalog, testsData, setIsComparing }) {
  const isMobile = useIsMobile();
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterObjects, setFilterObjects] = useState(['CELL']);
  const [diffOnly, setDiffOnly] = useState(false);
  const [activeVersions, setActiveVersions] = useState({});
  const [infoModalDocId, setInfoModalDocId] = useState(null);
  const [detail, setDetail] = useState(null);

  const closeDetail = useCallback(() => setDetail(null), []);
  const closeInfo = useCallback(() => setInfoModalDocId(null), []);

  const toggleObjectFilter = (objId) => {
    setFilterObjects(prev => prev.includes(objId) ? prev.filter(o => o !== objId) : [...prev, objId]);
  };

  // All catalog versions of each selected standard, newest first.
  const versionsByBase = useMemo(() => {
    const map = {};
    selectedDocIds.forEach(baseId => {
      map[baseId] = catalog
        .filter(c => (c.base_standard_id || c.document_id) === baseId)
        .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
    });
    return map;
  }, [selectedDocIds, catalog]);

  const activeDocFor = useCallback((baseId) => {
    const versions = versionsByBase[baseId] || [];
    const id = activeVersions[baseId] || versions[0]?.document_id || baseId;
    return versions.find(v => v.document_id === id) || { document_id: id };
  }, [versionsByBase, activeVersions]);

  // Group every test of every version by normalized_id. Tests without one stay on their own row.
  const groups = useMemo(() => {
    const map = new Map();
    selectedDocIds.forEach(baseId => {
      (versionsByBase[baseId] || []).forEach(ver => {
        (testsData[ver.document_id]?.tests || []).forEach(test => {
          const key = test.normalized_id || `id:${test.id}`;
          if (!map.has(key)) {
            const rawZh = test.name_zh || test.item_name_zh || test.normalized_id || test.id;
            map.set(key, {
              key,
              id: test.normalized_id || test.id,
              nameZh: rawZh.replace(/\s*\(.*?\)\s*$/, '').replace(/(試驗|測試)/g, ''),
              nameEn: test.name_en || test.item_name_en || '',
              category: categoryOf(test),
              records: {},
            });
          }
          const g = map.get(key);
          ((g.records[baseId] ||= {})[ver.document_id] ||= []).push(test);
        });
      });
    });
    return [...map.values()].sort((a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.nameZh.localeCompare(b.nameZh, 'zh-Hant'));
  }, [selectedDocIds, versionsByBase, testsData]);

  // Columns + aligned rows for each group, limited to the active version and selected sample levels.
  const views = useMemo(() => groups.map(group => {
    const columns = selectedDocIds.map(baseId => {
      const doc = activeDocFor(baseId);
      const all = group.records[baseId]?.[doc.document_id] || [];
      const records = all.filter(r => (r.test_objects || []).some(o => filterObjects.includes(o)));
      const status = records.length ? 'ok' : (all.length ? 'level' : 'none');
      return { baseId, records, status, prerequisites: status === 'ok' ? [] : prerequisitesFor(doc, filterObjects) };
    });
    return { group, columns, view: buildGroupRows(columns) };
  }).filter(v => v.columns.some(c => c.status === 'ok')), [groups, selectedDocIds, activeDocFor, filterObjects]);

  const presentCategories = CATEGORY_ORDER.filter(cat => views.some(v => v.group.category === cat));
  const inCategory = views.filter(v => filterCategory === 'ALL' || v.group.category === filterCategory);
  const visible = diffOnly ? inCategory.filter(v => !v.view.identical) : inCategory;
  const hiddenIdentical = inCategory.length - visible.length;

  const gridTemplate = isMobile
    ? `minmax(96px, 110px) repeat(${selectedDocIds.length}, minmax(170px, 1fr))`
    : `minmax(150px, 190px) repeat(${selectedDocIds.length}, minmax(240px, 1fr))`;

  const renderInfoModal = () => {
    if (!infoModalDocId) return null;
    const docData = testsData[infoModalDocId]?.document;
    if (!docData) return null;
    const catDoc = catalog.find(d => d.document_id === infoModalDocId);
    return (
      <div className="modal-backdrop" onClick={closeInfo}>
        <div className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
          <button type="button" className="modal-close" onClick={closeInfo} aria-label="關閉"><Icon name="x" size={16} /></button>

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '0 0 0.9rem', paddingRight: '2.5rem', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: getOrgColor(docData.id || '').solid, flexShrink: 0 }} />
            {docData.id || docData.short_name}
          </h2>

          {catDoc && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <span className="status-dot" style={{ background: catDoc.is_latest ? 'var(--success-color)' : 'var(--warning-color)' }} />
              {catDoc.is_latest
                ? <span>收錄版本即最新版（{catDoc.latest_version}）</span>
                : <span>已有更新版本：落後 <strong style={{ color: 'var(--text-primary)' }}>{catDoc.versions_behind}</strong> 版，最新為 <strong style={{ color: 'var(--text-primary)' }}>{catDoc.latest_version}</strong></span>}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
            <section>
              <span className="modal-section-title">標準名稱</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{docData.full_name_zh || '無中文名稱'}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{docData.full_name || ''}</div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <section>
                <span className="modal-section-title">發布機構</span>
                <div>{docData.publisher || '未記載'}</div>
              </section>
              <section>
                <span className="modal-section-title">發布日期</span>
                <div style={{ fontVariantNumeric: 'tabular-nums' }}>{docData.publication_date || '未記載'}</div>
              </section>
            </div>
            {docData.scope && (
              <section>
                <span className="modal-section-title">適用範圍</span>
                <div className="modal-box" style={{ lineHeight: 1.65, fontSize: '0.92rem' }}>{docData.scope}</div>
              </section>
            )}
            {docData.applicable_objects && (
              <section>
                <span className="modal-section-title">適用測試層級</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {docData.applicable_objects.map(obj => <span key={obj} className="tag">{obj}</span>)}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: isMobile ? '0.75rem 0.85rem' : '0.9rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
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
            {selectedDocIds.length} 份標準 · {visible.length} 項測試
          </span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem 1.5rem', alignItems: 'center', padding: isMobile ? '0.85rem' : '0.85rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.1rem' }}>測試類別</span>
          {['ALL', ...presentCategories].map(cat => (
            <button key={cat} className={`sm-filter${filterCategory === cat ? ' is-active' : ''}`} onClick={() => setFilterCategory(cat)}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '1.4rem', backgroundColor: 'var(--border-color)' }} />

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.1rem' }}>樣品層級</span>
          {OBJECT_TYPES.map(obj => {
            const isActive = filterObjects.includes(obj.id);
            return (
              <button key={obj.id} className={`sm-filter${isActive ? ' is-active' : ''}`} onClick={() => toggleObjectFilter(obj.id)} aria-pressed={isActive}>
                {isActive ? '✓ ' : ''}{obj.label}
              </button>
            );
          })}
        </div>

        <div style={{ width: '1px', height: '1.4rem', backgroundColor: 'var(--border-color)' }} />

        <button
          className={`sm-filter${diffOnly ? ' is-active' : ''}`}
          onClick={() => setDiffOnly(v => !v)}
          aria-pressed={diffOnly}
          title="只顯示各標準數值不同、或只有部分標準規定的條件"
        >
          {diffOnly ? '✓ ' : ''}只看差異
        </button>
      </div>

      <div className="scrollable" style={{ flexGrow: 1, padding: isMobile ? '0 0.75rem 0.75rem' : '0 1rem 1rem', overflowX: 'auto' }}>
        <div style={{ minWidth: 'min-content' }}>
          {/* 標準欄位標題（固定在上方） */}
          <div className="cmp-head">
            <div className="cmp-grid" style={{ gridTemplateColumns: gridTemplate, paddingTop: isMobile ? '0.75rem' : '1rem' }}>
              <div style={{ padding: '0.7rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>
                {diffOnly && hiddenIdentical > 0 ? `已隱藏 ${hiddenIdentical} 項完全相同的測試` : ''}
              </div>
              {selectedDocIds.map(baseId => {
                const versions = versionsByBase[baseId] || [];
                const doc = activeDocFor(baseId);
                const colors = getOrgColor(baseId);
                return (
                  <div key={baseId} style={{ padding: '0 0.3rem', minWidth: 0 }}>
                    <div
                      className="cmp-colhead"
                      role="button"
                      tabIndex={0}
                      onClick={() => setInfoModalDocId(doc.document_id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setInfoModalDocId(doc.document_id); } }}
                      title={`查看 ${doc.display_name || baseId} 詳細資訊`}
                      style={{ '--c-solid': colors.solid, backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderLeft: `3px solid ${colors.solid}`, borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2.5px', backgroundColor: colors.solid, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.display_name || baseId}
                          </span>
                        </span>
                        {versions.length > 1 && (
                          <span style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            {versions.map(ver => {
                              const isActive = ver.document_id === doc.document_id;
                              return (
                                <button
                                  key={ver.document_id}
                                  className={`cmp-ver${isActive ? ' is-active' : ''}`}
                                  onClick={() => setActiveVersions(prev => ({ ...prev, [baseId]: ver.document_id }))}
                                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', borderRadius: '6px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', backgroundColor: isActive ? colors.solid : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)', border: `1px solid ${isActive ? colors.solid : 'var(--border-color)'}` }}
                                >
                                  {String(new Date(ver.publication_date).getFullYear())}
                                </button>
                              );
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {visible.map(({ group, columns, view }) => (
            <ComparisonGroup
              key={group.key}
              group={group}
              columns={columns}
              view={view}
              diffOnly={diffOnly}
              showLevelTags={filterObjects.length > 1}
              gridTemplate={gridTemplate}
              onOpenRecord={(record, baseId) => setDetail({ record, baseId })}
            />
          ))}

          {visible.length === 0 && (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {filterObjects.length === 0 ? '請至少選擇一個樣品層級。' : diffOnly ? '目前條件下，各標準的測試條件完全相同。' : '目前條件下沒有可比較的測試。'}
            </div>
          )}
        </div>
      </div>

      {renderInfoModal()}
      {detail && <TestDetailModal record={detail.record} baseId={detail.baseId} onClose={closeDetail} />}
    </div>
  );
}
