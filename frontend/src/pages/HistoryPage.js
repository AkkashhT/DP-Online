import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getEmoji(ext) {
  return ext === 'pdf' ? '📄' : '🖼️';
}

export default function HistoryPage({ onLoadDocument, onUploadNew }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(null);
  const [error, setError] = useState('');

  const fetchDocs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data.documents || []);
    } catch (e) {
      setError('Failed to load document history.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleLoad = async (doc) => {
    setLoadingDoc(doc.id);
    try {
      const res = await axios.get(`/api/documents/${doc.id}`);
      onLoadDocument({
        doc_id: res.data.doc_id, filename: res.data.filename,
        text: res.data.text, tables: res.data.tables,
        images: res.data.images, image_count: res.data.image_count,
        table_count: res.data.table_count,
      });
    } catch (e) {
      alert('Failed to load document.');
    }
    setLoadingDoc(null);
  };

  const handleDelete = async (docId, filename) => {
    if (!window.confirm(`Delete "${filename}" and all its data?`)) return;
    setDeleting(docId);
    try {
      await axios.delete(`/api/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      alert('Failed to delete document.');
    }
    setDeleting(null);
  };

  const filtered = documents.filter(d => d.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div style={{ flex: 1 }}><h2>Document History</h2><p>All previously processed documents</p></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={fetchDocs}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={onUploadNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            New Upload
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ flex: 'none', minWidth: 'unset', padding: '10px 16px' }}>
            <div className="stat-icon blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </div>
            <div className="stat-info"><label>Total Docs</label><span style={{ fontSize: '16px' }}>{documents.length}</span></div>
          </div>
          <div style={{
            flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" placeholder="Search by filename..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', width: '100%', fontFamily: 'DM Sans, sans-serif' }}
            />
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="processing-spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {search ? 'No documents match your search' : 'No documents yet'}
              </p>
              {!search && (
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onUploadNew}>
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    {['Document', 'Uploaded', 'Size', 'Words', 'Tables', 'Images', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '600', fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, idx) => (
                    <tr key={doc.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                            {getEmoji(doc.file_ext)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{doc.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(doc.uploaded_at)}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatSize(doc.file_size)}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ color: 'var(--primary)', fontWeight: '500' }}>{(doc.word_count || 0).toLocaleString()}</span></td>
                      <td style={{ padding: '12px 16px' }}><span className="badge badge-green">{doc.table_count || 0}</span></td>
                      <td style={{ padding: '12px 16px' }}><span className="badge badge-yellow">{doc.image_count || 0}</span></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleLoad(doc)} disabled={loadingDoc === doc.id}>
                            {loadingDoc === doc.id ? '...' : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                Load
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onClick={() => handleDelete(doc.id, doc.filename)}
                            disabled={deleting === doc.id}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            {deleting === doc.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Showing {filtered.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
