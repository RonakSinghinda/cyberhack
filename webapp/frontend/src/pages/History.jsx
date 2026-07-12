// frontend/src/pages/History.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Trash2, Download, Clock } from 'lucide-react';
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
    const blob = new Blob([[header, ...rows].join('\n'), { type: 'text/csv' }]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'scan_log.csv'; a.click();
  };

  const catMap = {};
  scans.forEach(s => (s.categories_found || []).forEach(c => { catMap[c] = (catMap[c] || 0) + 1; }));
  const catData = Object.entries(catMap).map(([name, count]) => ({ name, count }));
  const trendData = [...scans].reverse().slice(-10).map((s, i) => ({ scan: i + 1, score: s.risk_score }));
  const riskColor = s => s >= 60 ? 'var(--danger)' : s >= 30 ? 'var(--warn)' : 'var(--accent)';
  const riskLabel = s => s >= 60 ? 'HIGH' : s >= 30 ? 'MED' : 'LOW';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'flex-start',
        gap: 14, marginBottom: 28
      }}>
        <div>
          <h1 className="section-title-premium" style={{ marginBottom: 6 }}>Sensitivity History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            All scan metadata from your account — no raw content stored.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={exportCSV} disabled={!scans.length} style={{ flexShrink: 0 }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No scans yet. Run your first scan to see history here.</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="history-kpi-grid">
            {[
              { val: scans.length, lbl: 'Total Scans', color: 'var(--accent)' },
              { val: Math.round(scans.reduce((a, s) => a + s.risk_score, 0) / scans.length), lbl: 'Avg Risk Score', color: 'var(--warn)' },
              { val: scans.filter(s => s.risk_score >= 60).length, lbl: 'High Risk Scans', color: 'var(--danger)' },
            ].map(s => (
              <div key={s.lbl} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                <div className="kpi-number" style={{ marginBottom: 6, color: s.color }}>{s.val}</div>
                <div className="small-label-premium" style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div className="history-charts-grid">
            <div className="card">
              <p className="section-title">Category Breakdown</p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={catData} margin={{ left: -20, right: 8 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="section-title">Risk Score Trend</p>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={trendData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="scan" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                  <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Scan Timeline ── */}
          <div className="card">
            <p className="section-title" style={{ marginBottom: 16 }}>
              <Clock size={13} />
              Scan Timeline ({scans.length} records)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scans.map(s => (
                <div key={s._id} className="history-scan-row">

                  {/* Risk Score */}
                  <div className="history-risk-score" style={{ color: riskColor(s.risk_score) }}>
                    <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.risk_score}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', opacity: 0.8 }}>{riskLabel(s.risk_score)}</div>
                  </div>

                  {/* Info + badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: 'var(--text-primary)', marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {s.scan_id}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {s.file_type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {new Date(s.createdAt).toLocaleString()} · {s.char_count?.toLocaleString()} chars · {s.findings_count} findings
                    </div>
                    {/* Badges wrap naturally — never overflow */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(s.categories_found || []).map(c => (
                        <span key={c} className={`badge badge-${c}`}>{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 10px', flexShrink: 0, alignSelf: 'flex-start' }}
                    onClick={() => handleDelete(s._id)}
                    title="Delete scan record"
                  >
                    <Trash2 size={13} />
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
