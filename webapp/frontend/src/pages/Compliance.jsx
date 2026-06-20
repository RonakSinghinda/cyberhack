// frontend/src/pages/Compliance.jsx
import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import api from '../api/axios';

const FRAMEWORKS = [
  { id: 'gdpr', label: 'GDPR', fullName: 'General Data Protection Regulation', region: 'EU', color: 'var(--accent-hover)' },
  { id: 'pci',  label: 'PCI-DSS', fullName: 'Payment Card Industry Data Security Standard', region: 'Global', color: 'var(--purple)' },
  { id: 'hipaa',label: 'HIPAA', fullName: 'Health Insurance Portability and Accountability Act', region: 'USA', color: 'var(--accent)' },
];

const GradeIcon = ({ score }) => {
  if (score >= 80) return <CheckCircle size={18} style={{ color: 'var(--accent)' }} />;
  if (score >= 50) return <AlertTriangle size={18} style={{ color: 'var(--warn)' }} />;
  return <XCircle size={18} style={{ color: 'var(--danger)' }} />;
};

export default function Compliance() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const handleAudit = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/compliance/audit', { text });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Compliance audit failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const gradeFromScore = (s) => s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : s >= 40 ? 'D' : 'F';
  const gradeColor = (s) => s >= 75 ? 'var(--accent)' : s >= 50 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h1 className="section-title-premium" style={{ marginBottom: 2 }}>Compliance Shield</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Audit content against global data privacy regulations</p>
          </div>
        </div>

        {/* Framework badges */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {FRAMEWORKS.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: `rgba(34,197,94,0.06)`, border: `1px solid rgba(34,197,94,0.15)`,
              fontSize: 12, fontWeight: 600, color: 'var(--text-primary)'
            }}>
              <span style={{ color: f.color }}>{f.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{f.region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">Paste Content to Audit</p>
        <textarea className="input" style={{ minHeight: 160, resize: 'vertical', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}
          placeholder="Paste the text, email, or document content you want to audit for compliance violations..."
          value={text} onChange={e => setText(e.target.value)} />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}
        <button className="btn btn-primary" onClick={handleAudit} disabled={loading || !text.trim()}>
          {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Auditing…</> : <><Zap size={15} /> Run Compliance Audit</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overall Score */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>OVERALL COMPLIANCE SCORE</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, color: gradeColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</span>
                  <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{result.findingsCount} sensitive items detected across frameworks</p>
              </div>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `conic-gradient(${gradeColor(result.overallScore)} ${result.overallScore * 3.6}deg, rgba(255,255,255,0.04) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'var(--bg-sidebar)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 22, color: gradeColor(result.overallScore)
                }}>
                  {gradeFromScore(result.overallScore)}
                </div>
              </div>
            </div>
          </div>

          {/* Per-Framework Cards */}
          {FRAMEWORKS.map(fw => {
            const data = result.frameworks[fw.id];
            const isExpanded = expanded[fw.id];
            return (
              <div key={fw.id} className="card" style={{ border: `1px solid ${data.passed ? 'var(--border)' : `${fw.color}35`}` }}>
                {/* Framework Header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                  onClick={() => toggleExpand(fw.id)}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 11, color: 'var(--accent)', letterSpacing: '0.5px'
                  }}>{fw.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{fw.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {data.violations.length === 0 ? 'No violations detected' : `${data.violations.length} violation${data.violations.length > 1 ? 's' : ''} found`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: gradeColor(data.score) }}>{data.score}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>score</div>
                    </div>
                    <GradeIcon score={data.score} />
                    {data.violations.length > 0 && (
                      isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>

                {/* Violations accordion */}
                {isExpanded && data.violations.length > 0 && (
                  <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.violations.map((v, i) => (
                      <div key={i} className="card" style={{
                        padding: '14px 16px',
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        borderLeft: '3px solid var(--danger)'
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                          <span className={`badge badge-${v.severity}`}>{v.severity}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{v.clause}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>{v.desc}</p>
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '8px 12px', borderRadius: 8,
                          background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)'
                        }}>
                          <CheckCircle size={13} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><b style={{ color: 'var(--accent)' }}>Fix: </b>{v.fix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Passed state */}
                {data.passed && (
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
                    <CheckCircle size={16} /> This content passes {fw.label} requirements
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
