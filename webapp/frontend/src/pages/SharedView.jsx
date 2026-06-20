// frontend/src/pages/SharedView.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Lock, Eye, Copy, Check, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

export default function SharedView() {
  const { id } = useParams();
  const [stage, setStage] = useState('loading'); // loading, password, content, expired, error
  const [password, setPassword] = useState('');
  const [text, setText] = useState('');
  const [selfDestructed, setSelfDestructed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchContent = async (pw = '') => {
    try {
      const { data } = await api.post(`/share/${id}/view`, { password: pw });
      setText(data.text);
      setSelfDestructed(data.selfDestructed);
      setStage('content');
    } catch (e) {
      const res = e.response?.data;
      if (res?.passwordRequired) {
        setStage('password');
        if (pw) setErrorMsg('Incorrect password, try again');
      } else if (e.response?.status === 410 || e.response?.status === 404) {
        setStage('expired');
      } else {
        setErrorMsg(res?.message || 'Failed to retrieve content');
        setStage('error');
      }
    }
  };

  useEffect(() => { fetchContent(); }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)', padding: 20,
    backgroundImage: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.12) 0%, transparent 60%)',
  };

  if (stage === 'loading') return (
    <div style={bgStyle}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14 }}>Verifying secure link…</p>
      </div>
    </div>
  );

  if (stage === 'expired') return (
    <div style={bgStyle}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: 'var(--danger)'
        }}><AlertTriangle size={28} /></div>
        <h1 className="section-title-premium" style={{ marginBottom: 8 }}>Link Expired or Used</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          This secure link has either expired or reached its maximum view limit and has been permanently destroyed.
        </p>
      </div>
    </div>
  );

  if (stage === 'error') return (
    <div style={bgStyle}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h1 className="section-title-premium" style={{ color: 'var(--danger)', marginBottom: 8 }}>Error</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{errorMsg}</p>
      </div>
    </div>
  );

  if (stage === 'password') return (
    <div style={bgStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--warn)'
          }}><Lock size={24} /></div>
          <h1 className="section-title-premium" style={{ marginBottom: 6 }}>Password Required</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            This secure link is password-protected. Enter the password to view its content.
          </p>
          <div className="form-group" style={{ marginBottom: 16, textAlign: 'left' }}>
            <input className="input" type="password" placeholder="Enter password"
              value={password} onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && fetchContent(password)} />
            {errorMsg && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>⚠ {errorMsg}</p>}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => fetchContent(password)} disabled={!password}>
            <Eye size={15} /> View Secure Content
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={bgStyle}>
      <div style={{ width: '100%', maxWidth: 700 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Shield size={22} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>SafeSearch AI — Secure Share</span>
        </div>

        {selfDestructed && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20
          }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 2 }}>This link has been destroyed</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>You are viewing the final access. This link no longer exists and cannot be accessed again.</p>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Shared Content</span>
            <button className="btn btn-ghost" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: 12 }}>
              {copied ? <><Check size={13} style={{ color: 'var(--accent)' }} /> Copied</> : <><Copy size={13} /> Copy All</>}
            </button>
          </div>
          <pre className="shared-content-box" style={{ border: 'none', borderRadius: 0, margin: 0 }}>{text}</pre>
        </div>
      </div>
    </div>
  );
}
