import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SUGGESTIONS = [
  'Summarize this document',
  'What is the main topic?',
  'List all important details',
  'What are the key findings?',
  'Who is mentioned in this document?',
  'What is the total amount?',
];

export default function ChatPage({ documentData, onUploadNew }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  const taRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const adjustTA = () => {
    const ta = taRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
  };

  const send = async (q) => {
    const question = (q || input).trim();
    if (!question || loading || !documentData) return;
    setMessages(p => [...p, { role: 'user', content: question, id: Date.now() }]);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setLoading(true);
    try {
      const res = await axios.post(`/api/chat/${documentData.doc_id}`, { question });
      setMessages(p => [...p, { role: 'assistant', content: res.data.answer, id: Date.now() + 1 }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: e.response?.data?.error || 'Error. Please try again.', id: Date.now() + 1, isError: true }]);
    }
    setLoading(false);
  };

  if (!documentData) {
    return (
      <div>
        <div className="page-header"><div><h2>Search & Chat</h2><p>Ask questions about your document</p></div></div>
        <div className="page-body">
          <div className="no-doc-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p>No document uploaded. Please upload a document first.</p>
          </div>
          <button className="btn btn-primary" onClick={onUploadNew}>Upload a Document</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="page-header">
        <div style={{ flex: 1 }}><h2>Search & Chat</h2><p>Asking about <strong>{documentData.filename}</strong></p></div>
        {messages.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={() => setMessages([])}>Clear Chat</button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Ask Anything About Your Document</h3>
            <p>I have full access to the content from <strong>{documentData.filename}</strong>.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px', maxWidth: '480px' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="chat-suggestion-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'user' ? 'U' : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                </div>
                <div className="message-bubble" style={msg.isError ? { borderColor: '#fecaca', color: 'var(--danger)' } : {}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="message-avatar assistant">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div className="message-bubble assistant">
                  <div className="typing-indicator">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {messages.length > 0 && !loading && (
        <div style={{ padding: '8px 28px 0', display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button key={s} className="chat-suggestion-btn" style={{ whiteSpace: 'nowrap' }} onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={taRef}
            className="chat-input"
            placeholder="Ask a question about your document..."
            value={input}
            onChange={e => { setInput(e.target.value); adjustTA(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            disabled={loading}
          />
          <button className="chat-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Enter to send · Shift+Enter for new line · Answers based only on document content
        </p>
      </div>
    </div>
  );
}
