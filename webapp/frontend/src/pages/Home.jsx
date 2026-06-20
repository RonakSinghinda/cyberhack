// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileScan, Scissors, Shield, Share2, FileStack,
  TrendingUp, AlertTriangle, CheckCircle, Activity,
  ArrowRight, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TOOLS = [
  {
    icon: FileScan, label: 'Content Scanner', path: '/scan',
    desc: 'Detect PII, credentials & financial data across text, PDF, DOCX & images.'
  },
  {
    icon: Scissors, label: 'Redaction Studio', path: '/redact',
    desc: '3-step editor — mask findings with Black Bar, Placeholder or Generic styles.'
  },
  {
    icon: Shield, label: 'Compliance Shield', path: '/compliance',
    desc: 'Audit content against GDPR, PCI-DSS, and HIPAA regulations instantly.'
  },
  {
    icon: Share2, label: 'Secure Share', path: '/share',
    desc: 'Generate encrypted, self-destructing sharing links with password protection.'
  },
  {
    icon: FileStack, label: 'Bulk Audit', path: '/bulk',
    desc: 'Scan dozens of documents simultaneously — get an aggregated risk report.'
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/scan/history')
      .then(r => setScans(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalScans = scans.length;
  const avgRisk = totalScans > 0 ? Math.round(scans.reduce((a, s) => a + s.risk_score, 0) / totalScans) : 0;
  const highRisk = scans.filter(s => s.risk_score >= 60).length;
  const cleanScans = scans.filter(s => s.risk_score === 0).length;

  const riskColor = s => s >= 60 ? 'var(--danger)' : s >= 30 ? 'var(--warn)' : 'var(--accent)';
  const recentScans = scans.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      {/* Optional World Map Grid Background Effect behind Hero */}
      <div style={{
        position: 'absolute', top: -32, right: -36, width: '450px', height: '300px',
        opacity: '0.04', pointerEvents: 'none', mixBlendMode: 'screen',
        backgroundImage: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)`
      }} />

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px'
          }}>
            <Activity size={11} /> DLP Control Center
          </div>
        </div>
        <h1 className="dashboard-title" style={{ marginBottom: 8 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Here's your data privacy overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="metrics-grid" style={{ marginBottom: 36 }}>
        {[
          { label: 'Total Scans', value: loading ? '—' : totalScans, icon: <FileScan size={18} />, color: 'var(--accent)' },
          { label: 'Avg. Risk Score', value: loading ? '—' : `${avgRisk}`, icon: <TrendingUp size={18} />, color: riskColor(avgRisk) },
          { label: 'High Risk Scans', value: loading ? '—' : highRisk, icon: <AlertTriangle size={18} />, color: 'var(--danger)' },
          { label: 'Clean Scans', value: loading ? '—' : cleanScans, icon: <CheckCircle size={18} />, color: 'var(--accent)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</span>
              <div style={{ color: m.color, opacity: 0.8 }}>{m.icon}</div>
            </div>
            <div className="kpi-number" style={{ color: m.color }}>
              {loading ? <div style={{ width: 40, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} /> : m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{ marginBottom: 14 }}>
        <p className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>DLP TOOLS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.path} onClick={() => navigate(t.path)} className="card" style={{
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 14, width: '100%'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)'
                  }}>
                    <Icon size={19} />
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', marginTop: 4 }} />
                </div>
                <div>
                  <div className="card-title-premium" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {!loading && recentScans.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '1.5px' }}>RECENT ACTIVITY</p>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => navigate('/history')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {recentScans.map((s, i) => (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px',
                borderBottom: i < recentScans.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${riskColor(s.risk_score) === 'var(--accent)' ? 'rgba(34, 197, 94, 0.1)' : riskColor(s.risk_score) === 'var(--warn)' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                  border: `1px solid ${riskColor(s.risk_score) === 'var(--accent)' ? 'rgba(34, 197, 94, 0.2)' : riskColor(s.risk_score) === 'var(--warn)' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, color: riskColor(s.risk_score), flexShrink: 0
                }}>{s.risk_score}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {s.scan_id} · <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{s.file_type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(s.createdAt).toLocaleString()} · {s.findings_count} findings
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(s.categories_found || []).slice(0, 2).map(c => (
                    <span key={c} className={`badge badge-${c}`}>{c}</span>
                  ))}
                  {(s.categories_found || []).length > 2 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{s.categories_found.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && totalScans === 0 && (
        <div className="card" style={{ marginTop: 40, textAlign: 'center', padding: '60px 40px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--accent)'
          }}>
            <Zap size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>Ready to scan your first document?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Run a quick scan and the results will appear here instantly.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/scan')} style={{ padding: '12px 28px' }}>
            <FileScan size={16} /> Start Scanning
          </button>
        </div>
      )}
    </div>
  );
}
