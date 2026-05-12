// frontend/src/pages/Scanner.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight } from 'lucide-react';
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
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/scan/text', { text });
      setResults(data);
      sessionStorage.setItem('lastScan', JSON.stringify({ ...data, originalText: text }));
    } catch (e) { setError(e.response?.data?.message || 'Scan failed'); }
    finally { setLoading(false); }
  };

  const runFileScan = async (f) => {
    setLoading(true); setError(''); setFile(f);
    const fd = new FormData(); fd.append('file', f);
    try {
      const { data } = await api.post('/scan/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(data);
      sessionStorage.setItem('lastScan', JSON.stringify(data));
    } catch (e) { setError(e.response?.data?.message || 'File scan failed'); }
    finally { setLoading(false); }
  };

  const riskLevel = !results ? 'low' : results.riskScore >= 60 ? 'high' : results.riskScore >= 30 ? 'medium' : 'low';
  const riskColor = { high: 'var(--danger)', medium: 'var(--warn)', low: 'var(--success)' }[riskLevel];
  const pct = results ? `${(results.riskScore / 100) * 360}deg` : '0deg';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Pre-Share Content Scanner</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Upload a file or paste text — detection runs on our server, results stored privately to your account.</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) runFileScan(f); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(59,130,246,.05)' : 'var(--bg-surface)', transition: 'all 0.25s'
        }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{file ? file.name : 'Drop a file or image here'}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Supports PDF, DOCX, TXT, PNG, JPG — up to 10 MB</p>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && runFileScan(e.target.files[0])} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span>or paste text</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <textarea className="input" style={{ minHeight: 130, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
        placeholder="Paste an email, report, API documentation, or any content you plan to share..."
        value={text} onChange={e => setText(e.target.value)} />

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={runTextScan} disabled={loading || !text.trim()}>
          <Zap size={15} /> {loading ? 'Scanning…' : 'Scan Text'}
        </button>
        {results && (
          <button className="btn btn-ghost" onClick={() => navigate('/redact')}>
            Open in Redaction Studio <ArrowRight size={13} />
          </button>
        )}
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>⚠ {error}</p>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Analyzing on server…</p>
        </div>
      )}

      {!loading && results && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginTop: 28 }}>
          {/* Findings */}
          <div>
            <p className="section-title">Findings ({results.findings.length})</p>
            {results.findings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--success)' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600 }}>No sensitive data found!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.findings.map((f, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface)', border: `1px solid var(--border)`,
                    borderLeft: `3px solid ${f.severity === 'High' ? 'var(--danger)' : f.severity === 'Medium' ? 'var(--warn)' : 'var(--success)'}`,
                    borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12
                  }}>
                    <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <span className={`badge badge-${f.category}`} style={{ marginRight: 8 }}>{f.category}</span>
                        {f.label}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                        "{f.match}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="section-title">Risk Score</p>
              <div style={{
                width: 110, height: 110, borderRadius: '50%', margin: '0 auto 12px',
                background: `conic-gradient(${riskColor} ${pct}, var(--bg-hover) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: riskColor }}>{results.riskScore}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <span className={`badge badge-${riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'}`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </span>
            </div>
            <div className="card">
              <p className="section-title">Breakdown</p>
              {[{ val: results.findings.filter(f => f.severity === 'High').length, lbl: 'High Severity', color: 'var(--danger)' },
                { val: results.findings.filter(f => f.severity === 'Medium').length, lbl: 'Medium', color: 'var(--warn)' },
                { val: [...new Set(results.findings.map(f => f.category))].length, lbl: 'Categories', color: 'var(--accent)' }
              ].map(s => (
                <div key={s.lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.lbl}</span>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
