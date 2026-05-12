// frontend/src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, Scissors, History, Settings, LogOut, Shield } from 'lucide-react';

const navItems = [
  { icon: <Shield size={15} />, label: 'Home',              path: '/' },
  { icon: <Upload size={15} />, label: 'Scanner',           path: '/scan' },
  { icon: <Scissors size={15} />, label: 'Redaction Studio', path: '/redact' },
  { icon: <History size={15} />, label: 'History',           path: '/history' },
  { icon: <Settings size={15} />, label: 'Settings',         path: '/settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 230, minHeight: '100vh', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', padding: '20px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '0 16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <Shield size={17} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSearch AI</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Web App</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 8px 4px' }}>Features</div>
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, border: 'none', width: '100%', textAlign: 'left',
              background: pathname === item.path ? 'rgba(59,130,246,.15)' : 'transparent',
              color: pathname === item.path ? '#60a5fa' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email}</div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 12 }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
