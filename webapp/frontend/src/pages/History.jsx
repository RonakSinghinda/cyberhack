// frontend/src/pages/History.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Trash2, Download } from 'lucide-react';
import api from '../api/axios';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/scan/history').then(r => setScans(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this scan record?')) return;
    await api.delete(`/scan/${id}`);
    setScans(s => s.filter(x => x._id !== id));
  };

  const exportCSV = () => {
    const header = 'scan_id,timestamp,file_type,char_count,risk_score,categories,action';
    const rows = scans.map(s => `${s.scan_id},${s.createdAt},${s.file_type},${s.char_count},${s.risk_score},"${(s.categories_found||[]).join('|')}",${s.action_taken}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scan_log.csv'; a.click();
  };

  const catMap = {};
  scans.forEach(s => (s.categories_found || []).forEach(c => { catMap[c] = (catMap[c] || 0) + 1; }));
  const catData = Object.entries(catMap).map(([name, count]) => ({ name, count }));
  const trendData = [...scans].reverse().slice(-10).map((s, i) => ({ scan: i + 1, score: s.risk_score }));
  const riskColor = s => s >= 60 ? 'var(--danger)' : s >= 30 ? 'var(--warn)' : 'var(--success)';

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Sensitivity History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All scan metadata from your account — no raw content stored.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportCSV} disabled={!scans.length}><Download size={13} /> Export CSV</button>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No scans yet. Run your first scan to see history here.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { val: scans.length, lbl: 'Total Scans' },
              { val: Math.round(scans.reduce((a, s) => a + s.risk_score, 0) / scans.length), lbl: 'Avg Risk Score' },
              { val: scans.filter(s => s.risk_score >= 60).length, lbl: 'High Risk Scans' },
            ].map(s => (
              <div key={s.lbl} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <p className="section-title">Category Breakdown</p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={catData} margin={{ left: -24 }}>
                  <XAxis dataKey="name" tick={{ fill: '#4a6380', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#4a6380', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111f35', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="section-title">Risk Score Trend</p>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={trendData} margin={{ left: -24 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="scan" tick={{ fill: '#4a6380', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#4a6380', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111f35', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <p className="section-title">Scan Timeline</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scans.map(s => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 22, color: riskColor(s.risk_score), minWidth: 42 }}>{s.risk_score}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.scan_id} · {s.file_type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString()} · {s.char_count} chars · {s.findings_count} findings</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(s.categories_found || []).map(c => <span key={c} className={`badge badge-${c}`}>{c}</span>)}
                  </div>
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleDelete(s._id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
