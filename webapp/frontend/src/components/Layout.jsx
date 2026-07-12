// frontend/src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Zap, Scissors, History, Settings,
  LogOut, LayoutDashboard, FileScan, FileStack, Share2, Menu, X
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ]
  },
  {
    label: 'DLP Tools',
    items: [
      { icon: FileScan,   label: 'Content Scanner',    path: '/scan' },
      { icon: Scissors,   label: 'Redaction Studio',   path: '/redact' },
      { icon: Shield,     label: 'Compliance Shield',  path: '/compliance' },
      { icon: Share2,     label: 'Secure Share',       path: '/share' },
      { icon: FileStack,  label: 'Bulk Audit',         path: '/bulk' },
    ]
  },
  {
    label: 'Account',
    items: [
      { icon: History,  label: 'Scan History', path: '/history' },
      { icon: Settings, label: 'Settings',     path: '/settings' },
    ]
  }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: 'var(--accent-gradient)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-button)',
            flexShrink: 0
          }}>
            <Shield size={18} color="#020617" />
          </div>
          <div>
            <div style={{
              fontSize: 14, fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>DataShield AI</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}>DLP PLATFORM v2.0</div>
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          title="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.label}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              padding: '0 8px', marginBottom: 6
            }}>
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: '#020617', flexShrink: 0
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} title="Sign Out" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 4, borderRadius: 6,
          transition: 'color 0.15s', flexShrink: 0
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={15} />
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY BACKDROP ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER SIDEBAR ── */}
      <aside className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile top navbar */}
        <header className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            title="Open menu"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--accent-gradient)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={15} color="#020617" />
            </div>
            <span style={{
              fontSize: 14, fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>DataShield AI</span>
          </div>
          <div style={{ width: 36 }} /> {/* spacer to center logo */}
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
