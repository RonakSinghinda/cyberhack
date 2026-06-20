// frontend/src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Save, Key, Copy, Check, Eye, EyeOff, Terminal, Code2, Layers } from 'lucide-react';
import api from '../api/axios';

export default function Settings() {
  const { user } = useAuth();
  const [sensitivity, setSensitivity] = useState('medium');
  const [blocklist, setBlocklist] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // API Key States
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [docTab, setDocTab] = useState('curl');

  useEffect(() => {
    api.get('/settings').then(r => {
      setSensitivity(r.data.sensitivity || 'medium');
      setBlocklist(r.data.blocklist || []);
      setApiKey(r.data.apiKey || '');
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

  const handleGenerateKey = async () => {
    try {
      const res = await api.post('/settings/apikey');
      setApiKey(res.data.apiKey);
    } catch (err) {
      console.error('Failed to generate key', err);
    }
  };

  const handleRevokeKey = async () => {
    if (window.confirm('Are you sure you want to revoke this API key? All applications using it will immediately stop working.')) {
      try {
        await api.delete('/settings/apikey');
        setApiKey('');
        setShowKey(false);
      } catch (err) {
        console.error('Failed to revoke key', err);
      }
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title-premium" style={{ marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Configure sensitivity parameters and manage credentials for developer integrations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Account Info */}
        <div className="card">
          <p className="section-title">Account Profile</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#020617' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Sensitivity Controls */}
        <div className="card">
          <p className="section-title">Detection Threshold</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { val: 'high', label: 'High', desc: 'Alert on all potential risks' },
              { val: 'medium', label: 'Medium', desc: 'Balanced scanning parameters' },
              { val: 'low', label: 'Low', desc: 'Only alert on critical items' },
            ].map(s => (
              <div key={s.val} onClick={() => setSensitivity(s.val)} style={{
                padding: 14, borderRadius: 12, cursor: 'pointer', transition: 'all .25s',
                border: `2px solid ${sensitivity === s.val ? 'var(--accent)' : 'var(--border)'}`,
                background: sensitivity === s.val ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Blocklists */}
        <div className="card">
          <p className="section-title">Custom Keywords</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Sensitive patterns or identifiers that will always trigger redaction overrides.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input className="input" placeholder="Type a keyword and press Enter..." value={newWord}
              onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()} />
            <button className="btn btn-primary" onClick={addWord} style={{ padding: '0 16px' }}><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {blocklist.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontStyle: 'italic' }}>No custom items registered yet.</span>}
            {blocklist.map(w => (
              <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)' }}>
                {w} <X size={12} style={{ cursor: 'pointer', opacity: .7 }} onClick={() => setBlocklist(bl => bl.filter(x => x !== w))} />
              </span>
            ))}
          </div>
        </div>

        {/* Developer API Setup */}
        <div className="card" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', marginBottom: 14 }}>
            <div style={{ flexGrow: 1 }}>
              <p className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Key size={16} style={{ color: 'var(--accent)' }} /> Developer API Key
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>Integrate SafeSearch AI compliance filtering into external applications.</p>
            </div>
          </div>

          {/* Key Management Box */}
          <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            {apiKey ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flexGrow: 1, position: 'relative' }}>
                    <input 
                      type={showKey ? 'text' : 'password'} 
                      value={apiKey} 
                      readOnly 
                      className="input" 
                      style={{ fontFamily: 'monospace', fontSize: 12, paddingRight: 40, letterSpacing: showKey ? 'normal' : '3px' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowKey(!showKey)} 
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button className="btn btn-ghost" onClick={handleCopyKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, background: 'rgba(255,255,255,0.05)' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--accent)' }} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                  <button className="btn btn-danger" onClick={handleRevokeKey} style={{ fontSize: 12, padding: '6px 12px' }}>
                    Revoke Key
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No API credentials active for this account.</span>
                <button className="btn btn-primary" onClick={handleGenerateKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Key size={14} /> Generate API Key
                </button>
              </div>
            )}
          </div>

          {/* Quick Docs Block */}
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
              <Terminal size={14} /> Integration Guide
            </p>
            
            {/* Doc Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              {[
                { id: 'curl', label: 'cURL', icon: Terminal },
                { id: 'js', label: 'JavaScript', icon: Code2 },
                { id: 'python', label: 'Python', icon: Layers }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setDocTab(tab.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'none', border: 'none', borderBottom: docTab === tab.id ? '2px solid var(--accent)' : 'none',
                      color: docTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 500
                    }}
                  >
                    <Icon size={12} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Code Display */}
            <pre style={{
              background: '#030712', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)', overflowX: 'auto', margin: 0, lineHeight: 1.4
            }}>
              {docTab === 'curl' && `curl -X POST "http://localhost:5000/api/v1/scan" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Sending payload to routing node: 5678-9012-3456"}'`}

              {docTab === 'js' && `const response = await fetch("http://localhost:5000/api/v1/scan", {
  method: "POST",
  headers: {
    "x-api-key": "${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Contacting account email example@domain.com"
  })
});
const data = await response.json();
console.log(data.redacted_text);`}

              {docTab === 'python' && `import requests

url = "http://localhost:5000/api/v1/scan"
headers = {
    "x-api-key": "${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
}
data = {
    "text": "Scanning passport A1234567 for validation"
}

res = requests.post(url, headers=headers, json=data).json()
print(res["redacted_text"])`}
            </pre>
          </div>
        </div>

        {/* Save Settings Action Bar */}
        <button className="btn btn-primary" style={{ width: 'fit-content', padding: '10px 24px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving Settings…' : saved ? 'Settings Saved Successfully!' : 'Save Configurations'}
        </button>
      </div>
    </div>
  );
}
