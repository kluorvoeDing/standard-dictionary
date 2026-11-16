import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Home from './views/Home';
import Compare from './views/Compare';
import Viewer from './views/Viewer';
import Palette from './views/Palette';
import AiConsultantChat from './components/AiConsultantChat';
import GlobalMatrixModal from './components/GlobalMatrixModal';
import Icon from './components/Icon';
import { IconButton } from './lib/ui';
import { loadCatalog, loadDocs, baseOf, findTest, standardsOf } from './lib/library';
import { parseUrl, buildUrl, DEFAULT_VIEW, MAX_COMPARE } from './lib/url';
import './index.css';
import './v2.css';

const isEditable = (el) => !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export default function App() {
  const [library, setLibrary] = useState({ catalog: [], taxonomy: null, docs: {} });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState('home');
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [viewer, setViewer] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(null);
  const lastMode = useRef('home');
  const libraryRef = useRef(library);
  useEffect(() => { libraryRef.current = library; }, [library]);

  const showNotice = useCallback((text) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2600);
  }, []);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme]);

  // 網址 → 狀態。查閱的 doc 可省略，由測試代號反查。
  const applyUrl = useCallback((lib) => {
    const state = parseUrl(window.location.search, lib.catalog);
    let nextViewer = null;
    if (state.viewer) {
      const { docId, testId } = state.viewer;
      if (testId) {
        const hit = findTest(lib, testId, lib.catalog.some(c => c.document_id === docId) ? docId : '');
        if (hit) nextViewer = { docId: hit.docId, testId };
      } else if (lib.catalog.some(c => c.document_id === docId)) {
        nextViewer = { docId, testId: '' };
      }
    }
    lastMode.current = state.mode;
    setMode(state.mode);
    setSelected(state.selected);
    setView(state.view);
    setViewer(nextViewer);
  }, []);

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    loadCatalog()
      .then(async ({ catalog, taxonomy }) => {
        if (!alive) return;
        setLibrary({ catalog, taxonomy, docs: {} });
        const { docs, failed } = await loadDocs(catalog);
        if (!alive) return;
        const lib = { catalog, taxonomy, docs };
        setLibrary(lib);
        applyUrl(lib);
        setReady(true);
        if (failed.length) showNotice(`${failed.join('、')} 載入失敗，請重新整理`);
      })
      .catch((err) => { console.error(err); if (alive) setError(true); });
    return () => { alive = false; };
  }, [attempt, applyUrl, showNotice]);
  const retry = () => { setError(false); setAttempt(n => n + 1); };

  useEffect(() => {
    const onPop = () => applyUrl(libraryRef.current);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applyUrl]);

  // 狀態 → 網址。進出比對頁新增一筆歷史，其餘（篩選、開關查閱視窗）只取代目前這一筆。
  useEffect(() => {
    if (!ready) return;
    const target = buildUrl({ mode, selected, view, viewer });
    if (target !== window.location.pathname + window.location.search) {
      window.history[mode !== lastMode.current ? 'pushState' : 'replaceState'](null, '', target);
    }
    lastMode.current = mode;
  }, [ready, mode, selected, view, viewer]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(v => !v); }
      else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.isComposing && !isEditable(e.target)) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = useCallback((baseId) => {
    setSelected(prev => {
      if (prev.includes(baseId)) {
        const next = prev.filter(id => id !== baseId);
        if (next.length < 2) setMode('home');
        return next;
      }
      if (prev.length >= MAX_COMPARE) { showNotice(`最多同時比對 ${MAX_COMPARE} 份標準`); return prev; }
      return [...prev, baseId];
    });
  }, [showNotice]);

  const startCompare = useCallback(() => {
    // 預設樣品層級：所選標準共同涵蓋最多的層級，避免一進去就整欄空白。
    const cat = libraryRef.current.catalog;
    const score = (level) => selected.filter(id => cat.some(c => baseOf(c) === id && (c.available_objects || []).includes(level))).length;
    const best = ['CELL', 'MODULE', 'PACK_SYSTEM'].sort((a, b) => score(b) - score(a))[0];
    setView({ ...DEFAULT_VIEW, levels: [best], versions: {} });
    setMode('compare');
    window.scrollTo(0, 0);
  }, [selected]);

  const openViewer = useCallback((docId, testId = '') => { setViewer({ docId, testId }); setPaletteOpen(false); }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const askAi = useCallback((question) => { setAiMessage(question); setAiOpen(true); setPaletteOpen(false); }, []);

  const libraryCount = useMemo(() => standardsOf(library.catalog).length, [library.catalog]);

  return (
    <div className="v-app">
      <header className="v-top">
        <button type="button" className="v-brand" onClick={() => { setMode('home'); window.scrollTo(0, 0); }} title="回到標準導覽">
          <Icon name="book" size={18} /><span>標準字典</span>
        </button>
        <button type="button" className="v-search" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={15} />
          <span>搜尋標準、測試或數值</span>
          <kbd>/</kbd>
        </button>
        <div className="v-top-tools">
          <button type="button" className="v-btn is-ghost" onClick={() => setMatrixOpen(true)} title="全部標準的測試項目總覽，可匯出與列印"><Icon name="grid" size={15} /><span>總覽矩陣</span></button>
          <button type="button" className="v-btn is-ghost" onClick={() => setAiOpen(true)} title={selected.length ? `針對已選的 ${selected.length} 份標準提問` : '針對全部標準提問'}>
            <Icon name="sparkles" size={15} /><span>問 AI</span>
          </button>
          <IconButton icon={theme === 'light' ? 'moon' : 'sun'} label={theme === 'light' ? '切換為深色' : '切換為淺色'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
        </div>
      </header>

      {mode === 'compare' ? (
        <Compare
          library={library}
          selected={selected}
          view={view}
          setView={setView}
          onBack={() => setMode('home')}
          onRemove={toggle}
          onAdd={toggle}
          onOpenViewer={openViewer}
          onNotice={showNotice}
        />
      ) : (
        <Home
          library={library}
          selected={selected}
          onToggle={toggle}
          onView={openViewer}
          onCompare={startCompare}
          onClear={() => setSelected([])}
          error={error}
          onRetry={retry}
        />
      )}

      {viewer && (
        <Viewer
          library={library}
          docId={viewer.docId}
          testId={viewer.testId}
          onNavigate={openViewer}
          onClose={closeViewer}
          selected={selected}
          onToggle={toggle}
          onNotice={showNotice}
        />
      )}

      {paletteOpen && (
        <Palette
          library={library}
          ready={ready}
          selected={selected}
          onClose={() => setPaletteOpen(false)}
          onOpenTest={openViewer}
          onOpenStandard={openViewer}
          onToggle={toggle}
          onAskAi={askAi}
        />
      )}

      <AiConsultantChat
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        selectedDocs={selected}
        testsData={library.docs}
        initialMessage={aiMessage}
        onClearInitialMessage={() => setAiMessage(null)}
        libraryCount={libraryCount}
      />
      <GlobalMatrixModal isOpen={matrixOpen} onClose={() => setMatrixOpen(false)} catalog={library.catalog} />

      {notice && <div className="v-notice" role="status">{notice}</div>}
    </div>
  );
}
