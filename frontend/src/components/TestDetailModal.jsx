import { useEffect } from 'react';
import Icon from './Icon';
import { sortConditionEntries } from '../utils/parameterDictionary';
import { levelLabel } from '../utils/orgColors';
import { toText, hasExemptions } from '../utils/testRecord';

export default function TestDetailModal({ record, baseId, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const entries = sortConditionEntries(record.conditions);
  const criteria = record.acceptance_criteria;
  const title = record.name_zh || record.name_en || '測試項目';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="關閉">
          <Icon name="x" size={16} />
        </button>

        <div style={{ paddingRight: '2.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{baseId}</span>
            {record.section && <span>§{record.section}</span>}
            {(record.test_objects || []).map(obj => <span key={obj} className="tag">{levelLabel(obj)}</span>)}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          {record.name_en && record.name_zh && (
            <div style={{ marginTop: '0.15rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>{record.name_en}</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {entries.length > 0 && (
            <section>
              <span className="modal-section-title">試驗條件</span>
              <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(7rem, max-content) 1fr', margin: 0, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {entries.map((entry, i) => (
                  <div key={entry.rawKey} style={{ display: 'contents' }}>
                    <dt style={{ padding: '0.55rem 0.8rem', background: 'var(--bg-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, borderTop: i ? '1px solid var(--border-color)' : 'none' }}>
                      {entry.label}
                    </dt>
                    <dd style={{ margin: 0, padding: '0.55rem 0.8rem', fontSize: '0.88rem', color: 'var(--text-primary)', borderTop: i ? '1px solid var(--border-color)' : 'none', minWidth: 0, wordBreak: 'break-word' }}>
                      <div style={{ fontWeight: 600 }}>{entry.value || entry.detail}</div>
                      {entry.value && entry.detail && entry.detail !== entry.value && (
                        <div style={{ marginTop: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55 }}>{entry.detail}</div>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {criteria && (
            <section>
              <span className="modal-section-title">判定要求</span>
              <div className="modal-box">
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{toText(criteria.summary)}</div>
                {Array.isArray(criteria.details) && criteria.details.length > 0 && (
                  <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {criteria.details.map((d, i) => <li key={i}>{toText(d)}</li>)}
                  </ul>
                )}
              </div>
            </section>
          )}

          {hasExemptions(record) && (
            <section>
              <span className="modal-section-title">豁免條款</span>
              <div className="modal-box">
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {record.exemptions.map((ex, i) => <li key={i}>{toText(ex)}</li>)}
                </ul>
              </div>
            </section>
          )}

          {record.original_text_snippet && (
            <section>
              <span className="modal-section-title">原文摘錄</span>
              <div className="modal-box" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {record.original_text_snippet}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
