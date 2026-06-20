// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'var(--danger)', 'var(--warn)', 'var(--accent-hover)', 'var(--accent)'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
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
          <h1 className="section-title-premium" style={{ marginBottom: 6, color: 'var(--text-primary)' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join SafeSearch AI — Start protecting your data</p>
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} style={{ opacity: 0.5 }} /> Full Name
              </label>
              <input id="reg-name" className="input" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} style={{ opacity: 0.5 }} /> Email Address
              </label>
              <input id="reg-email" className="input" type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} style={{ opacity: 0.5 }} /> Password
              </label>
              <input id="reg-password" className="input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={13} style={{ opacity: 0.5 }} /> Confirm Password
              </label>
              <input id="confirm-password" className="input" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required
                style={{ borderColor: form.confirm && form.confirm === form.password ? 'rgba(34, 197, 94, 0.5)' : undefined }} />
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

            <button id="register-btn" className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 14, marginTop: 4 }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(2, 6, 23, 0.3)', borderTopColor: '#020617', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 22, paddingTop: 20,
            borderTop: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-muted)'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
