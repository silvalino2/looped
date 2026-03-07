import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

const navItems = [
  {
    label: 'Dashboard', path: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    label: 'New Upload', path: '/upload',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    )
  },
  {
    label: 'Clip History', path: '/history',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  },
  {
    label: 'Upgrade', path: '/pricing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )
  },
  {
    label: 'Settings', path: '/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    )
  }
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh', background: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
        transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo area */}
        <div style={{
          padding: collapsed ? '20px 0' : '24px 20px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 68
        }}>
          {!collapsed && <Link to="/dashboard"><Logo size="sm" /></Link>}
          {collapsed && <Logo size="sm" showText={false} />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', padding: 6, borderRadius: 6,
              transition: 'color 200ms', display: 'flex', alignItems: 'center',
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <polyline points="9 18 15 12 9 6"/>
                : <polyline points="15 18 9 12 15 6"/>
              }
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 8, transition: 'all 200ms',
                background: active ? 'rgba(134,239,172,0.08)' : 'transparent',
                color: active ? '#86efac' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: active ? 500 : 400,
                justifyContent: collapsed ? 'center' : 'flex-start',
                letterSpacing: '-0.01em', textDecoration: 'none',
                borderLeft: active ? '2px solid #86efac' : '2px solid transparent',
                marginLeft: active && !collapsed ? -2 : 0
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)', e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </Link>
            )
          })}

          {user?.role === 'admin' && (
            <Link to="/admin" style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10, padding: collapsed ? '10px' : '10px 12px',
              borderRadius: 8, transition: 'all 200ms',
              background: location.pathname === '/admin' ? 'rgba(134,239,172,0.08)' : 'transparent',
              color: location.pathname === '/admin' ? '#86efac' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: 400, justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none', borderLeft: '2px solid transparent', marginTop: 8
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {!collapsed && <span>Admin</span>}
            </Link>
          )}
        </nav>

        {/* User footer */}
        <div style={{
          padding: collapsed ? '16px 10px' : '16px 14px',
          borderTop: '1px solid #1a1a1a'
        }}>
          {!collapsed && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {user?.email}
              </p>
            </div>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', padding: collapsed ? '8px' : '8px 10px',
            background: 'none', border: 'none', borderRadius: 8,
            color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer',
            transition: 'all 200ms', fontFamily: "'DM Sans', sans-serif"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && 'Log out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 64 : 240,
        transition: 'margin-left 300ms cubic-bezier(0.16,1,0.3,1)',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  )
}
