// frontend/src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Save } from 'lucide-react';
import api from '../api/axios';

export default function Settings() {
  const { user } = useAuth();
  const [sensitivity, setSensitivity] = useState('medium');
  const [blocklist, setBlocklist] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      setSensitivity(r.data.sensitivity || 'medium');
      setBlocklist(r.data.blocklist || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.put('/settings', { sensitivity, blocklist });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const addWord = () => {
    const w = newWord.trim();
    if (w && !blocklist.includes(w)) { setBlocklist([...blocklist, w]); setNewWord(''); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Preferences stored in your account and applied on the server for every scan.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Account */}
        <div className="card">
          <p className="section-title">Account</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Sensitivity */}
        <div className="card">
          <p className="section-title">Detection Sensitivity</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { val: 'high', label: 'High', desc: 'Flag all risk levels' },
              { val: 'medium', label: 'Medium', desc: 'Medium & High only' },
              { val: 'low', label: 'Low', desc: 'High severity only' },
            ].map(s => (
              <div key={s.val} onClick={() => setSensitivity(s.val)} style={{
                padding: 14, borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
                border: `2px solid ${sensitivity === s.val ? 'var(--accent)' : 'var(--border)'}`,
                background: sensitivity === s.val ? 'rgba(59,130,246,.1)' : 'var(--bg-surface)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocklist */}
        <div className="card">
          <p className="section-title">Custom Blocklist</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Words or phrases that will always be flagged as High severity on the server.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input className="input" placeholder="Add a word or phrase..." value={newWord}
              onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()} />
            <button className="btn btn-primary" onClick={addWord}><Plus size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {blocklist.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No custom words yet.</span>}
            {blocklist.map(w => (
              <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', padding: '4px 12px', borderRadius: 999, fontSize: 13, border: '1px solid var(--border)' }}>
                {w} <X size={11} style={{ cursor: 'pointer', opacity: .7 }} onClick={() => setBlocklist(bl => bl.filter(x => x !== w))} />
              </span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
