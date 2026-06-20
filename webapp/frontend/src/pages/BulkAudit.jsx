// frontend/src/pages/BulkAudit.jsx
import { useState, useRef } from 'react';
import { FileStack, Upload, X, CheckCircle, XCircle, AlertTriangle, BarChart2, Download } from 'lucide-react';
import api from '../api/axios';

const riskColor = s => s >= 60 ? 'var(--danger)' : s >= 30 ? 'var(--warn)' : 'var(--accent)';
const riskLabel = s => s >= 60 ? 'High' : s >= 30 ? 'Medium' : 'Low';

export default function BulkAudit() {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const addFiles = (newFiles) => {
    const filtered = [...newFiles].filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf','docx','txt','png','jpg','jpeg'].includes(ext);
    });
    setFiles(prev => [...prev, ...filtered].slice(0, 20));
  };

  const removeFile = (idx) => setFiles(f => f.filter((_, i) => i !== idx));

  const handleScan = async () => {
    if (!files.length) return;
    setLoading(true); setError(''); setResults(null);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    try {
      const { data } = await api.post('/scan/batch', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(data.results);
    } catch (e) {
      setError(e.response?.data?.message || 'Bulk scan failed');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const header = 'file,risk_score,risk_level,findings,categories';
    const rows = results.map(r => r.success
      ? `"${r.fileName}",${r.riskScore},${riskLabel(r.riskScore)},${r.findings.length},"${[...new Set(r.findings.map(f => f.category))].join('|')}"`
      : `"${r.fileName}",ERROR,—,—,"${r.message}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'bulk_audit.csv'; a.click();
  };

  // Summary stats
  const successResults = results?.filter(r => r.success) || [];
  const avgRisk = successResults.length > 0
    ? Math.round(successResults.reduce((a, r) => a + r.riskScore, 0) / successResults.length) : 0;
  const highCount = successResults.filter(r => r.riskScore >= 60).length;
  const totalFindings = successResults.reduce((a, r) => a + r.findings.length, 0);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <FileStack size={20} />
        </div>
        <div>
          <h1 className="section-title-premium" style={{ marginBottom: 2 }}>Bulk Audit</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Scan multiple documents simultaneously — get an aggregated risk report</p>
        </div>
      </div>

      {!results ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', padding: '52px 32px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(34,197,94,0.08)' : 'rgba(11,18,32,0.4)',
              transition: 'all 0.25s'
            }}
          >
            <Upload size={36} style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Drop files here or click to select
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              PDF, DOCX, TXT, PNG, JPG — up to 20 files, 10 MB each
            </p>
            <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)} />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="section-title" style={{ marginBottom: 0 }}>Queued Files ({files.length})</p>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => setFiles([])}>Clear All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontSize: 20 }}>
                      {f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.docx') ? '📝' : ['png','jpg','jpeg'].some(e => f.name.endsWith(e)) ? '🖼️' : '📃'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ {error}</p>}

          <button className="btn btn-primary" onClick={handleScan} disabled={loading || files.length === 0}
            style={{ width: 'fit-content', padding: '12px 28px' }}>
            {loading
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Scanning {files.length} files…</>
              : <><BarChart2 size={16} /> Run Bulk Audit</>
            }
          </button>
        </div>
      ) : (
        /* Results View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { val: results.length,  lbl: 'Files Scanned', color: 'var(--accent)' },
              { val: avgRisk,         lbl: 'Avg Risk Score', color: riskColor(avgRisk) },
              { val: highCount,       lbl: 'High Risk Files', color: 'var(--danger)' },
              { val: totalFindings,   lbl: 'Total Findings',  color: 'var(--purple)' },
            ].map(m => (
              <div key={m.lbl} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
                <div className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>{m.lbl}</div>
              </div>
            ))}
          </div>

          {/* Per-file results */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p className="section-title" style={{ marginBottom: 0 }}>File-by-File Results</p>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={exportCSV}>
                <Download size={13} /> Export CSV
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 12, border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  {r.success ? (
                    <>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `${riskColor(r.riskScore) === 'var(--accent)' ? 'rgba(34, 197, 94, 0.1)' : riskColor(r.riskScore) === 'var(--warn)' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                        border: `1px solid ${riskColor(r.riskScore) === 'var(--accent)' ? 'rgba(34, 197, 94, 0.2)' : riskColor(r.riskScore) === 'var(--warn)' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 14, color: riskColor(r.riskScore)
                      }}>{r.riskScore}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fileName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.findings.length} findings</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <span className={`badge badge-${riskLabel(r.riskScore)}`}>{riskLabel(r.riskScore)} Risk</span>
                        {[...new Set(r.findings.map(f => f.category))].slice(0, 2).map(c => (
                          <span key={c} className={`badge badge-${c}`}>{c}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{r.fileName}</div>
                        <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>{r.message}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-ghost" onClick={() => { setResults(null); setFiles([]); }} style={{ width: 'fit-content' }}>
            ← Scan More Files
          </button>
        </div>
      )}
    </div>
  );
}
