import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SplitScreenGrid from './components/SplitScreenGrid';
import StandardMatrix from './components/StandardMatrix';
import AiConsultantChat from './components/AiConsultantChat';
import './index.css';

function App() {
  const [catalog, setCatalog] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [testsData, setTestsData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

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
    fetch('/data/catalog.json')
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
          fetch(`/${doc.schema_v2_json}`)
            .then(res => res.json())
            .then(data => {
              setTestsData(prev => ({
                ...prev,
                [doc.document_id]: data
              }));
            })
            .catch(err => console.error("Error loading JSON for", doc.document_id, err));
        }
      });
    });
  }, [selectedDocs, catalog, testsData]);

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
      <button
        onClick={() => setIsAiChatOpen(true)}
        style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 900,
          padding: '0.6rem 1.2rem', borderRadius: '9999px',
          background: 'linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%)', color: '#fff',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
          <path d="M5 3v4"/><path d="M3 5h4"/>
        </svg>
        AI 小幫手
      </button>

      <AiConsultantChat 
        isOpen={isAiChatOpen} 
        onClose={() => setIsAiChatOpen(false)} 
        selectedDocs={selectedDocs}
        testsData={testsData}
      />
      <Sidebar 
        catalog={catalog} 
        selectedDocs={selectedDocs} 
        toggleDocument={toggleDocument} 
        theme={theme}
        toggleTheme={toggleTheme}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />
      
      <div className="layout-main" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        {!isComparing ? (
          <StandardMatrix 
            catalog={catalog} 
            toggleDocument={toggleDocument} 
            selectedDocs={selectedDocs} 
            setIsComparing={setIsComparing} 
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
