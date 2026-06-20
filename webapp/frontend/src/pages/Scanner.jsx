// frontend/src/pages/Scanner.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileScan, Upload, Zap, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import api from '../api/axios';

export default function Scanner() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const runTextScan = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const { data } = await api.post('/scan/text', { text });
      setResults(data);
      sessionStorage.setItem('lastScan', JSON.stringify({ ...data, originalText: text }));
    } catch (e) { setError(e.response?.data?.message || 'Scan failed'); }
    finally { setLoading(false); }
  };

  const runFileScan = async (f) => {
    setLoading(true); setError(''); setFile(f); setResults(null);
    const fd = new FormData(); fd.append('file', f);
    try {
      const { data } = await api.post('/scan/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(data);
      sessionStorage.setItem('lastScan', JSON.stringify(data));
    } catch (e) { setError(e.response?.data?.message || 'File scan failed'); }
    finally { setLoading(false); }
  };

  const riskLevel = !results ? 'low' : results.riskScore >= 60 ? 'high' : results.riskScore >= 30 ? 'medium' : 'low';
  const riskColor = { high: '#ef4444', medium: '#f59e0b', low: '#22C55E' }[riskLevel];
  const pct = results ? `${(results.riskScore / 100) * 360}deg` : '0deg';

  const reset = () => { setResults(null); setText(''); setFile(null); setError(''); };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <FileScan size={20} />
        </div>
        <div>
          <h1 className="section-title-premium" style={{ marginBottom: 2 }}>Content Scanner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Detect PII, credentials & sensitive data in text, PDF, DOCX and images</p>
        </div>
      </div>

      {!results && (
        <>
          {/* Upload Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) runFileScan(f); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(34,197,94,0.08)' : 'rgba(11,18,32,0.4)',
              transition: 'all 0.25s', marginBottom: 20
            }}
          >
            <Upload size={32} style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {file ? file.name : 'Drop a file here or click to upload'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>PDF, DOCX, TXT, PNG, JPG — up to 10 MB</p>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }}
               onChange={e => e.target.files[0] && runFileScan(e.target.files[0])} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span>or paste text below</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <textarea className="input" style={{ minHeight: 140, resize: 'vertical', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6 }}
              placeholder="Paste text, emails, documents, or any content you want to analyze for sensitive data..."
              value={text} onChange={e => setText(e.target.value)} />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}

          <button className="btn btn-primary" onClick={runTextScan} disabled={loading || !text.trim()} style={{ padding: '12px 28px' }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Scanning…</> : <><Zap size={16} /> Scan Text</>}
          </button>
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 44, height: 44 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Analyzing content for sensitive data…</p>
        </div>
      )}

      {!loading && results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Action bar */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={reset} style={{ fontSize: 13 }}>
              <RotateCcw size={14} /> Scan Again
            </button>
            {results.findings?.length > 0 && (
              <button className="btn btn-primary" onClick={() => navigate('/redact')} style={{ fontSize: 13 }}>
                Open in Redaction Studio <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
            {/* Findings */}
            <div>
              <p className="section-title">Findings ({results.findings?.length || 0})</p>
              {results.findings?.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', borderColor: 'rgba(34,197,94,0.3)' }}>
                  <CheckCircle size={40} style={{ color: 'var(--accent)', margin: '0 auto 14px' }} />
                  <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)', marginBottom: 6 }}>All Clear!</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No sensitive data was detected in this content.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {results.findings.map((f, i) => (
                    <div key={i} className="card" style={{
                      padding: '14px 16px',
                      borderLeft: `3px solid ${f.severity === 'High' ? 'var(--danger)' : f.severity === 'Medium' ? 'var(--warn)' : 'var(--accent)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                        <span className={`badge badge-${f.category}`}>{f.category}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</span>
                      </div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                        color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)',
                        padding: '5px 10px', borderRadius: 6, wordBreak: 'break-all'
                      }}>"{f.match}"</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risk sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <p className="section-title">Risk Score</p>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', margin: '0 auto 14px',
                  background: `conic-gradient(${riskColor} ${pct}, rgba(255,255,255,0.04) 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${riskColor}25`
                }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: 'var(--bg-base)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: riskColor }}>{results.riskScore}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <span className={`badge badge-${riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'}`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </span>
              </div>

              <div className="card">
                <p className="section-title">Breakdown</p>
                {[
                  { val: results.findings?.filter(f => f.severity === 'High').length, lbl: 'High Severity', color: 'var(--danger)' },
                  { val: results.findings?.filter(f => f.severity === 'Medium').length, lbl: 'Medium', color: 'var(--warn)' },
                  { val: [...new Set(results.findings?.map(f => f.category))].length, lbl: 'Categories', color: 'var(--accent)' },
                ].map(s => (
                  <div key={s.lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.lbl}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
