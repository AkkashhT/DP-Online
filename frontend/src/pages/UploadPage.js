import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const STEPS = [
  'Uploading file to server',
  'Extracting embedded images',
  'Sending to Gemini AI',
  'Extracting text & tables',
  'Storing results',
];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadPage({ onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const validate = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setError('Unsupported file type. Please upload PDF, JPG, or PNG.');
      return false;
    }
    setError(''); setFile(f); return true;
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validate(f);
  }, []);

  const simulateSteps = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 1400));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    const stepPromise = simulateSteps();
    try {
      const res = await axios.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000
      });
      await stepPromise;
      onSuccess(res.data);
    } catch (e) {
      setProcessing(false); setStep(-1);
      setError(e.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  const emoji = (f) => {
    if (!f) return '';
    const ext = f.name.split('.').pop().toLowerCase();
    return ext === 'pdf' ? '📄' : '🖼️';
  };

  if (processing) {
    return (
      <div>
        <div className="page-header"><div><h2>Processing Document</h2><p>Analyzing with Gemini AI...</p></div></div>
        <div className="page-body">
          <div className="processing-card">
            <div className="processing-spinner" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Analyzing Document</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Processing <strong>{file?.name}</strong></p>
            <div className="processing-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`processing-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className="step-dot" />
                  <span>{s}</span>
                  {i < step && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><div><h2>Upload Document</h2><p>Upload a PDF, JPG, or PNG to extract content with Gemini AI</p></div></div>
      <div className="page-body" style={{ maxWidth: '640px' }}>
        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}
        <div
          className={`upload-area ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && inputRef.current.click()}
        >
          <div className="upload-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>Drop your document here</h3>
          <p>Drag and drop a file, or click to browse</p>
          <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
            Choose File
          </button>
          <div className="upload-formats">
            <span className="format-tag">PDF</span>
            <span className="format-tag">JPG</span>
            <span className="format-tag">PNG</span>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files[0]; if (f) validate(f); }} />

        {file && (
          <div className="file-selected">
            <div className="file-selected-icon"><span style={{ fontSize: '20px' }}>{emoji(file)}</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="file-selected-name">{file.name}</div>
              <div className="file-selected-size">{formatSize(file.size)}</div>
            </div>
            <button className="btn-icon" onClick={() => { setFile(null); setError(''); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '16px' }}
          disabled={!file}
          onClick={handleUpload}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload & Process Document
        </button>

        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-body">
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>What gets extracted?</p>
            {[
              { e: '📝', t: 'Text', d: 'All readable text, preserving structure' },
              { e: '📊', t: 'Tables', d: 'Structured tables exported as Excel' },
              { e: '🖼️', t: 'Images', d: 'Embedded images saved as PNG files' },
            ].map(item => (
              <div key={item.t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{item.e}</span>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.t}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{item.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
