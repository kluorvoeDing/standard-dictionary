import { useState, useEffect, useRef, useId } from 'react';
import Icon from './Icon';
import { hasExemptions } from '../utils/testRecord';
import { levelLabel } from '../utils/orgColors';

// One test (e.g. ELEC-SC-EXT) rendered as an aligned spec table:
// a row per parameter, a column per selected standard.
export default function ComparisonGroup({ group, columns, view, diffOnly, showLevelTags, gridTemplate, onOpenRecord }) {
  const [showProcedure, setShowProcedure] = useState(false);
  const [popover, setPopover] = useState(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const dialogTitleId = useId();
  const catKey = group.category.toLowerCase();

  const technicalRows = diffOnly ? view.technical.filter(r => r.state !== 'same') : view.technical;
  const hiddenCount = view.technical.length - technicalRows.length;

  const openPopover = (data, btnEl) => {
    triggerRef.current = btnEl;
    setPopover(data);
  };

  const closePopover = () => {
    setPopover(null);
    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      const el = triggerRef.current;
      requestAnimationFrame(() => el.focus());
    }
  };

  useEffect(() => {
    if (!popover) return;
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closePopover();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popover]);

  const labelCell = (text, className = '') => (
    <div className={`cmp-cell cmp-label ${className}`}>{text}</div>
  );

  const renderEntries = (entries, multi, rowLabel, baseId) => {
    if (!entries.length) return <span aria-label="未規定">—</span>;
    return entries.map((e, i) => {
      const hasDetail = Boolean(e.detail && e.detail !== e.value) || Boolean(e.source_reference);
      if (hasDetail) {
        return (
          <button
            key={i}
            type="button"
            className="cmp-entry cmp-entry--more"
            onClick={(ev) => openPopover({
              label: rowLabel,
              baseId,
              clause: e.clause,
              value: e.value,
              detail: e.detail && e.detail !== e.value ? e.detail : '',
              source_reference: e.source_reference || '',
            }, ev.currentTarget)}
          >
            {multi && e.clause && <span className="cmp-entry-clause">§{e.clause}</span>}
            {e.value}
            <span className="cmp-entry-info" aria-hidden="true">ⓘ</span>
          </button>
        );
      }
      return (
        <div key={i} className="cmp-entry">
          {multi && e.clause && <span className="cmp-entry-clause">§{e.clause}</span>}
          {e.value}
        </div>
      );
    });
  };

  const valueRow = (row, extraClass = '') => {
    const rowClass = row.state === 'diff' ? 'cmp-row-diff' : '';
    return [
      <div key={`${row.key}-l`} className={`cmp-cell cmp-label ${rowClass} ${extraClass}`}>
        {row.label}
      </div>,
      ...row.cells.map((entries, ci) => (
        <div key={`${row.key}-${ci}`} className={`cmp-cell cmp-val ${rowClass} ${extraClass} ${entries.length ? '' : 'is-empty'}`}>
          {renderEntries(entries, columns[ci].records.length > 1, row.label, columns[ci].baseId)}
        </div>
      )),
    ];
  };

  return (
    <section className="cmp-group" aria-label={group.nameZh}>
      <header className="cmp-group-head">
        <h3 className="cmp-group-title">{group.nameZh}</h3>
        <span className="tag tag-cat" style={{ background: `var(--cat-${catKey}, var(--cat-other))`, color: `var(--cat-${catKey}-text, var(--cat-other-text))` }}>
          {group.id}
        </span>
        {group.nameEn && <span className="cmp-group-en">{group.nameEn}</span>}
        <span className={`cmp-group-meta${view.diffCount ? ' has-diff' : ''}`}>
          {view.diffCount ? `${view.diffCount} 項不同` : ''}
        </span>
      </header>

      <div className="cmp-grid" style={{ gridTemplateColumns: gridTemplate }}>
        {/* 條款列 */}
        {labelCell('條款', 'is-first')}
        {columns.map(col => (
          <div key={col.baseId} className="cmp-cell cmp-val is-first cmp-clause-cell">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.3rem 0.45rem' }}>
              {col.status === 'ok' ? col.records.map(rec => (
                <span key={rec.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button type="button" className="cmp-clause" title={`查看 ${rec.name_zh || rec.id} 的完整內容`} onClick={() => onOpenRecord(rec, col.baseId)}>
                    §{rec.section || rec.id}
                  </button>
                  {showLevelTags && (rec.test_objects || []).map(obj => <span key={obj} className="tag">{levelLabel(obj)}</span>)}
                  {hasExemptions(rec) && <span className="tag tag-warn">豁免</span>}
                </span>
              )) : (
                <span className="cmp-note">{col.status === 'level' ? '此層級不適用' : '未涵蓋'}</span>
              )}
              {col.status !== 'ok' && col.prerequisites.map(req => (
                <span key={req} className="tag" title="實務上樣品需先通過的前提標準">前提：{req}</span>
              ))}
            </div>
          </div>
        ))}

        {/* 技術參數列 */}
        {technicalRows.map(row => valueRow(row))}
        {diffOnly && hiddenCount > 0 && (
          <div className="cmp-cell cmp-note" style={{ gridColumn: '1 / -1' }}>
            另有 {hiddenCount} 項條件各標準相同，已隱藏
          </div>
        )}

        {/* 試驗程序（預設收起，不標示差異） */}
        {view.procedure.length > 0 && (
          <button
            type="button"
            className="cmp-section-toggle"
            style={{ gridColumn: '1 / -1' }}
            aria-expanded={showProcedure}
            onClick={() => setShowProcedure(v => !v)}
          >
            <Icon name="chevronRight" size={14} className="chev" />
            試驗程序
            <span className="cmp-note">
              {view.procedure.map(r => r.label).join('、')}（{view.procedureChecked ? '已對照原文' : '部分數值尚未核對原文'}，不標示差異）
            </span>
          </button>
        )}
        {showProcedure && view.procedure.map(row => valueRow(row, 'cmp-proc'))}

        {/* 判定要求列 */}
        {labelCell('判定要求')}
        {view.criteria.map((entries, ci) => (
          <div key={`crit-${ci}`} className={`cmp-cell cmp-val ${entries.length ? '' : 'is-empty'}`}>
            {entries.length ? entries.map((e, i) => (
              <button
                key={i}
                type="button"
                className="cmp-entry cmp-entry--more cmp-criteria"
                onClick={(ev) => openPopover({
                  label: '判定要求',
                  baseId: columns[ci].baseId,
                  clause: e.clause,
                  value: e.summary,
                  detail: e.details && e.details.length ? e.details.join('\n') : '',
                  source_reference: '',
                }, ev.currentTarget)}
              >
                {columns[ci].records.length > 1 && <span className="cmp-entry-clause">§{e.clause}</span>}
                {e.summary}
                <span className="cmp-entry-info" aria-hidden="true">ⓘ</span>
              </button>
            )) : '—'}
          </div>
        ))}
      </div>

      {popover && (
        <div className="modal-backdrop" onClick={closePopover}>
          <div
            ref={dialogRef}
            className="modal-panel modal-panel--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={closePopover} aria-label="關閉">
              <Icon name="x" size={16} />
            </button>

            <div style={{ paddingRight: '2.5rem', marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{popover.baseId}</span>
                {popover.clause && <span>§{popover.clause}</span>}
              </div>
              <h4 id={dialogTitleId} style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {popover.label}
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="modal-box">
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {popover.value}
                </div>
                {popover.detail && (
                  <div style={{ marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {popover.detail}
                  </div>
                )}
              </div>

              {popover.source_reference && (
                <div>
                  <span className="modal-section-title">出處</span>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    §{popover.source_reference}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
