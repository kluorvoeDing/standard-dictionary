import { useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import UnitText from '../utils/UnitText';

/** 彈窗：Esc 或點背景關閉，開啟時把焦點移入，關閉後還給原本的元素。 */
export function Modal({ onClose, label, className = '', children }) {
  const panel = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = panel.current.querySelectorAll('button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    document.body.classList.add('has-modal');
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.classList.remove('has-modal');
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="v-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} className={`v-modal ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}

export function IconButton({ icon, label, onClick, active, className = '', ...rest }) {
  return (
    <button type="button" className={`v-iconbtn${active ? ' is-active' : ''} ${className}`} onClick={onClick} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={16} />
    </button>
  );
}

/** 條款出處。有出處才顯示；文字含資料的 source_reference 全文。 */
export function Source({ testId, param, text, hidden = false }) {
  if (!text) return null;
  return <span className="v-src" hidden={hidden} data-sd-source data-test={testId} data-param={param} title="原文條款出處">§ {text}</span>;
}

/** 一個條件值。文字內容就是資料的 value（單位以較淡顏色呈現，文字不變）。 */
export function Value({ entry, state, row, as: Tag = 'span', ...rest }) {
  return (
    <Tag
      className="v-val"
      data-sd-cell
      data-test={entry.testId}
      data-param={entry.param}
      data-state={state}
      data-row={row}
      data-provenance={entry.source ? 'cited' : 'uncited'}
      {...rest}
    >
      <UnitText text={entry.value} />
    </Tag>
  );
}

export function OrgDot({ color }) {
  return <span className="v-dot" style={{ background: color }} aria-hidden="true" />;
}
