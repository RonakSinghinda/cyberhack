// frontend/src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, BarChart3, Scissors, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: <Search className="text-blue-400" />, title: 'Deep Scan', desc: 'Advanced regex & NLP detection for 15+ sensitive data categories.' },
    { icon: <Scissors className="text-purple-400" />, title: 'Redaction Studio', desc: 'One-click masking with multiple styles: Black Bar, Placeholder, or Fakes.' },
    { icon: <Lock className="text-green-400" />, title: 'Privacy First', desc: 'No raw content ever touches our database. Only metadata is stored.' },
    { icon: <Zap className="text-yellow-400" />, title: 'Multi-Format', desc: 'Support for PDF, DOCX, TXT, and AI-powered OCR for images.' },
    { icon: <BarChart3 className="text-pink-400" />, title: 'Insights', desc: 'Track your sharing safety trends with a personal risk dashboard.' },
    { icon: <Shield className="text-cyan-400" />, title: 'Real-time Protection', desc: 'Complemented by our browser extension for search query safety.' },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '60px 0 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, marginBottom: 24, border: '1px solid var(--accent-glow)' }}>
          <Zap size={14} /> Intelligence-Driven Privacy
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Stop <span style={{ background: 'linear-gradient(90deg, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Oversharing</span>.<br />
          Start Protecting.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 600, margin: '0 auto 40px' }}>
          SafeSearch AI acts as a pre-share checkpoint. Scan your documents and messages for sensitive data before they leave your hands.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }} onClick={() => navigate('/')}>
            Get Started — It's Free
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 16 }}>
            Documentation
          </button>
        </div>
      </section>

      {/* Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 80 }}>
        {features.map((f, i) => (
          <div key={i} className="card" style={{ padding: 32, transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ marginBottom: 20, width: 44, height: 44, borderRadius: 12, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Social Proof / Call to Action */}
      <section className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #111f35 0%, #070d1a 100%)', border: '1px solid var(--accent-glow)', padding: '60px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Ready to secure your data?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Join thousands of privacy-conscious individuals using SafeSearch AI.</p>
        <button className="btn btn-primary" onClick={() => navigate('/register')}>Create Private Account</button>
      </section>
    </div>
  );
}
