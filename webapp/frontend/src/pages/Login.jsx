// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '20px',
      backgroundImage: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.12) 0%, transparent 60%)',
    }}>
      {/* Decorative grid lines */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--accent-gradient)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: 'var(--shadow-button)'
          }}>
            <Shield size={26} color="#020617" />
          </div>
          <h1 className="section-title-premium" style={{ marginBottom: 6, color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your DLP control center</p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} style={{ opacity: 0.5 }} /> Email Address
              </label>
              <input id="login-email" className="input" type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} style={{ opacity: 0.5 }} /> Password
              </label>
              <input id="login-password" className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '10px 14px',
                color: '#ef4444', fontSize: 13
              }}>
                ⚠ {error}
              </div>
            )}

            <button id="login-btn" className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 14, marginTop: 4 }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(2, 6, 23, 0.3)', borderTopColor: '#020617', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Authenticating…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 0',
            paddingTop: 20, borderTop: '1px solid var(--border)'
          }}>
            <Zap size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
