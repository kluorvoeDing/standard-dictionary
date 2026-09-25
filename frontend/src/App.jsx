import { useState, useEffect } from 'react';
import SplitScreenGrid from './components/SplitScreenGrid';
import StandardMatrix from './components/StandardMatrix';
import AiConsultantChat from './components/AiConsultantChat';
import GlobalMatrixModal from './components/GlobalMatrixModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import Icon from './components/Icon';
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  useEffect(() => {
    fetch(`/data/catalog.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const validDocs = data.filter(d => d.schema_v2_json);
        setCatalog(validDocs);
      })
      .catch(err => console.error("Error loading catalog:", err));
  }, []);

  useEffect(() => {
    selectedDocs.forEach(baseId => {
      const versions = catalog.filter(c => (c.base_standard_id || c.document_id) === baseId);
      versions.forEach(doc => {
        if (!testsData[doc.document_id] && doc.schema_v2_json) {
          fetch(`/${doc.schema_v2_json}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
              setTestsData(prev => ({
                ...prev,
                [doc.document_id]: normalizeStandardData(data)
              }));
            })
            .catch(err => console.error("Error loading JSON for", doc.document_id, err));
        }
      });
    });
  }, [selectedDocs, catalog, testsData]);

  // Number of distinct standards (versions of one standard count once).
  const libraryCount = new Set(catalog.map(c => c.base_standard_id || c.document_id)).size;

  const toggleDocument = (docId) => {
    if (selectedDocs.includes(docId)) {
      const newDocs = selectedDocs.filter(id => id !== docId);
      setSelectedDocs(newDocs);
      if (newDocs.length < 2) setIsComparing(false);
    } else {
      if (selectedDocs.length >= 5) {
        alert("為了最佳比較體驗，最多僅支援同時選取 5 份標準。");
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
        <button className="topbar-btn" onClick={() => setIsSearchOpen(true)} title="參數檢索（⌘K / Ctrl+K）">
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
              if (!selectedDocs.includes(id) && selectedDocs.length < 5) {
                toggleDocument(id);
              }
            });
          }
          setAiInitialMessage(question);
          setIsAiChatOpen(true);
        }}
      />

      <div className="layout-main" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        {!isComparing ? (
          <StandardMatrix 
            catalog={catalog} 
            toggleDocument={toggleDocument} 
            selectedDocs={selectedDocs} 
            setIsComparing={setIsComparing} 
            setSelectedDocs={setSelectedDocs}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        ) : (
          <SplitScreenGrid 
            selectedDocIds={selectedDocs} 
            catalog={catalog}
            testsData={testsData}
            setIsComparing={setIsComparing}
          />
        )}
      </div>
    </div>
  );
}

export default App;
