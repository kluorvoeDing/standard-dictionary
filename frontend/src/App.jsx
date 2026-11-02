import { useState, useEffect, useRef, useCallback } from 'react';
import SplitScreenGrid from './components/SplitScreenGrid';
import StandardMatrix from './components/StandardMatrix';
import AiConsultantChat from './components/AiConsultantChat';
import GlobalMatrixModal from './components/GlobalMatrixModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import Icon from './components/Icon';
import { useSearchHotkeys } from './hooks/useSearchHotkeys';
import './index.css';

// Some data files still use the legacy schema (`test_items` / `document_info`).
// Normalize them to the current schema (`tests` / `document`) so every consumer
// can rely on a single shape regardless of when the file was generated.
function normalizeStandardData(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };

  if (!Array.isArray(out.tests) && Array.isArray(out.test_items)) {
    out.tests = out.test_items;
  }

  if (!out.document && out.document_info) {
    const di = out.document_info;
    out.document = {
      id: di.standard_id,
      short_name: di.standard_id,
      full_name_zh: di.title_zh,
      full_name: di.title_en,
      scope: di.scope,
      publication_date: di.release_date,
      publisher: di.publisher,
    };
  }

  return out;
}

const MAX_COMPARE = 5;
const DEFAULT_VIEW = { category: 'ALL', objects: ['CELL'], diffOnly: false, versions: {} };
const VALID_OBJECTS = ['CELL', 'MODULE', 'PACK_SYSTEM'];

const csv = (list) => list.map(encodeURIComponent).join(',');
const uncsv = (text) => (text ? text.split(',').map(decodeURIComponent).filter(Boolean) : []);

// 比對狀態 <-> 網址。例：?c=GB31241,UL1642&lv=CELL,MODULE&cat=ELEC&diff=1&v=UL1642:UL1642-2022
function buildCompareUrl(docs, view) {
  const parts = [`c=${csv(docs)}`];
  parts.push(`lv=${csv(view.objects)}`);
  if (view.category !== 'ALL') parts.push(`cat=${encodeURIComponent(view.category)}`);
  if (view.diffOnly) parts.push('diff=1');
  const vers = Object.entries(view.versions || {}).filter(([base]) => docs.includes(base));
  if (vers.length) parts.push(`v=${vers.map(([b, d]) => `${encodeURIComponent(b)}:${encodeURIComponent(d)}`).join(',')}`);
  return `${window.location.pathname}?${parts.join('&')}`;
}

function parseCompareUrl(catalog) {
  const q = new URLSearchParams(window.location.search);
  if (!q.has('c')) return null;
  const baseIds = new Set(catalog.map(c => c.base_standard_id || c.document_id));
  const docs = [...new Set(uncsv(q.get('c')))].filter(id => baseIds.has(id)).slice(0, MAX_COMPARE);
  if (docs.length < 2) return null;
  const view = { ...DEFAULT_VIEW, versions: {} };
  if (q.has('lv')) view.objects = uncsv(q.get('lv')).filter(o => VALID_OBJECTS.includes(o));
  if (q.get('cat')) view.category = q.get('cat');
  view.diffOnly = q.get('diff') === '1';
  (q.get('v') || '').split(',').forEach(pair => {
    const [base, docId] = pair.split(':').map(x => (x ? decodeURIComponent(x) : ''));
    const ok = catalog.some(c => c.document_id === docId && (c.base_standard_id || c.document_id) === base);
    if (ok && docs.includes(base)) view.versions[base] = docId;
  });
  return { docs, view };
}

function App() {
  const [catalog, setCatalog] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [testsData, setTestsData] = useState({});
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isGlobalMatrixOpen, setIsGlobalMatrixOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const [notice, setNotice] = useState('');
  const catalogReady = useRef(false);
  const catalogRef = useRef([]);
  const wasComparing = useRef(false);
  const noticeTimer = useRef(null);

  const showNotice = useCallback((text) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 3000);
  }, []);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  // 從網址還原比對狀態（載入與瀏覽器上一頁／下一頁）。
  const restoreFromUrl = useCallback(() => {
    const parsed = parseCompareUrl(catalogRef.current);
    wasComparing.current = Boolean(parsed);
    if (parsed) {
      setSelectedDocs(parsed.docs);
      setViewState(parsed.view);
      setIsComparing(true);
    } else {
      setIsComparing(false);
      if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const onPop = () => { if (catalogReady.current) restoreFromUrl(); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [restoreFromUrl]);

  // 狀態寫回網址：進出比對頁用 pushState，比對頁內調整篩選用 replaceState。
  useEffect(() => {
    if (!catalogReady.current) return;
    const target = isComparing ? buildCompareUrl(selectedDocs, viewState) : window.location.pathname;
    if (target !== window.location.pathname + window.location.search) {
      const method = isComparing !== wasComparing.current ? 'pushState' : 'replaceState';
      window.history[method](null, '', target);
    }
    wasComparing.current = isComparing;
  }, [isComparing, selectedDocs, viewState]);

  // 由首頁進入比對時，篩選回到預設。
  const startComparing = useCallback((value) => {
    if (value) setViewState(DEFAULT_VIEW);
    setIsComparing(value);
  }, []);

  useSearchHotkeys(setIsSearchOpen);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [catalogError, setCatalogError] = useState(false);
  const loadCatalog = useCallback(() => {
    setCatalogError(false);
    fetch(`/data/catalog.json?t=${Date.now()}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        const validDocs = data.filter(d => d.schema_v2_json);
        setCatalog(validDocs);
        catalogRef.current = validDocs;
        catalogReady.current = true;
        restoreFromUrl();
      })
      .catch(err => { console.error('Error loading catalog:', err); setCatalogError(true); });
  }, [restoreFromUrl]);
  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  useEffect(() => {
    selectedDocs.forEach(baseId => {
      const versions = catalog.filter(c => (c.base_standard_id || c.document_id) === baseId);
      versions.forEach(doc => {
        if (!testsData[doc.document_id] && doc.schema_v2_json) {
          fetch(`/${doc.schema_v2_json}?t=${Date.now()}`)
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(data => {
              setTestsData(prev => ({
                ...prev,
                [doc.document_id]: normalizeStandardData(data)
              }));
            })
            .catch(err => {
              console.error('Error loading JSON for', doc.document_id, err);
              showNotice(`${doc.display_name || doc.document_id} 載入失敗，請重新整理`);
            });
        }
      });
    });
  }, [selectedDocs, catalog, testsData, showNotice]);

  // Number of distinct standards (versions of one standard count once).
  const libraryCount = new Set(catalog.map(c => c.base_standard_id || c.document_id)).size;

  const toggleDocument = (docId) => {
    if (selectedDocs.includes(docId)) {
      const newDocs = selectedDocs.filter(id => id !== docId);
      setSelectedDocs(newDocs);
      if (newDocs.length < 2) setIsComparing(false);
    } else {
      if (selectedDocs.length >= MAX_COMPARE) {
        showNotice(`最多同時比對 ${MAX_COMPARE} 份標準，請先取消其他標準。`);
        return;
      }
      setSelectedDocs([...selectedDocs, docId]);
    }
  };

  return (
    <div className="layout-app" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 900, display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <button className="topbar-btn is-icon" onClick={toggleTheme} title={theme === 'light' ? '切換為深色' : '切換為淺色'} aria-label="切換深淺色">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>
        <button className="topbar-btn" onClick={() => setIsSearchOpen(true)} title="搜尋（⌘K 或 /）">
          <Icon name="search" size={16} />
          <span className="topbar-label">參數檢索</span>
        </button>
        <button className="topbar-btn" onClick={() => setIsGlobalMatrixOpen(true)} title="全部標準的測試項目總覽">
          <Icon name="grid" size={16} />
          <span className="topbar-label">總覽矩陣</span>
        </button>
        <button className="topbar-ai" onClick={() => setIsAiChatOpen(true)} title="AI 小幫手">
          <Icon name="sparkles" size={18} />
          <span className="topbar-label">AI 小幫手</span>
        </button>
      </div>

      <AiConsultantChat 
        isOpen={isAiChatOpen} 
        onClose={() => setIsAiChatOpen(false)} 
        selectedDocs={selectedDocs}
        testsData={testsData}
        initialMessage={aiInitialMessage}
        onClearInitialMessage={() => setAiInitialMessage(null)}
        libraryCount={libraryCount}
      />

      <GlobalMatrixModal
        isOpen={isGlobalMatrixOpen}
        onClose={() => setIsGlobalMatrixOpen(false)}
        catalog={catalog}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        catalog={catalog}
        selectedDocs={selectedDocs}
        toggleDocument={toggleDocument}
        onAskAi={(question, targetDocs) => {
          if (targetDocs && targetDocs.length > 0) {
            targetDocs.forEach(id => {
              if (!selectedDocs.includes(id) && selectedDocs.length < MAX_COMPARE) {
                toggleDocument(id);
              }
            });
          }
          setAiInitialMessage(question);
          setIsAiChatOpen(true);
        }}
      />

      {notice && <div className="app-notice" role="status">{notice}</div>}

      <div className="layout-main" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        {!isComparing ? (
          <StandardMatrix 
            catalog={catalog} 
            toggleDocument={toggleDocument} 
            selectedDocs={selectedDocs} 
            setIsComparing={startComparing} 
            setSelectedDocs={setSelectedDocs}
            onOpenSearch={() => setIsSearchOpen(true)}
            catalogError={catalogError}
            onRetryCatalog={loadCatalog}
          />
        ) : (
          <SplitScreenGrid 
            selectedDocIds={selectedDocs} 
            catalog={catalog}
            testsData={testsData}
            setIsComparing={setIsComparing}
            viewState={viewState}
            setViewState={setViewState}
          />
        )}
      </div>
    </div>
  );
}

export default App;
