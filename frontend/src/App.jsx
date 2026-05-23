import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SplitScreenGrid from './components/SplitScreenGrid';
import StandardMatrix from './components/StandardMatrix';
import './index.css';

function App() {
  const [catalog, setCatalog] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [testsData, setTestsData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);

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
