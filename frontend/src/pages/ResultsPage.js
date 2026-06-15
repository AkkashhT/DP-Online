import React, { useState, useCallback } from 'react';
import axios from 'axios';

const Icons = {
  Text: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Table: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  Image: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Download: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Save: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  X: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Upload: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
};

// ── Saved indicator ────────────────────────────────────────
function SavedBadge({ show }) {
  if (!show) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'var(--success-light)', color: 'var(--success)',
      border: '1px solid #6ee7b7',
      fontSize: '11.5px', fontWeight: '500',
      padding: '3px 9px', borderRadius: '20px',
    }}>
      <Icons.Check /> Saved
    </span>
  );
}

// ── Editable Text Section ──────────────────────────────────
function EditableText({ docId, initialText, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialText || '');
  const [saving, setSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setValue(initialText || '');
    setEditing(true);
    setSavedBadge(false);
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/edit/text/${docId}`, { text: value });
      onSaved('text', value);
      setEditing(false);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 3000);
    } catch (e) {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div>
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          color: 'var(--danger)', fontSize: '12.5px', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Icons.AlertTriangle /> {error}
        </div>
      )}

      {editing ? (
        <div>
          {/* Edit tip */}
          <div style={{
            background: 'var(--primary-light)', border: '1px solid var(--primary-mid)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
            fontSize: '12px', color: 'var(--primary)', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Icons.Edit />
            Edit the text below to correct any extraction errors, then click Save.
          </div>

          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{
              width: '100%', minHeight: '320px',
              fontFamily: 'DM Mono, monospace', fontSize: '12.5px',
              color: 'var(--text-primary)', lineHeight: '1.8',
              background: '#fffbeb',
              border: '2px solid #fbbf24',
              borderRadius: 'var(--radius-sm)', padding: '14px 16px',
              resize: 'vertical', outline: 'none',
              boxSizing: 'border-box',
            }}
            autoFocus
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              <Icons.Save />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleCancel}
              disabled={saving}
            >
              <Icons.X /> Cancel
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {value.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="text-content"
            style={{ cursor: 'text' }}
            title="Click Edit to modify"
          >
            {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No text extracted.</span>}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-outline btn-sm" onClick={handleEdit}>
              <Icons.Edit /> Edit Text
            </button>
            <SavedBadge show={savedBadge} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Editable Table Section ─────────────────────────────────
function EditableTables({ docId, initialTables, onSaved }) {
  const [tables, setTables] = useState(
    initialTables ? JSON.parse(JSON.stringify(initialTables)) : []
  );
  const [editingCell, setEditingCell] = useState(null); // {tIdx, type:'header'|'cell', row, col}
  const [editingTitle, setEditingTitle] = useState(null); // tIdx
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);
  const [error, setError] = useState('');

  const markChanged = () => setHasChanges(true);

  // ── Cell value update helpers ──
  const updateHeader = (tIdx, col, val) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].headers[col] = val;
      return next;
    });
    markChanged();
  };

  const updateCell = (tIdx, row, col, val) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].rows[row][col] = val;
      return next;
    });
    markChanged();
  };

  const updateTitle = (tIdx, val) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].title = val;
      return next;
    });
    markChanged();
  };

  // ── Row / column operations ──
  const addRow = (tIdx) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const cols = next[tIdx].headers.length || 1;
      next[tIdx].rows.push(Array(cols).fill(''));
      return next;
    });
    markChanged();
  };

  const deleteRow = (tIdx, rowIdx) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].rows.splice(rowIdx, 1);
      return next;
    });
    markChanged();
  };

  const addColumn = (tIdx) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].headers.push('New Column');
      next[tIdx].rows.forEach(r => r.push(''));
      return next;
    });
    markChanged();
  };

  const deleteColumn = (tIdx, colIdx) => {
    setTables(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[tIdx].headers.splice(colIdx, 1);
      next[tIdx].rows.forEach(r => r.splice(colIdx, 1));
      return next;
    });
    markChanged();
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/edit/tables/${docId}`, { tables });
      onSaved('tables', tables);
      setHasChanges(false);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 3000);
    } catch (e) {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setTables(JSON.parse(JSON.stringify(initialTables || [])));
    setHasChanges(false);
    setEditingCell(null);
    setEditingTitle(null);
  };

  if (!tables || tables.length === 0) {
    return (
      <div className="empty-state">
        <Icons.Table />
        <p>No tables were found in this document.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Edit tip */}
      <div style={{
        background: 'var(--primary-light)', border: '1px solid var(--primary-mid)',
        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
        fontSize: '12px', color: 'var(--primary)', marginBottom: '14px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <Icons.Edit />
        Click any cell, header, or title to edit it directly. Use + buttons to add rows/columns.
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          color: 'var(--danger)', fontSize: '12.5px', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Icons.AlertTriangle /> {error}
        </div>
      )}

      {/* Save / Discard bar — only visible when changes exist */}
      {hasChanges && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '14px',
        }}>
          <span style={{ fontSize: '12.5px', color: '#92400e', flex: 1 }}>
            You have unsaved changes.
          </span>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <Icons.Save /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleDiscard} disabled={saving}>
            <Icons.X /> Discard
          </button>
        </div>
      )}

      {!hasChanges && <SavedBadge show={savedBadge} />}

      {tables.map((table, tIdx) => (
        <div key={tIdx} style={{ marginBottom: '32px' }}>

          {/* Table title */}
          {editingTitle === tIdx ? (
            <input
              autoFocus
              value={table.title || ''}
              onChange={e => updateTitle(tIdx, e.target.value)}
              onBlur={() => setEditingTitle(null)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(null)}
              style={{
                fontWeight: '600', fontSize: '13px',
                color: 'var(--text-primary)',
                border: '2px solid var(--primary)',
                borderRadius: '4px', padding: '4px 8px',
                outline: 'none', marginBottom: '10px',
                width: '100%', fontFamily: 'DM Sans, sans-serif',
                background: '#fffbeb',
              }}
            />
          ) : (
            <div
              className="table-title"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setEditingTitle(tIdx)}
              title="Click to edit title"
            >
              Table {tIdx + 1}: {table.title || '(no title)'}
              <span style={{ opacity: 0.4 }}><Icons.Edit /></span>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {(table.headers || []).map((header, col) => (
                    <th key={col} style={{ position: 'relative' }}>
                      {/* Header cell */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {editingCell?.tIdx === tIdx && editingCell?.type === 'header' && editingCell?.col === col ? (
                          <input
                            autoFocus
                            value={header}
                            onChange={e => updateHeader(tIdx, col, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingCell(null)}
                            style={{
                              background: '#1e40af', color: 'white',
                              border: '2px solid #93c5fd',
                              borderRadius: '4px', padding: '2px 6px',
                              fontSize: '12px', fontWeight: '600',
                              outline: 'none', width: '100%',
                              fontFamily: 'DM Sans, sans-serif',
                            }}
                          />
                        ) : (
                          <span
                            style={{ flex: 1, cursor: 'pointer' }}
                            onClick={() => setEditingCell({ tIdx, type: 'header', col })}
                            title="Click to edit header"
                          >
                            {header || <em style={{ opacity: 0.6 }}>Header</em>}
                          </span>
                        )}
                        {/* Delete column button */}
                        <button
                          onClick={() => deleteColumn(tIdx, col)}
                          title="Delete column"
                          style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: 'white', cursor: 'pointer', borderRadius: '3px',
                            padding: '2px 4px', lineHeight: 1, flexShrink: 0,
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Row delete placeholder column header */}
                  <th style={{
                    background: 'var(--primary)', width: '32px',
                    padding: '8px 6px',
                  }} />
                </tr>
              </thead>
              <tbody>
                {(table.rows || []).map((row, rowIdx) => (
                  <tr key={rowIdx}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = rowIdx % 2 === 0 ? 'white' : 'var(--primary-light)'}
                  >
                    {row.map((cell, col) => (
                      <td key={col} style={{
                        padding: '0',
                        background: rowIdx % 2 !== 0 ? 'var(--primary-light)' : 'white',
                      }}>
                        {editingCell?.tIdx === tIdx && editingCell?.type === 'cell'
                          && editingCell?.row === rowIdx && editingCell?.col === col ? (
                          <input
                            autoFocus
                            value={cell}
                            onChange={e => updateCell(tIdx, rowIdx, col, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') setEditingCell(null);
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                const nextCol = col + 1;
                                if (nextCol < row.length) {
                                  setEditingCell({ tIdx, type: 'cell', row: rowIdx, col: nextCol });
                                } else if (rowIdx + 1 < table.rows.length) {
                                  setEditingCell({ tIdx, type: 'cell', row: rowIdx + 1, col: 0 });
                                }
                              }
                            }}
                            style={{
                              width: '100%', border: '2px solid var(--primary)',
                              background: '#fffbeb',
                              padding: '7px 10px', outline: 'none',
                              fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                              boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          <div
                            onClick={() => setEditingCell({ tIdx, type: 'cell', row: rowIdx, col })}
                            style={{
                              padding: '9px 14px', cursor: 'cell',
                              minHeight: '36px', minWidth: '60px',
                            }}
                            title="Click to edit"
                          >
                            {cell !== '' ? cell : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                          </div>
                        )}
                      </td>
                    ))}

                    {/* Delete row button */}
                    <td style={{ padding: '6px', textAlign: 'center', width: '32px' }}>
                      <button
                        onClick={() => deleteRow(tIdx, rowIdx)}
                        title="Delete row"
                        style={{
                          background: '#fef2f2', border: '1px solid #fecaca',
                          color: '#dc2626', cursor: 'pointer',
                          borderRadius: '4px', padding: '3px 5px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Icons.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add row / column buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => addRow(tIdx)}
            >
              <Icons.Plus /> Add Row
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => addColumn(tIdx)}
            >
              <Icons.Plus /> Add Column
            </button>
          </div>
        </div>
      ))}

      {/* Bottom save bar */}
      {hasChanges && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <Icons.Save /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleDiscard} disabled={saving}>
            <Icons.X /> Discard
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ResultsPage ───────────────────────────────────────
export default function ResultsPage({ documentData, onUploadNew }) {
  const [activeTab, setActiveTab] = useState('text');
  const [downloading, setDownloading] = useState('');
  const [liveData, setLiveData] = useState(null);

  // Use liveData (post-edit) if available, else fall back to documentData
  const data = liveData || documentData;

  const handleSaved = useCallback((type, value) => {
    setLiveData(prev => {
      const base = prev || documentData;
      if (type === 'text') {
        return {
          ...base,
          text: value,
          // recalculate word count locally
        };
      }
      if (type === 'tables') {
        return { ...base, tables: value, table_count: value.length };
      }
      return base;
    });
  }, [documentData]);

  if (!data) {
    return (
      <div>
        <div className="page-header">
          <div><h2>Results</h2><p>No document processed yet</p></div>
        </div>
        <div className="page-body">
          <div className="no-doc-banner">
            <Icons.AlertTriangle />
            <p>No document has been uploaded. Please upload a document first.</p>
          </div>
          <button className="btn btn-primary" onClick={onUploadNew}>
            <Icons.Upload /> Upload a Document
          </button>
        </div>
      </div>
    );
  }

  const { doc_id, filename, text, tables, images } = data;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const downloadText = async () => {
    setDownloading('text');
    try {
      const response = await axios.get(`/api/download/text/${doc_id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extracted_text.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed.'); }
    setDownloading('');
  };

  const downloadTables = async () => {
    setDownloading('tables');
    try {
      const response = await axios.get(`/api/download/tables/${doc_id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tables.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed.'); }
    setDownloading('');
  };

  const downloadImage = async (imgId, filename) => {
    setDownloading(`img-${imgId}`);
    try {
      const response = await axios.get(`/api/download/image/${doc_id}/${imgId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed.'); }
    setDownloading('');
  };

  const tabs = [
    { id: 'text',   label: 'Extracted Text', icon: Icons.Text,  count: `${wordCount} words` },
    { id: 'tables', label: 'Tables',          icon: Icons.Table, count: tables?.length || 0  },
    { id: 'images', label: 'Images',          icon: Icons.Image, count: images?.length || 0  },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h2>Extraction Results</h2>
          <p>Results for <strong>{filename}</strong></p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onUploadNew}>
          <Icons.Upload /> New Document
        </button>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon blue"><Icons.Text /></div>
            <div className="stat-info"><label>Words</label><span>{wordCount.toLocaleString()}</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Icons.Table /></div>
            <div className="stat-info"><label>Tables</label><span>{tables?.length || 0}</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Icons.Image /></div>
            <div className="stat-info"><label>Images</label><span>{images?.length || 0}</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '2px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontWeight: '500',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', marginBottom: '-1px',
            }}>
              <tab.icon />
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                fontSize: '11px', fontWeight: '600', padding: '1px 7px', borderRadius: '20px',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── Text Tab ── */}
        {activeTab === 'text' && (
          <div className="card">
            <div className="card-header">
              <h3><Icons.Text /> Extracted Text</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={downloadText}
                disabled={downloading === 'text'}
              >
                <Icons.Download />
                {downloading === 'text' ? 'Downloading...' : 'Download TXT'}
              </button>
            </div>
            <div className="card-body">
              <EditableText
                docId={doc_id}
                initialText={text}
                onSaved={handleSaved}
              />
            </div>
          </div>
        )}

        {/* ── Tables Tab ── */}
        {activeTab === 'tables' && (
          <div className="card">
            <div className="card-header">
              <h3><Icons.Table /> Extracted Tables</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={downloadTables}
                disabled={downloading === 'tables'}
              >
                <Icons.Download />
                {downloading === 'tables' ? 'Downloading...' : 'Download Excel'}
              </button>
            </div>
            <div className="card-body">
              <EditableTables
                docId={doc_id}
                initialTables={tables}
                onSaved={handleSaved}
              />
            </div>
          </div>
        )}

        {/* ── Images Tab ── */}
        {activeTab === 'images' && (
          <div className="card">
            <div className="card-header">
              <h3><Icons.Image /> Extracted Images</h3>
              <span className="badge badge-blue">{images?.length || 0} images</span>
            </div>
            <div className="card-body">
              {images && images.length > 0 ? (
                <div className="image-gallery">
                  {images.map((img) => (
                    <div key={img.id} className="image-card">
                      <img src={img.data} alt={img.filename} className="image-card-img" />
                      <div className="image-card-footer">
                        <div>
                          <div className="image-card-name">{img.filename}</div>
                          {img.page && <div className="image-card-page">Page {img.page}</div>}
                        </div>
                        <button
                          className="btn-icon"
                          onClick={() => downloadImage(img.id, img.filename)}
                          disabled={downloading === `img-${img.id}`}
                          title="Download image"
                        >
                          <Icons.Download />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>No images were found in this document.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
