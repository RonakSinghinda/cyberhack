// frontend/src/pages/Redact.jsx
import { useState } from 'react';
import { Scissors, Download, Copy, Check, RotateCcw } from 'lucide-react';
import api from '../api/axios';

const STYLES = [
  { id: 'blackbar',    label: '█ Black Bar',        desc: 'Solid redaction block', color: 'var(--danger)' },
  { id: 'placeholder', label: '[TAG] Placeholder',  desc: 'e.g. [PHONE_NUMBER]', color: 'var(--accent-hover)' },
  { id: 'generic',     label: '≈ Generic Substitute', desc: 'e.g. +91-XXXXX-XXXXX', color: 'var(--accent)' },
];

const StepBar = ({ step }) => {
  const steps = ['1. Detect', '2. Select & Style', '3. Preview'];
  return (
    <div className="stepper" style={{ marginBottom: 28 }}>
      {steps.map((s, i) => {
        const active = i <= step;
        return (
          <div key={s} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <div className={`step-item ${active ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="step-number">{i + 1}</div>
              <span style={{ display: window.innerWidth < 600 ? 'none' : undefined }}>{s.slice(3)}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${active && i < step ? 'active' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
};

export default function Redact() {
  const [inputText, setInputText] = useState('');
  const [findings, setFindings] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [style, setStyle] = useState('placeholder');
  const [redacted, setRedacted] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScan = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/scan/text', { text: inputText });
      setFindings(data.findings);
      setSelected(new Set(data.findings.map((_, i) => i)));
      setStep(1);
    } catch (e) { setError(e.response?.data?.message || 'Scan failed'); }
    finally { setLoading(false); }
  };

  const handlePreview = async () => {
    setLoading(true); setError('');
    const chosen = findings.filter((_, i) => selected.has(i));
    try {
      const { data } = await api.post('/redact', { text: inputText, findings: chosen, style });
      setRedacted(data.redacted);
      setStep(2);
    } catch (e) { setError(e.response?.data?.message || 'Redaction failed'); }
    finally { setLoading(false); }
  };

  const download = () => {
    const blob = new Blob([redacted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'redacted.txt'; a.click();
  };

  const copyRedacted = () => {
    navigator.clipboard.writeText(redacted);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setInputText(''); setFindings([]); setRedacted(''); setStep(0); setError(''); };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <Scissors size={20} />
        </div>
        <div>
          <h1 className="section-title-premium" style={{ marginBottom: 2 }}>Redaction Studio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>3-step editor — detect, choose what to mask, download a clean copy</p>
        </div>
      </div>

      <StepBar step={step} />

      {/* Step 0: Input */}
      {step === 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="section-title">Paste Your Content</p>
          <textarea className="input" style={{ minHeight: 220, fontFamily: 'inherit', fontSize: 13, resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Paste the document, email, or message you want to redact..."
            value={inputText} onChange={e => setInputText(e.target.value)} />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ {error}</p>}
          <button className="btn btn-primary" onClick={handleScan} disabled={loading || !inputText.trim()} style={{ width: 'fit-content', padding: '12px 28px' }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Detecting…</> : 'Detect Sensitive Data →'}
          </button>
        </div>
      )}

      {/* Step 1: Select & Style */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Style selector */}
          <div className="card">
            <p className="section-title">Redaction Style</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {STYLES.map(s => (
                <div key={s.id} onClick={() => setStyle(s.id)} style={{
                  padding: '16px', borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                  border: `2px solid ${style === s.id ? s.color : 'rgba(255,255,255,0.06)'}`,
                  background: style === s.id ? `${s.color}0d` : 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: style === s.id ? s.color : 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings selector */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p className="section-title" style={{ marginBottom: 0 }}>Select Items to Redact ({selected.size}/{findings.length})</p>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => setSelected(selected.size === findings.length ? new Set() : new Set(findings.map((_, i) => i)))}>
                {selected.size === findings.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {findings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                ✅ No sensitive findings — this content looks clean!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {findings.map((f, i) => (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    background: selected.has(i) ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${selected.has(i) ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all .15s'
                  }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                      checked={selected.has(i)}
                      onChange={() => { const ns = new Set(selected); ns.has(i) ? ns.delete(i) : ns.add(i); setSelected(ns); }} />
                    <span className={`badge badge-${f.category}`}>{f.category}</span>
                    <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.match}</span>
                    <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ {error}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" onClick={handlePreview}
              disabled={selected.size === 0 || loading} style={{ padding: '11px 24px' }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing…</> : 'Preview Redacted Version →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <p className="section-title">Original</p>
              <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', lineHeight: 1.6 }}>{inputText}</pre>
            </div>
            <div className="card" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p className="section-title" style={{ marginBottom: 0 }}>Redacted Version</p>
                <button className="btn btn-ghost" onClick={copyRedacted} style={{ fontSize: 11, padding: '5px 10px' }}>
                  {copied ? <><Check size={12} style={{ color: 'var(--accent)' }} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <pre style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', lineHeight: 1.6 }}>{redacted}</pre>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={download} style={{ padding: '11px 24px' }}>
              <Download size={15} /> Download Redacted (.txt)
            </button>
            <button className="btn btn-ghost" onClick={reset} style={{ marginLeft: 'auto' }}>
              <RotateCcw size={14} /> Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
