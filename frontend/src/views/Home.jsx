import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { getOrgColor } from '../utils/orgColors';
import { standardsOf, titleOf, yearOf, applicationOf, APPLICATION_ORDER, LEVEL_SHORT } from '../lib/library';
import { LEVELS } from '../lib/compare';
import { MAX_COMPARE } from '../lib/url';

const LEVEL_CHAR = { CELL: '芯', MODULE: '模', PACK_SYSTEM: '包' };

const ORGS = [
  ['中國 GB', 'var(--org-gb-solid)'],
  ['北美 UL', 'var(--org-ul-solid)'],
  ['國際 IEC、UN', 'var(--org-intl-solid)'],
  ['其他', 'var(--org-other-solid)'],
];

export default function Home({ library, selected, onToggle, onView, onCompare, onClear, error, onRetry }) {
  const [level, setLevel] = useState('ALL');

  const groups = useMemo(() => {
    const map = new Map();
    standardsOf(library.catalog).forEach(std => {
      const app = applicationOf(std.latest);
      if (!map.has(app)) map.set(app, []);
      map.get(app).push(std);
    });
    const rank = (app) => { const i = APPLICATION_ORDER.indexOf(app); return i < 0 ? 99 : i; };
    return [...map.entries()]
      .sort((a, b) => rank(a[0]) - rank(b[0]))
      .map(([app, items]) => [app, items.sort((a, b) => a.baseId.localeCompare(b.baseId, 'en', { numeric: true }))]);
  }, [library.catalog]);

  const total = groups.reduce((n, [, items]) => n + items.length, 0);
  const matches = (std) => level === 'ALL' || (std.latest.available_objects || []).includes(level);

  if (error) {
    return (
      <main className="v-home">
        <div className="v-empty">
          <p>標準目錄載入失敗。</p>
          <button type="button" className="v-btn" onClick={onRetry}>重新載入</button>
        </div>
      </main>
    );
  }

  return (
    <main className="v-home">
      <div className="v-home-bar">
        <h1>電池安全標準 <span className="v-count">{total} 份</span></h1>
        <div className="v-seg" role="group" aria-label="樣品層級">
          {['ALL', ...LEVELS].map(l => (
            <button key={l} type="button" className={level === l ? 'is-active' : ''} aria-pressed={level === l} onClick={() => setLevel(l)}>
              {l === 'ALL' ? '全部層級' : LEVEL_SHORT[l]}
            </button>
          ))}
        </div>
        <div className="v-legend" aria-hidden="true">
          {ORGS.map(([name, color]) => <span key={name}><i style={{ background: color }} />{name}</span>)}
        </div>
      </div>

      <div className="v-home-grid">
        {groups.map(([app, items]) => (
          <section key={app} className="v-panel">
            <h2>{app}<span>{items.length}</span></h2>
            <ul>
              {items.map(std => {
                const doc = std.latest;
                const isOn = selected.includes(std.baseId);
                const dim = !matches(std);
                const full = !isOn && selected.length >= MAX_COMPARE;
                return (
                  <li key={std.baseId} className={`v-std${isOn ? ' is-on' : ''}${dim ? ' is-dim' : ''}`}>
                    <button
                      type="button"
                      className="v-std-main"
                      aria-pressed={isOn}
                      disabled={full}
                      title={full ? `最多比對 ${MAX_COMPARE} 份` : isOn ? '取消選取' : '加入比對'}
                      onClick={() => onToggle(std.baseId)}
                    >
                      <span className="v-check" aria-hidden="true">{isOn && <Icon name="check" size={12} strokeWidth={3} />}</span>
                      <span className="v-std-bar" style={{ background: getOrgColor(std.baseId).solid }} aria-hidden="true" />
                      <span className="v-std-code">{std.baseId}</span>
                      <span className="v-std-title">{titleOf(doc, library.docs[doc.document_id])}</span>
                      <span className="v-std-meta">
                        {doc.is_latest === false && <em title={`最新為 ${doc.latest_version || '更新版本'}`}>有新版</em>}
                        {std.versions.length > 1 && <em className="is-plain">{std.versions.length} 版</em>}
                        <span className="v-year">{yearOf(doc)}</span>
                        <span className="v-levels" aria-label={(doc.available_objects || []).map(o => LEVEL_SHORT[o] || o).join('、')}>
                          {LEVELS.map(l => <i key={l} className={(doc.available_objects || []).includes(l) ? 'is-on' : ''} title={LEVEL_SHORT[l]}>{LEVEL_CHAR[l] || LEVEL_SHORT[l][0]}</i>)}
                        </span>
                        <span className="v-num">{doc.test_count_v2 ?? doc.item_count} 項</span>
                      </span>
                    </button>
                    <button type="button" className="v-std-view" onClick={() => onView(doc.document_id)} aria-label={`查閱 ${std.baseId}`}>查閱</button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="v-tray" role="region" aria-label="已選標準">
          <div className="v-tray-chips">
            {selected.map(id => (
              <button key={id} type="button" className="v-chip" onClick={() => onToggle(id)} title={`移除 ${id}`}>
                <i style={{ background: getOrgColor(id).solid }} />{id}<Icon name="x" size={12} />
              </button>
            ))}
          </div>
          <button type="button" className="v-link" onClick={onClear}>清空</button>
          <button type="button" className="v-btn is-primary" disabled={selected.length < 2} onClick={onCompare}>
            {selected.length < 2 ? '再選 1 份即可比對' : `比對 ${selected.length} 份`}
          </button>
        </div>
      )}
    </main>
  );
}
