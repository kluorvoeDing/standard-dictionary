import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { Modal, IconButton, Source, Value } from '../lib/ui';
import { getOrgColor, levelLabel } from '../utils/orgColors';
import { sortConditionEntries } from '../utils/parameterDictionary';
import { toText, hasExemptions } from '../utils/testRecord';
import { baseOf, titleOf, yearOf, LEVEL_SHORT } from '../lib/library';
import { CATEGORY_ORDER, CATEGORY_LABELS, categoryOf, cleanTestName, citationCoverage } from '../lib/compare';

function ConditionTable({ test, rows }) {
  return (
    <table className="v-kv">
      <tbody>
        {rows.map(r => {
          const entry = { testId: test.id, param: r.rawKey, value: r.value || r.detail, source: r.source_reference };
          return (
            <tr key={r.rawKey}>
              <th scope="row">{r.label}</th>
              <td>
                <Value entry={entry} state="none" />
                {r.value && r.detail && r.detail !== r.value && <p className="v-detail">{r.detail}</p>}
              </td>
              <td className="v-kv-src">
                {r.source_reference
                  ? <Source testId={test.id} param={r.rawKey} text={r.source_reference} />
                  : <span className="v-nosrc" title="這個數值尚未附上原文條款">待補</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TestPane({ test }) {
  const rows = sortConditionEntries(test.conditions).filter(r => r.value || r.detail);
  const technical = rows.filter(r => r.category !== 'procedure');
  const procedure = rows.filter(r => r.category === 'procedure');
  const criteria = test.acceptance_criteria;
  const details = Array.isArray(criteria?.details) ? criteria.details.map(toText).filter(Boolean) : [];
  return (
    <article className="v-test">
      <header>
        <span className="v-clause">§ {test.section}</span>
        <h3>{cleanTestName(test.name_zh || test.id)}</h3>
        <span className="v-tags">{(test.test_objects || []).map(o => <i key={o}>{levelLabel(o)}</i>)}</span>
      </header>

      {technical.length > 0 && (<><h4>試驗條件</h4><ConditionTable test={test} rows={technical} /></>)}
      {procedure.length > 0 && (<><h4>試驗程序</h4><ConditionTable test={test} rows={procedure} /></>)}

      {toText(criteria?.summary) && (
        <>
          <h4>判定要求</h4>
          <div className="v-criteria">
            <strong data-sd-criteria data-test={test.id}>{toText(criteria.summary)}</strong>
            {details.length > 1 && <ul>{details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
          </div>
        </>
      )}

      {hasExemptions(test) && (
        <>
          <h4>豁免與例外</h4>
          <ul className="v-notes">{test.exemptions.map((ex, i) => <li key={i}>{toText(ex)}</li>)}</ul>
        </>
      )}

      {test.original_text_snippet && (
        <details className="v-quote">
          <summary>原文摘錄</summary>
          <p>{test.original_text_snippet}</p>
        </details>
      )}
    </article>
  );
}

function InfoPane({ doc, data, coverage }) {
  const d = data?.document || {};
  const levelText = (d.applicable_objects || doc.available_objects || []).map(levelLabel).join('、');
  return (
    <article className="v-test">
      <header><h3>標準資訊</h3></header>
      <table className="v-kv is-info">
        <tbody>
          <tr><th scope="row">名稱</th><td>{d.full_name_zh || d.full_name || doc.full_name}{d.full_name_zh && d.full_name && d.full_name !== d.full_name_zh && <p className="v-detail">{d.full_name}</p>}</td></tr>
          <tr><th scope="row">發布機構</th><td>{d.publisher || doc.publisher || '未記載'}</td></tr>
          <tr><th scope="row">發布日期</th><td>{d.publication_date || doc.publication_date || '未記載'}</td></tr>
          <tr>
            <th scope="row">版本狀態</th>
            <td>{doc.is_latest === false
              ? <span className="v-warn">已有新版：最新為 {doc.latest_version}，本庫收錄版本落後 {doc.versions_behind} 版</span>
              : <>收錄版本為最新版{doc.latest_version ? `（${doc.latest_version}）` : ''}</>}</td>
          </tr>
          {d.scope && <tr><th scope="row">適用範圍</th><td>{d.scope}</td></tr>}
          <tr><th scope="row">樣品層級</th><td>{levelText}</td></tr>
          <tr>
            <th scope="row">出處核對</th>
            <td>
              {coverage.total} 個數值中 {coverage.cited} 個已附原文條款（{Math.round(coverage.ratio * 100)}%）
              <p className="v-detail">已附條款的數值會標示「§ 條款號」；標示「待補」的數值尚未對照原文，引用前請自行查證。</p>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

export default function Viewer({ library, docId, testId, onNavigate, onClose, selected, onToggle, onNotice }) {
  const doc = library.catalog.find(c => c.document_id === docId);
  const data = library.docs[docId];
  const baseId = doc ? baseOf(doc) : docId;
  const versions = library.catalog
    .filter(c => baseOf(c) === baseId)
    .toSorted((a, b) => String(b.publication_date).localeCompare(String(a.publication_date)));
  const [level, setLevel] = useState('ALL');
  const [tocOpen, setTocOpen] = useState(false);
  const paneRef = useRef(null);
  const tocRef = useRef(null);

  const tests = useMemo(() => data?.tests || [], [data]);
  const visible = useMemo(() => tests.filter(t => level === 'ALL' || (t.test_objects || []).includes(level)), [tests, level]);
  const sections = useMemo(() => CATEGORY_ORDER
    .map(cat => [cat, visible.filter(t => categoryOf(t) === cat)])
    .filter(([, list]) => list.length), [visible]);
  const ordered = useMemo(() => sections.flatMap(([, list]) => list), [sections]);
  const levels = useMemo(() => [...new Set(tests.flatMap(t => t.test_objects || []))], [tests]);
  const coverage = useMemo(() => citationCoverage(data), [data]);
  const current = tests.find(t => t.id === testId);

  useEffect(() => { paneRef.current?.scrollTo(0, 0); }, [testId, docId]);
  useEffect(() => { tocRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' }); }, [testId]);

  // 上下鍵在目錄中移動。
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    e.preventDefault();
    const ids = ['', ...ordered.map(t => t.id)];
    const i = Math.max(0, ids.indexOf(testId || ''));
    const next = ids[Math.min(ids.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    onNavigate(docId, next);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onNotice('已複製連結');
    } catch {
      onNotice('無法複製，請直接複製網址列');
    }
  };

  if (!doc) return null;
  const color = getOrgColor(baseId);
  const isOn = selected.includes(baseId);
  const go = (id) => { onNavigate(docId, id); setTocOpen(false); };

  return (
    <Modal onClose={onClose} label={`${baseId} 查閱`} className="v-viewer">
      <div className="v-viewer-inner" onKeyDown={onKeyDown}>
        <header className="v-viewer-head">
          <span className="v-std-bar" style={{ background: color.solid }} aria-hidden="true" />
          <div className="v-viewer-title">
            <h2>{doc.display_name || baseId}</h2>
            <p>{titleOf(doc, data)}</p>
          </div>
          {versions.length > 1 && (
            <div className="v-seg is-small" role="group" aria-label="版本">
              {versions.map(v => (
                <button key={v.document_id} type="button" className={v.document_id === docId ? 'is-active' : ''} aria-pressed={v.document_id === docId} onClick={() => onNavigate(v.document_id, '')}>
                  {yearOf(v)} 版
                </button>
              ))}
            </div>
          )}
          <span className="v-viewer-meta">
            {doc.is_latest === false && <em>有新版</em>}
            <span title="已附原文條款的數值比例">出處 {Math.round(coverage.ratio * 100)}%</span>
          </span>
          <button type="button" className={`v-btn${isOn ? ' is-on' : ''}`} onClick={() => onToggle(baseId)}>
            <Icon name={isOn ? 'check' : 'plus'} size={14} />{isOn ? '已加入比對' : '加入比對'}
          </button>
          <IconButton icon="link" label="複製這一頁的連結" onClick={copyLink} />
          <IconButton icon="x" label="關閉" onClick={onClose} />
        </header>

        <div className="v-viewer-body">
          <button type="button" className="v-toc-toggle" onClick={() => setTocOpen(o => !o)} aria-expanded={tocOpen}>
            <Icon name="list" size={15} />{current ? cleanTestName(current.name_zh) : '標準資訊'}
            <span>{tests.length} 項</span>
            <Icon name="chevronDown" size={14} />
          </button>
          <nav ref={tocRef} className={`v-toc${tocOpen ? ' is-open' : ''}`} aria-label="測試項目目錄">
            <div className="v-toc-head">
              <strong>測試項目</strong><span>{visible.length === tests.length ? `${tests.length} 項` : `${visible.length} / ${tests.length} 項`}</span>
            </div>
            {levels.length > 1 && (
              <div className="v-seg is-small is-block" role="group" aria-label="樣品層級">
                {['ALL', ...levels].map(l => (
                  <button key={l} type="button" className={level === l ? 'is-active' : ''} aria-pressed={level === l} onClick={() => setLevel(l)}>
                    {l === 'ALL' ? '全部' : (LEVEL_SHORT[l] || levelLabel(l))}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="v-toc-item is-info" aria-current={!current} onClick={() => go('')}>標準資訊</button>
            {!data && <p className="v-toc-note">載入中…</p>}
            {sections.map(([cat, list]) => (
              <div key={cat}>
                <h5>{CATEGORY_LABELS[cat]}<span>{list.length}</span></h5>
                {list.map(t => (
                  <button key={t.id} type="button" className="v-toc-item" aria-current={t.id === testId} onClick={() => go(t.id)}>
                    <span className="v-toc-sec">{t.section}</span>
                    <span className="v-toc-name">{cleanTestName(t.name_zh || t.id)}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div ref={paneRef} className="v-pane">
            {current ? <TestPane test={current} /> : <InfoPane doc={doc} data={data} coverage={coverage} />}
          </div>
        </div>
      </div>
    </Modal>
  );
}
