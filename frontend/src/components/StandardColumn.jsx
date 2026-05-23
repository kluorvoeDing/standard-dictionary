import React, { useState } from 'react';

function SingleCard({ testRecord }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { conditions, acceptance_criteria, exemptions, test_objects } = testRecord;
  const hasExemptions = exemptions && exemptions.length > 0 && exemptions[0] !== "None";

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '0.75rem',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          position: 'relative',
          flexGrow: 1
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', display: 'flex', gap: '0.25rem' }}>
          {hasExemptions && (
            <span style={{
              backgroundColor: 'var(--warning-color)',
              color: '#fff',
              fontSize: '0.6rem',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              豁免
            </span>
          )}
        </div>

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
                padding: '0.1rem 0.3rem',
                borderRadius: '9999px',
                fontSize: '0.6rem'
              }}>
                {displayObj}
              </span>
            )})}
          </div>
        )}

        {/* Conditions (Values only) */}
        {conditions && Object.keys(conditions).length > 0 && (
          <div>
            <strong style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}>條件</strong>
            <ul style={{ 
              paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', 
              color: 'var(--text-primary)', fontSize: '0.8rem',
              wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4'
            }}>
              {Object.entries(conditions).map(([key, item]) => (
                <li key={key}>
                  {item.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Criteria (Summary only) */}
        {acceptance_criteria && (
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <strong style={{ color: 'var(--success-color)', fontSize: '0.75rem' }}>判定</strong>
            <div style={{ 
              color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: '0.25rem', 
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4'
            }}>
              {acceptance_criteria.summary}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
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
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            backgroundColor: 'var(--bg-panel)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            maxWidth: '1000px',
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

            <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              測試項目詳細資訊
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                ({testRecord.id})
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem' }}>
              {/* Test Objects */}
              {test_objects && test_objects.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>適用樣品層級</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {test_objects.map((obj, idx) => (
                      <span key={idx} style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{obj}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {conditions && Object.keys(conditions).length > 0 && (
                <div>
                  <strong style={{ color: 'var(--accent-color)', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>測試條件 (Conditions)</strong>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', wordBreak: 'break-word' }}>
                    {Object.entries(conditions).map(([key, item]) => (
                      <li key={key}>
                        <strong>{item.value}</strong>
                        {item.detail && <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.6' }}>{item.detail}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Criteria */}
              {acceptance_criteria && (
                <div>
                  <strong style={{ color: 'var(--success-color)', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>判定標準 (Criteria)</strong>
                  <div style={{ backgroundColor: 'var(--success-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{acceptance_criteria.summary}</div>
                    {acceptance_criteria.details && acceptance_criteria.details.length > 0 && (
                      <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', wordBreak: 'break-word' }}>
                        {acceptance_criteria.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Exemptions */}
              {hasExemptions && (
                <div>
                  <strong style={{ color: 'var(--warning-color)', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>豁免條款 (Exemptions)</strong>
                  <div style={{ backgroundColor: 'var(--warning-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                      {exemptions.map((ex, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{ex}</li>
                      ))}
                    </ul>
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

export default function StandardColumn({ testRecords, filterObjects }) {
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

  if (!testRecords || testRecords.length === 0) {
    return <div style={emptyStyle}>無此測試</div>;
  }

  const validRecords = testRecords.filter(record => {
    if (!record.test_objects) return false;
    if (filterObjects && filterObjects.length > 0) {
      return record.test_objects.some(obj => filterObjects.includes(obj));
    }
    return false;
  });

  if (validRecords.length === 0) {
    return <div style={emptyStyle}>樣品層級不符</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, height: '100%' }}>
      {validRecords.map((record, index) => (
        <SingleCard key={index} testRecord={record} />
      ))}
    </div>
  );
}
