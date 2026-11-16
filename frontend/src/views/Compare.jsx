import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { Modal, IconButton, Source, Value } from '../lib/ui';
import { getOrgColor, levelLabel } from '../utils/orgColors';
import { hasExemptions } from '../utils/testRecord';
import { standardsOf, titleOf, yearOf, LEVEL_SHORT } from '../lib/library';
import { buildComparison, comparisonToCsv, CATEGORY_ORDER, CATEGORY_LABELS, LEVELS } from '../lib/compare';
import { MAX_COMPARE } from '../lib/url';

const EMPTY_TEXT = { uncovered: '未涵蓋此測試', na: '此層級不適用', unspecified: '—' };
const emptyKind = (status) => (status === 'ok' ? 'unspecified' : status);
const soleOwner = (group) => {
  const ok = group.cols.map((c, i) => (c.status === 'ok' ? i : -1)).filter(i => i >= 0);
  return ok.length === 1 ? ok[0] : -1;
};

function Empty({ status, baseId, showText }) {
  const kind = emptyKind(status);
  return (
    <span className={`c-empty is-${kind}`} data-sd-empty={kind} data-std={baseId}>
      {kind === 'unspecified' || showText ? EMPTY_TEXT[kind] : <span className="sr-only">{EMPTY_TEXT[kind]}</span>}
    </span>
  );
}

function Row({ group, row, names, baseIds, hidden, open, onToggle }) {
  const hasDetail = row.cells.some(cell => cell.some(e => e.detail));
  const rowId = `${group.key}/${row.key}`;
  return (
    <tr className={`c-row is-${row.tier}${open ? ' is-open' : ''}`} hidden={hidden}>
      <th scope="row">
        {hasDetail
          ? <button type="button" className="c-label" onClick={onToggle} aria-expanded={open} title="顯示補充說明">{row.label}<Icon name="chevronDown" size={12} /></button>
          : <span className="c-label">{row.label}</span>}
        {row.tier === 'differ' && <span className="c-tier is-differ">差異</span>}
        {row.tier === 'wording' && <span className="c-tier is-wording" title="數值、單位與條件相同，只有寫法不同">寫法不同</span>}
      </th>
      {row.cells.map((cell, ci) => (
        <td key={ci} data-label={names[ci]} className={cell.length ? '' : `is-void is-${emptyKind(group.cols[ci].status)}`}>
          {cell.length === 0 && <Empty status={group.cols[ci].status} baseId={baseIds[ci]} />}
          {cell.map((e, i) => (
            <div key={i} className="c-entry">
              {cell.length > 1 && <span className="c-clause">§ {e.clause}</span>}
              <Value entry={e} state={row.state} row={rowId} />
              <Source testId={e.testId} param={e.param} text={e.source} />
              {open && e.detail && <p className="v-detail">{e.detail}</p>}
            </div>
          ))}
        </td>
      ))}
    </tr>
  );
}

function GroupCard({ group, comparison, diffOnly, showProcedure, multiLevel, onOpenViewer }) {
  const [expanded, setExpanded] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [openRows, setOpenRows] = useState(() => new Set());
  const [soleOpen, setSoleOpen] = useState(false);
  const sole = soleOwner(group);
  const names = comparison.columns.map(c => c.doc.display_name || c.baseId);
  const baseIds = comparison.columns.map(c => c.baseId);
  const span = comparison.columns.length + 1;
  const { counts } = group;
  const rest = counts.same + counts.wording + counts.only;
  const hideRest = diffOnly && !expanded;
  const collapsed = (hideRest && counts.differ === 0) || (sole >= 0 && !soleOpen);
  const showProc = procOpen || showProcedure;
  const toggleRow = (key) => setOpenRows(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const restText = [
    counts.same && `${counts.same} 項相同`,
    counts.wording && `${counts.wording} 項寫法不同`,
    counts.only && `${counts.only} 項僅一份標準規定`,
  ].filter(Boolean).join('、');

  return (
    <section className={`c-card${collapsed ? ' is-collapsed' : ''}${sole >= 0 ? ' is-sole' : ''}`} id={`g-${group.key}`}>
      <header className="c-band">
        <h3>{group.name}</h3>
        <span className="c-cat">{CATEGORY_LABELS[group.category]}</span>
        {sole >= 0 ? (
          <button type="button" className="c-band-count c-sole" onClick={() => setSoleOpen(v => !v)} aria-expanded={soleOpen}>
            僅 {names[sole]} 規定<Icon name={soleOpen ? 'chevronDown' : 'chevronRight'} size={13} />
          </button>
        ) : (
          <span className="c-band-count">
            {counts.differ > 0 ? <strong>{counts.differ} 處差異</strong> : '無數值差異'}
          </span>
        )}
      </header>
      <table className="c-table">
        <colgroup>
          <col className="c-col-label" />
          {comparison.columns.map((c, ci) => <col key={c.baseId} className={comparison.columnStats[ci].tests === 0 ? 'c-col-narrow' : ''} />)}
        </colgroup>
        <thead className="c-print-head">
          <tr><th>{group.name}</th>{names.map(n => <th key={n}>{n}</th>)}</tr>
        </thead>
        <tbody>
          <tr className="c-row is-clause" hidden={collapsed}>
            <th scope="row"><span className="c-label">條款</span></th>
            {group.cols.map((col, ci) => (
              <td key={ci} data-label={names[ci]} className={col.status === 'ok' ? '' : `is-void is-${col.status} is-first`}>
                {col.status !== 'ok' && <span className="c-voidnote">{EMPTY_TEXT[col.status]}</span>}
                {col.records.map(rec => (
                  <span key={rec.id} className="c-ref">
                    <button type="button" className="c-clausebtn" onClick={() => onOpenViewer(col.docId, rec.id)} title="查閱這項測試的完整內容">§ {rec.section}</button>
                    {multiLevel && (rec.test_objects || []).map(o => <i key={o}>{LEVEL_SHORT[o] || levelLabel(o)}</i>)}
                    {hasExemptions(rec) && <i className="is-warn" title="這項測試有豁免或例外條款，點條款號查看">有豁免</i>}
                  </span>
                ))}
              </td>
            ))}
          </tr>

          {group.technical.map(row => (
            <Row key={row.key} group={group} row={row} names={names} baseIds={baseIds}
              hidden={(hideRest && row.tier !== 'differ') || (sole >= 0 && !soleOpen)} open={openRows.has(row.key)} onToggle={() => toggleRow(row.key)} />
          ))}

          {diffOnly && rest > 0 && !(sole >= 0 && !soleOpen) && (
            <tr className="c-more">
              <td colSpan={span}>
                <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>
                  <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={13} />
                  {expanded ? '收合沒有差異的條件' : `另有 ${restText}`}
                </button>
              </td>
            </tr>
          )}

          {group.procedure.length > 0 && (
            <tr className="c-more" hidden={collapsed}>
              <td colSpan={span}>
                <button type="button" onClick={() => setProcOpen(v => !v)} aria-expanded={showProc} disabled={showProcedure}>
                  <Icon name={showProc ? 'chevronDown' : 'chevronRight'} size={13} />
                  試驗程序 {group.procedure.length} 項<span>樣品數量、前置處理、觀察期</span>
                </button>
              </td>
            </tr>
          )}
          {group.procedure.map(row => (
            <Row key={row.key} group={group} row={row} names={names} baseIds={baseIds}
              hidden={collapsed || !showProc} open={openRows.has(row.key)} onToggle={() => toggleRow(row.key)} />
          ))}

          <tr className={`c-row is-criteria${openRows.has('#criteria') ? ' is-open' : ''}`} hidden={collapsed}>
            <th scope="row">
              <button type="button" className="c-label" onClick={() => toggleRow('#criteria')} aria-expanded={openRows.has('#criteria')} title="顯示判定細項">判定要求<Icon name="chevronDown" size={12} /></button>
            </th>
            {group.criteria.map((list, ci) => (
              <td key={ci} data-label={names[ci]} className={list.length ? '' : `is-void is-${emptyKind(group.cols[ci].status)}`}>
                {list.length === 0 && <Empty status={group.cols[ci].status} baseId={baseIds[ci]} />}
                {list.map(e => (
                  <div key={e.testId} className="c-entry">
                    {list.length > 1 && <span className="c-clause">§ {e.clause}</span>}
                    <span className="v-val" data-sd-criteria data-test={e.testId}>{e.summary}</span>
                    {openRows.has('#criteria') && e.details.length > 1 && <ul className="c-details">{e.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
                  </div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function Picker({ library, selected, onAdd, onClose }) {
  const [query, setQuery] = useState('');
  const items = standardsOf(library.catalog)
    .filter(s => !selected.includes(s.baseId))
    .filter(s => `${s.baseId} ${titleOf(s.latest, library.docs[s.latest.document_id])}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.baseId.localeCompare(b.baseId, 'en', { numeric: true }));
  return (
    <Modal onClose={onClose} label="新增比對標準" className="v-picker">
      <input autoFocus className="v-input" placeholder="輸入標準代號或名稱" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && items[0]) onAdd(items[0].baseId); }} />
      <ul>
        {items.map(s => (
          <li key={s.baseId}>
            <button type="button" onClick={() => onAdd(s.baseId)}>
              <i style={{ background: getOrgColor(s.baseId).solid }} />
              <strong>{s.baseId}</strong>
              <span>{titleOf(s.latest, library.docs[s.latest.document_id])}</span>
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="v-toc-note">沒有符合的標準</li>}
      </ul>
    </Modal>
  );
}

export default function Compare({ library, selected, view, setView, onBack, onRemove, onAdd, onOpenViewer, onNotice }) {
  const [showProcedure, setShowProcedure] = useState(false);
  const [picking, setPicking] = useState(false);
  const comparison = useMemo(() => buildComparison(selected, library, view), [selected, library, view]);
  const allCategories = useMemo(
    () => buildComparison(selected, library, { ...view, category: 'ALL' }).groups.map(g => g.category),
    [selected, library, view]
  );
  const categories = CATEGORY_ORDER.filter(c => allCategories.includes(c));
  const loading = comparison.columns.some(c => !c.loaded);
  const totalDiffer = comparison.groups.reduce((n, g) => n + g.counts.differ, 0);
  // 每個類別內，多份標準共有的測試排前面，只有一份標準規定的排後面並預設收合。
  const groups = useMemo(() => comparison.groups.toSorted((a, b) =>
    (CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
    || (Number(soleOwner(a) >= 0) - Number(soleOwner(b) >= 0))), [comparison.groups]);

  const toggleLevel = (level) => setView(prev => {
    const has = prev.levels.includes(level);
    if (has && prev.levels.length === 1) return prev;
    return { ...prev, levels: has ? prev.levels.filter(l => l !== level) : LEVELS.filter(l => l === level || prev.levels.includes(l)) };
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onNotice('已複製比對連結');
    } catch {
      onNotice('無法複製，請直接複製網址列');
    }
  };
  const exportCsv = () => {
    const blob = new Blob([comparisonToCsv(comparison)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `比對_${selected.join('_')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="c-page" style={{ '--cols': selected.length }}>
      <div className="c-toolbar">
        <button type="button" className="v-btn is-ghost" onClick={onBack}><Icon name="arrowLeft" size={15} />標準導覽</button>
        <div className="c-summary"><strong>{comparison.groups.length}</strong> 項測試<i />{totalDiffer > 0 ? <><strong>{totalDiffer}</strong> 處差異</> : '無數值差異'}</div>
        <div className="v-seg is-small" role="group" aria-label="樣品層級">
          {LEVELS.map(l => (
            <button key={l} type="button" className={view.levels.includes(l) ? 'is-active' : ''} aria-pressed={view.levels.includes(l)} onClick={() => toggleLevel(l)}>{LEVEL_SHORT[l]}</button>
          ))}
        </div>
        <div className="v-seg is-small" role="group" aria-label="測試類別">
          {['ALL', ...categories].map(c => (
            <button key={c} type="button" className={view.category === c ? 'is-active' : ''} aria-pressed={view.category === c} onClick={() => setView(prev => ({ ...prev, category: c }))}>{CATEGORY_LABELS[c]}</button>
          ))}
        </div>
        <div className="v-seg is-small is-strong" role="group" aria-label="檢視方式">
          <button type="button" className={!view.diffOnly ? 'is-active' : ''} aria-pressed={!view.diffOnly} onClick={() => setView(prev => ({ ...prev, diffOnly: false }))}>全部條件</button>
          <button type="button" className={view.diffOnly ? 'is-active' : ''} aria-pressed={view.diffOnly} onClick={() => setView(prev => ({ ...prev, diffOnly: true }))}>只看差異</button>
        </div>
        <label className="c-check"><input type="checkbox" checked={showProcedure} onChange={e => setShowProcedure(e.target.checked)} />展開試驗程序</label>
        <div className="c-tools">
          <IconButton icon="link" label="複製比對連結" onClick={copyLink} />
          <IconButton icon="download" label="匯出 CSV" onClick={exportCsv} />
          <IconButton icon="printer" label="列印" onClick={() => window.print()} />
        </div>
      </div>

      <div className="c-layout">
        <nav className="c-toc" aria-label="測試項目目錄">
          {groups.map((g, i) => (
            <div key={g.key}>
              {(i === 0 || groups[i - 1].category !== g.category) && <h5>{CATEGORY_LABELS[g.category]}</h5>}
              <a className={soleOwner(g) >= 0 ? 'is-sole' : ''} title={soleOwner(g) >= 0 ? '只有一份標準規定這項測試' : undefined} href={`#g-${g.key}`} onClick={(e) => { e.preventDefault(); document.getElementById(`g-${g.key}`)?.scrollIntoView({ block: 'start' }); }}>
                <span>{g.name}</span>
                {g.counts.differ > 0 && <b title={`${g.counts.differ} 處差異`}>{g.counts.differ}</b>}
              </a>
            </div>
          ))}
        </nav>

        <div className="c-main">
          <table className="c-table c-head">
            <colgroup>
              <col className="c-col-label" />
              {comparison.columns.map((c, ci) => <col key={c.baseId} className={comparison.columnStats[ci].tests === 0 ? 'c-col-narrow' : ''} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="c-head-corner">
                  {selected.length < MAX_COMPARE && (
                    <button type="button" className="v-btn is-ghost" onClick={() => setPicking(true)}><Icon name="plus" size={14} />新增標準</button>
                  )}
                </th>
                {comparison.columns.map((c, ci) => {
                  const stats = comparison.columnStats[ci];
                  const empty = stats.tests === 0;
                  return (
                    <th key={c.baseId} className={empty ? 'is-emptycol' : ''}>
                      <div className="c-colhead" style={{ '--org': getOrgColor(c.baseId).solid }}>
                        <button type="button" className="c-colname" onClick={() => onOpenViewer(c.doc.document_id, '')} title="查看標準資訊與全部測試項目">{c.doc.display_name || c.baseId}</button>
                        <button type="button" className="c-colx" onClick={() => onRemove(c.baseId)} aria-label={`移除 ${c.baseId}`} title="移除"><Icon name="x" size={13} /></button>
                        <div className="c-colmeta">
                          {c.versions.length > 1 ? (
                            <span className="v-seg is-tiny" role="group" aria-label="版本">
                              {c.versions.map(v => (
                                <button key={v.document_id} type="button" className={v.document_id === c.doc.document_id ? 'is-active' : ''} aria-pressed={v.document_id === c.doc.document_id}
                                  onClick={() => setView(prev => ({ ...prev, versions: { ...prev.versions, [c.baseId]: v.document_id } }))}>{yearOf(v)}</button>
                              ))}
                            </span>
                          ) : <span>{yearOf(c.doc)}</span>}
                          {empty
                            ? <em className="is-warn">此層級無測試</em>
                            : <><span>{stats.tests} 項</span><span title="畫面上這份標準的數值中，已附原文條款的比例">出處 {stats.values ? Math.round(stats.cited / stats.values * 100) : 0}%</span></>}
                          {c.doc.is_latest === false && <em title={`最新為 ${c.doc.latest_version || '更新版本'}`}>有新版</em>}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
          </table>

          <p className="c-legend">
            <span><i className="is-differ" />差異：數值、單位或條件不同</span>
            <span><i className="is-uncovered" />未涵蓋此測試</span>
            <span><i className="is-na" />此層級不適用</span>
            <span>— 有此測試但未規定該參數</span>
            <span>§ 已附原文條款；未標示者尚待補上出處</span>
          </p>

          {groups.map(g => (
            <GroupCard key={`${g.key}:${selected.join()}`} group={g} comparison={comparison} diffOnly={view.diffOnly}
              showProcedure={showProcedure} multiLevel={view.levels.length > 1} onOpenViewer={onOpenViewer} />
          ))}

          {comparison.groups.length === 0 && (
            <div className="v-empty"><p>{loading ? '資料載入中…' : '這個樣品層級與類別下，所選標準沒有可比較的測試。'}</p></div>
          )}
        </div>
      </div>

      {picking && <Picker library={library} selected={selected} onClose={() => setPicking(false)} onAdd={(id) => { onAdd(id); setPicking(false); }} />}
    </main>
  );
}
