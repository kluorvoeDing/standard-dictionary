import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import useIsMobile from '../hooks/useIsMobile';

const GREETING = {
  sender: 'AI',
  isGreeting: true,
  text: '您好，我是您的 **AI 小幫手**。\n可以針對「目前已選取的標準」回答比較與法規問題。',
};

export default function AiConsultantChat({ isOpen, onClose, selectedDocs, testsData }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const isMobile = useIsMobile();
  const [isTyping, setIsTyping] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef(null);

  // Draggable window state
  const [pos, setPos] = useState({ x: window.innerWidth - 520, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  // Fullscreen table zoom state (holds the rendered table HTML)
  const [zoomContent, setZoomContent] = useState(null);

  // Resizable window state
  const [size, setSize] = useState({ w: 480, h: 680 });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const onResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    setResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.w, h: size.h });
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const newW = Math.max(320, Math.min(resizeStart.w + (e.clientX - resizeStart.x), window.innerWidth - 20));
      const newH = Math.max(360, Math.min(resizeStart.h + (e.clientY - resizeStart.y), window.innerHeight - 20));
      setSize({ w: newW, h: newH });
      e.preventDefault();
    };
    const onUp = () => setResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [resizing, resizeStart]);

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

  const resetChat = () => {
    setMessages([GREETING]);
    setInput('');
  };

  const handleSend = async (overrideText) => {
    const userMsg = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!userMsg || isTyping) return;

    const now = Date.now();
    if (now - lastRequestTime < 5000) {
      const remaining = Math.ceil((5000 - (now - lastRequestTime)) / 1000);
      setMessages(prev => [...prev, { sender: 'System', text: `⏳ 請稍候 ${remaining} 秒後再發問，以避免 API 超載。` }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { sender: 'User', text: userMsg }]);
    setIsTyping(true);
    setLastRequestTime(now);
    setCooldown(5);

    // 只送「標準代號 + 對話」，context 與系統指令改由後端組裝
    // （好處：上傳量小、回應快、系統指令前端無法竄改）
    const history = messages
      .filter(m => !m.isGreeting && (m.sender === 'User' || (m.sender === 'AI' && m.text)))
      .map(m => ({ role: m.sender === 'User' ? 'user' : 'model', text: m.text }));
    history.push({ role: 'user', text: userMsg });

    const requestBody = { selectedDocIds: selectedDocs, messages: history };

    let aiResponseText = "";
    setMessages(prev => [...prev, { sender: 'AI', text: '' }]);

    const updateLastMessage = (newText) => {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = newText;
        return newMsgs;
      });
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errMsg = `伺服器錯誤: ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.details) {
            errMsg += `\n詳細資訊: ${JSON.stringify(errData.details)}`;
          } else if (errData.error) {
            errMsg += `\n${errData.error}`;
          }
        } catch (e) {
          // Ignore
        }
        throw new Error(errMsg);
      }
      
      const usedEngineIndex = response.headers.get('X-Used-Engine-Index');
      const engineType = response.headers.get('X-Used-Engine-Type');
      
      let prefixMsg = '';
      if (usedEngineIndex === '1') {
        prefixMsg = `*（主線路忙碌，已自動切換備援模型）*\n\n`;
      }
      
      if (prefixMsg) updateLastMessage(prefixMsg);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in the buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]' || !dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              let textChunk = "";
              if (engineType === 'openai') {
                textChunk = data.choices?.[0]?.delta?.content || "";
              } else {
                textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
              }
              
              if (textChunk) {
                aiResponseText += textChunk;
                updateLastMessage(prefixMsg + aiResponseText);
              }
            } catch (e) {
              console.warn("SSE Parse Warning", e, dataStr);
            }
          }
        }
      }
    } catch (err) {
      if (err.message.includes('504')) {
        updateLastMessage(aiResponseText ? (aiResponseText + `\n\n*(連線中斷：處理超時，僅列出部分結果)*`) : `【連線異常】伺服器處理超時 (504)，請嘗試減少勾選的標準數量再試一次。`);
      } else {
        updateLastMessage(`【連線異常】無法取得回覆：${err.message}`);
      }
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
        title="打開 AI 小幫手"
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
      position: 'fixed', zIndex: 9999,
      backgroundColor: 'var(--bg-panel)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      ...(isMobile
        ? { left: 0, top: 0, width: '100vw', height: '100dvh', borderRadius: 0, border: 'none' }
        : { left: pos.x, top: pos.y, width: `${size.w}px`, height: `${size.h}px`, maxWidth: '95vw', maxHeight: '92vh', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' })
    }}>
      
      {/* Draggable Header (drag disabled on mobile) */}
      <div
        onMouseDown={isMobile ? undefined : onMouseDown}
        style={{
        padding: '0.8rem 0.9rem 0.8rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)',
        backgroundColor: 'var(--accent-color)', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem',
        cursor: isMobile ? 'default' : (dragging ? 'grabbing' : 'grab'),
        userSelect: 'none', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
            <path d="M5 3v4"/><path d="M3 5h4"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>AI 小幫手</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.85, whiteSpace: 'nowrap' }}>
              {selectedDocs.length > 0 ? `已載入 ${selectedDocs.length} 份標準` : '尚未選取標準'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', flexShrink: 0 }}>
          {[
            { key: 'reset', label: '↺', title: '開新對話', onClick: resetChat, size: '1.05rem' },
            { key: 'min', label: '➖', title: '縮小為浮動按鈕', onClick: () => setIsMinimized(true), size: '0.95rem' },
            { key: 'close', label: '✕', title: '關閉', onClick: onClose, size: '1.1rem' },
          ].map(b => (
            <button key={b.key} className="chat-iconbtn" onClick={b.onClick} title={b.title} aria-label={b.title}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: b.size }}>
              {b.label}
            </button>
          ))}
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { throwOnError: false, errorColor: '#cc3333' }]]}
                    components={{
                    p: ({node, ...props}) => <p style={{ margin: '0 0 0.75rem 0' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ fontWeight: '700' }} {...props} />,
                    a: ({node, ...props}) => <a style={{ color: 'var(--accent-color)', textDecoration: 'underline' }} {...props} />,
                    // 表格：包水平捲動外框 + 右上角「放大」按鈕（全螢幕檢視）
                    table: ({node, ...props}) => (
                      <div style={{ position: 'relative', margin: '0 0 0.75rem 0' }}>
                        <button
                          onClick={(e) => {
                            const tbl = e.currentTarget.parentElement.querySelector('table');
                            if (tbl) setZoomContent(tbl.outerHTML);
                          }}
                          title="點擊放大表格"
                          style={{
                            position: 'absolute', top: '4px', right: '4px', zIndex: 2,
                            background: 'var(--accent-color)', color: '#fff', border: 'none',
                            borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem',
                            cursor: 'pointer', opacity: 0.85, boxShadow: 'var(--shadow-sm)'
                          }}
                        >🔍 放大</button>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }} {...props} />
                        </div>
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead style={{ backgroundColor: 'var(--bg-color)' }} {...props} />,
                    th: ({node, ...props}) => <th style={{ border: '1px solid var(--border-color)', padding: '0.6rem 1.1rem', textAlign: 'left', fontWeight: '700', whiteSpace: 'nowrap' }} {...props} />,
                    td: ({node, ...props}) => <td style={{ border: '1px solid var(--border-color)', padding: '0.6rem 1.1rem', verticalAlign: 'top', minWidth: '120px' }} {...props} />,
                    code: ({node, inline, ...props}) => inline
                      ? <code style={{ backgroundColor: 'var(--bg-color)', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.85em' }} {...props} />
                      : <code style={{ display: 'block', backgroundColor: 'var(--bg-color)', padding: '0.6rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85em' }} {...props} />
                  }}>
                    {msg.text.replace(/<br\s*\/?>/gi, ' ')}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {messages.length === 1 && !isTyping && (() => {
          const suggestions = selectedDocs.length >= 2
            ? ['總結這幾份標準的核心差異', '比較它們的熱濫用測試條件', '外部短路測試有什麼不同？']
            : selectedDocs.length === 1
              ? [`${selectedDocs[0]} 涵蓋哪些測試項目？`, `${selectedDocs[0]} 的適用範圍是什麼？`, '常見的鋰電池安全測試有哪些？']
              : ['鋰電池常見的安全測試有哪些？', '什麼是 UN 38.3？', 'GB 與 UL 標準有何不同？'];
          return (
            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {selectedDocs.length > 0 ? '試試這些問題：' : '可先回矩陣選取標準，或先問問看：'}
              </span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggest"
                  onClick={() => handleSend(s)}
                  style={{ textAlign: 'left', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.55rem' }}
                >
                  <span style={{ color: 'var(--accent-color)', flexShrink: 0 }} aria-hidden="true">✦</span>
                  {s}
                </button>
              ))}
            </div>
          );
        })()}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', borderTopLeftRadius: '2px', padding: '0.7rem 0.9rem', boxShadow: 'var(--shadow-sm)' }}>
            <span className="chat-dots" aria-label="AI 正在回覆"><span></span><span></span><span></span></span>
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
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder={cooldown > 0 ? `冷卻中… (${cooldown}s)` : '輸入你的問題…'}
            disabled={isTyping || cooldown > 0}
            style={{
              flexGrow: 1, padding: '0.7rem 0.85rem', borderRadius: '10px',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', minWidth: 0
            }}
          />
          <button
            className="chat-send"
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim() || cooldown > 0}
            style={{
              padding: '0 1.1rem', borderRadius: '10px', flexShrink: 0,
              cursor: (isTyping || !input.trim() || cooldown > 0) ? 'not-allowed' : 'pointer',
              backgroundColor: (isTyping || !input.trim() || cooldown > 0) ? 'var(--bg-color)' : 'var(--accent-color)',
              color: (isTyping || !input.trim() || cooldown > 0) ? 'var(--text-muted)' : '#fff',
              border: `1px solid ${(isTyping || !input.trim() || cooldown > 0) ? 'var(--border-color)' : 'var(--accent-color)'}`,
              fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap'
            }}
          >
            送出
          </button>
        </div>
        {cooldown > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            為保護額度，發問間隔需等待 5 秒
          </div>
        )}
      </div>

      {/* Resize handle (bottom-right, desktop only) */}
      {!isMobile && (
        <div
          onMouseDown={onResizeMouseDown}
          title="拖曳以調整視窗大小"
          style={{
            position: 'absolute', right: 0, bottom: 0,
            width: '18px', height: '18px',
            cursor: 'nwse-resize', zIndex: 10,
            background: 'linear-gradient(135deg, transparent 50%, var(--border-color) 50%, var(--border-color) 60%, transparent 60%, transparent 70%, var(--border-color) 70%, var(--border-color) 80%, transparent 80%)'
          }}
        />
      )}

      {/* Fullscreen table zoom overlay */}
      {zoomContent && (
        <div
          onClick={() => setZoomContent(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10001,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)',
              padding: '1.25rem', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto',
              boxShadow: 'var(--shadow-lg)', position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>📊 表格放大檢視</strong>
              <button
                onClick={() => setZoomContent(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
                title="關閉"
              >✕</button>
            </div>
            <div
              className="zoom-table-content"
              style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: zoomContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
