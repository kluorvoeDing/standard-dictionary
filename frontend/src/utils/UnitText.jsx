import { Fragment } from 'react';

// Renders a value unchanged, but greys the unit that follows a number and the ± sign,
// so the figures are what the eye lands on. Only a number directly followed by a known
// unit is touched (3C, It A, CC-CV and similar are left alone); the text never changes.
const UNIT = /(\d)(\s?)(°C|mm\/s|kN|mΩ|mAh|mV|mA|mm|kPa|MPa|Hz|ms|Ah|kg|Wh|Ω|V|A|N|g|J|%|小時|分鐘|秒|天)(?![A-Za-z])|(±)/g;

export default function UnitText({ text }) {
  const s = String(text ?? '');
  const parts = [];
  let last = 0;
  for (const m of s.matchAll(UNIT)) {
    if (m[4]) {
      parts.push(s.slice(last, m.index), <span key={m.index} className="cmp-op">±</span>);
      last = m.index + 1;
    } else {
      const unitAt = m.index + m[1].length;
      parts.push(s.slice(last, unitAt) + m[2], <span key={m.index} className="cmp-unit">{m[3]}</span>);
      last = unitAt + m[2].length + m[3].length;
    }
  }
  parts.push(s.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}
