import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AiConsultantChat({ isOpen, onClose, selectedDocs, testsData }) {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: '您好！我是您的 **AI 法規顧問**。\n您可以詢問我任何關於「目前已選取標準」的問題。\n\n💡 *提示：請先在左側選單勾選您想了解的標準。*' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef(null);

  // Draggable window state
  const [pos, setPos] = useState({ x: window.innerWidth - 450, y: 80 }); 
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  // Draggable logic
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      let newX = e.clientX - rel.x;
      let newY = e.clientY - rel.y;
      
      // keep in bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
      
      setPos({ x: newX, y: newY });
      e.stopPropagation();
      e.preventDefault();
    };

    const onMouseUp = (e) => {
      setDragging(false);
      e.stopPropagation();
      e.preventDefault();
    };

    if (dragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, rel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isMinimized]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const now = Date.now();
    if (now - lastRequestTime < 10000) {
      const remaining = Math.ceil((10000 - (now - lastRequestTime)) / 1000);
      setMessages(prev => [...prev, { sender: 'System', text: `⏳ 請稍候 ${remaining} 秒後再發問，以避免 API 超載。` }]);
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'User', text: userMsg }]);
    setIsTyping(true);
    setLastRequestTime(now);
    setCooldown(10);

    const keys = [
      import.meta.env.VITE_GEMINI_API_KEY_1,
      import.meta.env.VITE_GEMINI_API_KEY_2
    ].filter(Boolean);

    if (keys.length === 0) {
      setMessages(prev => [...prev, { sender: 'System', text: '系統錯誤：未設定任何 VITE_GEMINI_API_KEY。' }]);
      setIsTyping(false);
      return;
    }

    const contextData = {};
    selectedDocs.forEach(id => {
      if (testsData[id]) contextData[id] = testsData[id];
    });

    const systemInstruction = `您是電池法規資料庫的「AI 法規顧問」。
目前使用者在畫面上勾選了以下標準：${selectedDocs.length > 0 ? selectedDocs.join(', ') : '無'}。
以下是這些標準的完整 JSON 資料：
${JSON.stringify(contextData)}

絕對遵守規則：
1. 您的回答必須「完全且僅」依據上方提供的 JSON 資料。
2. 若使用者的問題超出目前勾選的標準範圍，請委婉拒絕，並提醒使用者：「請先在畫面左側或上方選單勾選對應的標準，我才能為您解答」。
3. 使用專業且親切的繁體中文，強烈建議善用 Markdown 語法（例如：**粗體**、* 清單、> 引用）來排版，使回答乾淨易讀。`;

    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "了解，我會嚴格遵守上述規則，並使用 Markdown 排版作為您的專屬顧問。" }] }
    ];

    messages.forEach(m => {
      if (m.sender === 'User') contents.push({ role: "user", parts: [{ text: m.text }] });
      else if (m.sender === 'AI' && m.text) contents.push({ role: "model", parts: [{ text: m.text }] });
    });
    
    contents.push({ role: "user", parts: [{ text: userMsg }] });

    const requestBody = { contents };

    let aiResponseText = "";
    setMessages(prev => [...prev, { sender: 'AI', text: '' }]);

    const updateLastMessage = (newText) => {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = newText;
        return newMsgs;
      });
    };

    let success = false;
    for (let i = 0; i < keys.length; i++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${keys[i]}&alt=sse`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (response.status === 429) {
          console.warn(`Key ${i+1} rate limited. Switching to next key if available...`);
          if (i < keys.length - 1) {
             updateLastMessage(`【系統提示】第一把鑰匙忙碌中，自動切換至備援鑰匙...`);
          }
          continue;
        }
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        success = true;
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        aiResponseText = ""; 
        updateLastMessage("");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  aiResponseText += textChunk;
                  updateLastMessage(aiResponseText);
                }
              } catch (e) {}
            }
          }
        }
        break; 
      } catch (err) {
        if (i === keys.length - 1) {
          updateLastMessage(`【連線異常】無法取得回覆：${err.message}`);
        }
      }
    }

    if (!success && keys.length > 0) {
      updateLastMessage(`【系統警告】所有 API Key 皆已觸發限制或連線失敗，請稍後再試。`);
    }

    setIsTyping(false);
  };

  if (isMinimized) {
    return (
      <div 
        onMouseDown={onMouseDown}
        onClick={() => { if(!dragging) setIsMinimized(false); }}
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 10000,
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: 'var(--accent-color)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          cursor: dragging ? 'grabbing' : 'pointer',
          transition: dragging ? 'none' : 'transform var(--transition-fast)'
        }}
        onMouseEnter={(e) => { if(!dragging) e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { if(!dragging) e.currentTarget.style.transform = 'scale(1)'; }}
        title="打開 AI 法規顧問"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
          <path d="M5 3v4"/><path d="M3 5h4"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
      backgroundColor: 'var(--bg-panel)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      width: '400px', height: '600px',
      maxWidth: '90vw', maxHeight: '90vh',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden'
    }}>
      
      {/* Draggable Header */}
      <div 
        onMouseDown={onMouseDown}
        style={{ 
        padding: '1rem', borderBottom: '1px solid var(--border-color)', 
        backgroundColor: 'var(--accent-color)', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            <path d="M5 3v4"/><path d="M3 5h4"/>
          </svg>
          AI 法規顧問
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            已載入 {selectedDocs.length} 份標準
          </span>
          <button onClick={() => setIsMinimized(true)} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', padding: '0 4px'
          }} title="縮小為浮動按鈕">➖</button>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer', padding: '0'
          }} title="關閉">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ 
        flexGrow: 1, overflowY: 'auto', padding: '1rem', 
        display: 'flex', flexDirection: 'column', gap: '1rem',
        backgroundColor: 'var(--bg-color)'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'User';
          const isSys = msg.sender === 'System';
          return (
            <div key={idx} style={{
              alignSelf: isSys ? 'center' : (isUser ? 'flex-end' : 'flex-start'),
              maxWidth: '90%',
              display: 'flex', flexDirection: 'column', gap: '0.25rem'
            }}>
              <div style={{
                backgroundColor: isSys ? 'transparent' : (isUser ? 'var(--accent-color)' : 'var(--bg-panel)'),
                color: isSys ? 'var(--text-muted)' : (isUser ? '#fff' : 'var(--text-primary)'),
                padding: isSys ? '0' : '0.75rem 1rem',
                borderRadius: '12px',
                borderTopRightRadius: isUser ? '2px' : '12px',
                borderTopLeftRadius: !isUser && !isSys ? '2px' : '12px',
                border: isUser || isSys ? 'none' : '1px solid var(--border-color)',
                lineHeight: '1.6',
                fontSize: isSys ? '0.8rem' : '0.9rem',
                boxShadow: isUser || isSys ? 'none' : 'var(--shadow-sm)'
              }}>
                {isSys || isUser ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                ) : (
                  <ReactMarkdown components={{
                    p: ({node, ...props}) => <p style={{ margin: '0 0 0.75rem 0' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ fontWeight: '700' }} {...props} />,
                    a: ({node, ...props}) => <a style={{ color: 'var(--accent-color)', textDecoration: 'underline' }} {...props} />
                  }}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
           <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem', animation: 'pulse 1.5s infinite' }}>
             顧問正在思考中...
           </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)',
        display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={cooldown > 0 ? `冷卻中... (${cooldown}s)` : "詢問法規細節..."}
            disabled={isTyping || cooldown > 0}
            style={{
              flexGrow: 1, padding: '0.75rem', borderRadius: '8px', 
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim() || cooldown > 0}
            style={{
              padding: '0 1rem', borderRadius: '8px', cursor: (isTyping || !input.trim() || cooldown > 0) ? 'not-allowed' : 'pointer',
              backgroundColor: (isTyping || !input.trim() || cooldown > 0) ? 'var(--bg-color)' : 'var(--accent-color)',
              color: (isTyping || !input.trim() || cooldown > 0) ? 'var(--text-muted)' : '#fff',
              border: '1px solid var(--border-color)', fontWeight: 'bold',
              transition: 'all var(--transition-fast)'
            }}
          >
            送出
          </button>
        </div>
        {cooldown > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            為保護額度，發問間隔需等待 10 秒
          </div>
        )}
      </div>
    </div>
  );
}
