// frontend/src/pages/SecureShare.jsx
import { useState } from 'react';
import { Share2, Link2, Copy, Check, Lock, Clock, Eye, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const EXPIRY_OPTIONS = [
  { label: '5 minutes',  value: 5 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: '6 hours',    value: 360 },
  { label: '24 hours',   value: 1440 },
];

const VIEW_OPTIONS = [
  { label: 'Unlimited',  value: 0 },
  { label: '1 view (self-destruct)', value: 1 },
  { label: '3 views',   value: 3 },
  { label: '10 views',  value: 10 },
];

export default function SecureShare() {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState(60);
  const [maxViews, setMaxViews] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setShareUrl('');
    try {
      const { data } = await api.post('/share', {
        text,
        password: password.trim() || undefined,
        expirationMinutes: expiry,
        maxViews
      });
      const base = window.location.origin;
      setShareUrl(`${base}/shared/${data.shareId}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create secure link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reset = () => { setText(''); setPassword(''); setShareUrl(''); setError(''); };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <Share2 size={20} />
        </div>
        <div>
          <h1 className="section-title-premium" style={{ marginBottom: 2 }}>Secure Share</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Generate encrypted, self-destructing links for sensitive content</p>
        </div>
      </div>

      {!shareUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Content Input */}
          <div className="card">
            <p className="section-title"><Share2 size={13} /> Sensitive Content</p>
            <textarea className="input" style={{ minHeight: 160, resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.6 }}
              placeholder="Paste the sensitive content you'd like to share securely..."
              value={text} onChange={e => setText(e.target.value)} />
            <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              ⚠ Only share text that the recipient absolutely needs access to. For truly sensitive material, run through Redaction Studio first.
            </p>
          </div>

          {/* Configuration */}
          <div className="card">
            <p className="section-title">Link Configuration</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Expiry */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} style={{ opacity: 0.5 }} /> Expiration Time
                </label>
                <select className="input" value={expiry} onChange={e => setExpiry(Number(e.target.value))}
                  style={{ cursor: 'pointer' }}>
                  {EXPIRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* View Limit */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} style={{ opacity: 0.5 }} /> View Limit
                </label>
                <select className="input" value={maxViews} onChange={e => setMaxViews(Number(e.target.value))}
                  style={{ cursor: 'pointer' }}>
                  {VIEW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Password */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} style={{ opacity: 0.5 }} /> Password Protection <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input className="input" type="password" placeholder="Leave empty for no password"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                <Clock size={11} /> Expires in {EXPIRY_OPTIONS.find(o => o.value === expiry)?.label}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--accent-hover)', fontWeight: 600 }}>
                <Eye size={11} /> {maxViews === 0 ? 'Unlimited views' : maxViews === 1 ? 'Self-destructs on open' : `${maxViews} views max`}
              </span>
              {password && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                  <Lock size={11} /> Password protected
                </span>
              )}
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ {error}</p>}

          <button className="btn btn-primary" onClick={handleCreate} disabled={loading || !text.trim()} style={{ width: 'fit-content', padding: '12px 28px' }}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Generating link…</> : <><Link2 size={16} /> Generate Secure Link</>}
          </button>
        </div>
      ) : (
        /* Success State */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderColor: 'rgba(34,197,94,0.2)', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'var(--accent)'
            }}>
              <Link2 size={28} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Secure Link Created!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Share this link with the recipient. It will expire or self-destruct based on your settings.
            </p>

            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20
            }}>
              <span style={{ flex: 1, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shareUrl}
              </span>
              <button className="btn btn-ghost" onClick={handleCopy} style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }}>
                {copied ? <><Check size={13} style={{ color: 'var(--accent)' }} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                <Clock size={11} /> Expires: {EXPIRY_OPTIONS.find(o => o.value === expiry)?.label}
              </span>
              {maxViews > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>
                  <AlertTriangle size={11} /> {maxViews === 1 ? 'Destroys after 1 view' : `${maxViews} views max`}
                </span>
              )}
            </div>

            <button className="btn btn-ghost" onClick={reset} style={{ margin: '0 auto' }}>
              Create Another Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
