import React, { useState } from 'react';
import { sortConditionEntries } from '../utils/parameterDictionary';

// Robust string converter to avoid React child rendering issues
function toText(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join('；');
  if (typeof v === 'object') {
    return v.rule_zh || v.rule_en || v.value || v.detail || v.text || v.name_zh || '';
  }
  return String(v);
}

function SingleCard({ testRecord, diffOnly, diffKeys = new Set() }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { conditions, acceptance_criteria, exemptions, test_objects } = testRecord;
  const hasExemptions = exemptions && exemptions.length > 0 && exemptions[0] !== "None";

  // Sort condition entries using parameter dictionary
  const conditionEntries = sortConditionEntries(conditions);

  // Filter conditions if diffOnly is active
  const visibleConditions = diffOnly && diffKeys.size > 0
    ? conditionEntries.filter(c => diffKeys.has(c.rawKey))
    : conditionEntries;

  const hasDifferences = diffKeys.size > 0;
  const isRowIdentical = diffOnly && diffKeys.size === 0 && conditionEntries.length > 0;

  return (
    <>
      <div
        className="cmp-cell"
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          position: 'relative',
          flexGrow: 1,
          transition: 'all 0.15s ease'
        }}
      >
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {/* Test Objects badge */}
          {test_objects && test_objects.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {test_objects.map((obj, idx) => {
                const displayObj = obj === 'PACK_SYSTEM' ? 'System' : 
                                   obj === 'SINGLE_CELL_BATTERY' ? 'Single Cell' : 
                                   obj === 'COMPONENT_CELL' ? 'Comp. Cell' : 
                                   obj === 'BATTERY_SYSTEM' ? 'Batt. System' : 
                                   obj.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return (
                  <span key={idx} style={{
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '5px',
                    fontSize: '0.62rem',
                    fontWeight: 600
                  }}>
                    {displayObj}
                  </span>
                );
              })}
            </div>
          )}

          {hasExemptions && (
            <span style={{
              backgroundColor: 'var(--warning-color, #eab308)',
              color: '#fff',
              fontSize: '0.62rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              豁免
            </span>
          )}
        </div>

        {/* High-density Structured Key-Value Conditions */}
        {conditionEntries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {isRowIdentical ? (
              <div style={{
                padding: '0.45rem 0.6rem',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '6px',
                color: '#16a34a',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                lineHeight: 1.3
              }}>
                <span>✓</span>
                <span>所有測試條件跨標準完全一致</span>
              </div>
            ) : visibleConditions.length === 0 && diffOnly ? (
              <div style={{
                padding: '0.45rem 0.6rem',
                backgroundColor: 'var(--bg-color)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                textAlign: 'center'
              }}>
                無分歧參數 (已收合)
              </div>
            ) : (
              visibleConditions.map(entry => {
                const isDiff = diffKeys.has(entry.rawKey);
                return (
                  <div
                    key={entry.rawKey}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: isDiff ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-color)',
                      border: isDiff ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isDiff ? '#d97706' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>{entry.icon}</span>
                        <span>{entry.label}</span>
                      </span>
                      {isDiff && (
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '0.05rem 0.28rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: '#b45309'
                        }}>
                          ⚡ 差異
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word',
                      lineHeight: 1.35
                    }}>
                      {entry.value}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Criteria (Summary) */}
        {acceptance_criteria && (
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.45rem', marginTop: '0.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem' }}>🎯</span>
              <strong style={{ color: 'var(--success-color, #16a34a)', fontSize: '0.72rem' }}>判定要求</strong>
            </div>
            <div style={{
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}>
              {toText(acceptance_criteria.summary)}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Detail Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '1.75rem',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <h3 style={{ margin: 0, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span>{testRecord.name_zh || testRecord.name_en || '測試項目詳情'}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                ({testRecord.id})
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
              {/* Test Objects */}
              {test_objects && test_objects.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>適用樣品層級</strong>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {test_objects.map((obj, idx) => (
                      <span key={idx} style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem' }}>{obj}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions with Details */}
              {conditionEntries.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--accent-color)', fontSize: '0.92rem', display: 'block', marginBottom: '0.6rem' }}>
                    📋 試驗條件詳細規格 (Conditions)
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
                    {conditionEntries.map(entry => (
                      <div key={entry.rawKey} style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem' }}>
                          <span>{entry.icon}</span>
                          <span>{entry.label}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'monospace' }}>({entry.rawKey})</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: entry.detail ? '0.25rem' : 0 }}>
                          {entry.value}
                        </div>
                        {entry.detail && entry.detail !== entry.value && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px dashed var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                            {entry.detail}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Criteria */}
              {acceptance_criteria && (
                <div>
                  <strong style={{ color: 'var(--success-color, #16a34a)', fontSize: '0.92rem', display: 'block', marginBottom: '0.5rem' }}>
                    🎯 判定標準 (Criteria)
                  </strong>
                  <div style={{ backgroundColor: 'var(--success-bg, rgba(34, 197, 94, 0.08))', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px', color: 'var(--text-primary)' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.4rem' }}>{toText(acceptance_criteria.summary)}</div>
                    {acceptance_criteria.details && acceptance_criteria.details.length > 0 && (
                      <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {acceptance_criteria.details.map((detail, idx) => (
                          <li key={idx}>{toText(detail)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Exemptions */}
              {hasExemptions && (
                <div>
                  <strong style={{ color: 'var(--warning-color, #eab308)', fontSize: '0.92rem', display: 'block', marginBottom: '0.5rem' }}>
                    ⚠️ 豁免條款 (Exemptions)
                  </strong>
                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)' }}>
                      {exemptions.map((ex, idx) => (
                        <li key={idx}>{toText(ex)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Original Text Snippet */}
              {testRecord.original_text_snippet && (
                <div>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                    📖 法規原文依據 (Reference Snippet)
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-color)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {testRecord.original_text_snippet}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function StandardColumn({ testRecords, filterObjects, prerequisites, diffOnly, diffKeys }) {
  const emptyStyle = {
    padding: '0.5rem',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    opacity: 0.5,
    fontSize: '0.7rem',
    height: '100%',
    minHeight: '100px'
  };

  // Helper to extract prerequisite list
  const getPrerequisitesList = () => {
    let preReqList = [];
    if (prerequisites && filterObjects && filterObjects.length > 0) {
      filterObjects.forEach(obj => {
        const objKey = obj.replace('_SYSTEM', '');
        if (prerequisites[obj]) {
          preReqList.push(...prerequisites[obj]);
        } else if (prerequisites[objKey]) {
          preReqList.push(...prerequisites[objKey]);
        }
      });
    }
    return [...new Set(preReqList)];
  };

  const preReqList = getPrerequisitesList();

  const renderEmptyState = (mainText) => {
    return (
      <div style={{...emptyStyle, flexDirection: 'column', gap: '0.5rem'}}>
        <div>{mainText}</div>
        {preReqList.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginTop: '0.25rem',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.6rem', lineHeight: '1.4', textAlign: 'center', opacity: 0.8 }}>
              本標準未涵蓋此層級。實務上，樣品需先通過以下前提認證：
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              justifyContent: 'center'
            }}>
              {preReqList.map(req => (
                <span key={req} style={{
                  backgroundColor: 'rgba(128, 128, 128, 0.1)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '600'
                }}>
                  前提標準: {req}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!testRecords || testRecords.length === 0) {
    return renderEmptyState("無此測試");
  }

  const validRecords = testRecords.filter(record => {
    if (!record.test_objects) return false;
    if (filterObjects && filterObjects.length > 0) {
      return record.test_objects.some(obj => filterObjects.includes(obj));
    }
    return false;
  });

  if (validRecords.length === 0) {
    return renderEmptyState("樣品層級不符");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, height: '100%' }}>
      {validRecords.map((record, index) => (
        <SingleCard
          key={index}
          testRecord={record}
          diffOnly={diffOnly}
          diffKeys={diffKeys}
        />
      ))}
    </div>
  );
}
