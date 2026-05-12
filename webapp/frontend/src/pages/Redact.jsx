// frontend/src/pages/Redact.jsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api/axios';

const STYLES = [
  { id: 'blackbar',    label: '█ Black Bar',         desc: 'Solid block' },
  { id: 'placeholder', label: '[TAG] Placeholder',   desc: 'e.g. [PHONE_NUMBER]' },
  { id: 'generic',     label: '≈ Generic Substitute', desc: 'e.g. +91-XXXXX-XXXXX' },
];

export default function Redact() {
  const [inputText, setInputText] = useState('');
  const [findings, setFindings] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [style, setStyle] = useState('placeholder');
  const [redacted, setRedacted] = useState('');
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/scan/text', { text: inputText });
      setFindings(data.findings);
      setSelected(new Set(data.findings.map((_, i) => i)));
      setStep('select');
    } catch (e) { setError(e.response?.data?.message || 'Scan failed'); }
    finally { setLoading(false); }
  };

  const handlePreview = async () => {
    setLoading(true); setError('');
    const chosen = findings.filter((_, i) => selected.has(i));
    try {
      const { data } = await api.post('/redact', { text: inputText, findings: chosen, style });
      setRedacted(data.redacted);
      setStep('preview');
    } catch (e) { setError(e.response?.data?.message || 'Redaction failed'); }
    finally { setLoading(false); }
  };

  const download = () => {
    const blob = new Blob([redacted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'redacted.txt'; a.click();
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Redaction Studio</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Paste content, select what to redact, pick a style, and download a clean copy.</p>
      </div>

      {step === 'input' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="section-title">Paste your content</p>
          <textarea className="input" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
            placeholder="Paste the document, email, or message you want to redact..."
            value={inputText} onChange={e => setInputText(e.target.value)} />
          {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>⚠ {error}</p>}
          <button className="btn btn-primary" onClick={handleScan} disabled={loading || !inputText.trim()}>
            {loading ? 'Detecting…' : 'Detect Sensitive Data'}
          </button>
        </div>
      )}

      {step === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <p className="section-title">Choose Redaction Style</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {STYLES.map(s => (
                <div key={s.id} onClick={() => setStyle(s.id)} style={{
                  padding: 14, borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
                  border: `2px solid ${style === s.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: style === s.id ? 'rgba(59,130,246,.1)' : 'var(--bg-surface)'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p className="section-title" style={{ marginBottom: 0 }}>Select items ({selected.size}/{findings.length})</p>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }}
                onClick={() => setSelected(selected.size === findings.length ? new Set() : new Set(findings.map((_, i) => i)))}>
                {selected.size === findings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {findings.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sensitive findings. Content is safe.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {findings.map((f, i) => (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: 'var(--bg-surface)', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${selected.has(i) ? 'var(--accent)' : 'var(--border)'}`, transition: 'all .15s'
                  }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                      checked={selected.has(i)}
                      onChange={() => { const ns = new Set(selected); ns.has(i) ? ns.delete(i) : ns.add(i); setSelected(ns); }} />
                    <span className={`badge badge-${f.category}`}>{f.category}</span>
                    <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.match}</span>
                    <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>⚠ {error}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep('input')}>← Back</button>
            <button className="btn btn-primary" onClick={handlePreview} disabled={selected.size === 0 || loading}>
              {loading ? 'Processing…' : 'Preview Redacted'}
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <p className="section-title">Original</p>
              <pre style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: 380, overflowY: 'auto' }}>{inputText}</pre>
            </div>
            <div className="card" style={{ borderColor: 'rgba(16,185,129,.3)' }}>
              <p className="section-title">Redacted Version</p>
              <pre style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: 380, overflowY: 'auto' }}>{redacted}</pre>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep('select')}>← Back</button>
            <button className="btn btn-primary" onClick={download}><Download size={14} /> Download Redacted</button>
          </div>
        </div>
      )}
    </div>
  );
}
