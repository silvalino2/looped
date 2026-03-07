import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import api from '../lib/api'

function AdminCard({ label, value, color }) {
  return (
    <div style={{
      background: '#0d0d0d', border: '1px solid #1a1a1a',
      borderRadius: 14, padding: '22px 24px'
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em', color: color || '#fff' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: {} })),
      api.get('/admin/users').catch(() => ({ data: { users: [] } })),
      api.get('/admin/jobs').catch(() => ({ data: { jobs: [] } }))
    ]).then(([statsRes, usersRes, jobsRes]) => {
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
      setJobs(jobsRes.data.jobs || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSuspend = async (userId, suspended) => {
    await api.put(`/admin/users/${userId}`, { suspended: !suspended })
    setUsers(u => u.map(usr => usr.id === userId ? { ...usr, suspended: !suspended } : usr))
  }

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 1100 }}>
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)'
          }}>
            <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600, letterSpacing: '0.06em' }}>ADMIN</span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.03em' }}>
            Platform overview
          </h1>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12, marginBottom: 40,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          <AdminCard label="Total users" value={loading ? '—' : stats?.totalUsers} accent="#86efac" />
          <AdminCard label="Total videos" value={loading ? '—' : stats?.totalJobs} />
          <AdminCard label="Clips generated" value={loading ? '—' : stats?.totalClips} color="#86efac" />
          <AdminCard label="Processing now" value={loading ? '—' : stats?.activeJobs} color="#fbbf24" />
          <AdminCard label="Failed jobs" value={loading ? '—' : stats?.failedJobs} color="#f87171" />
        </div>

        {/* Users table */}
        <div style={{
          marginBottom: 32,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14 }}>Users</h2>
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 80px 100px 90px',
              padding: '12px 20px', borderBottom: '1px solid #1a1a1a', gap: 16
            }}>
              {['Name', 'Email', 'Videos', 'Role', 'Action'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {loading ? (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '2px solid rgba(134,239,172,0.2)', borderTopColor: '#86efac',
                  animation: 'spin 0.8s linear infinite'
                }} />
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                No users found
              </div>
            ) : users.map((user, idx) => (
              <div key={user.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 180px 80px 100px 90px',
                padding: '14px 20px', gap: 16, alignItems: 'center',
                borderBottom: idx < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                  {user.suspended && <span style={{ marginLeft: 8, fontSize: 10, color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: 4 }}>Suspended</span>}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user.job_count ?? 0}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                  color: user.role === 'admin' ? '#86efac' : 'rgba(255,255,255,0.5)'
                }}>
                  {user.role}
                </span>
                {user.role !== 'admin' ? (
                  <button
                    onClick={() => handleSuspend(user.id, user.suspended)}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '6px 10px',
                      borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      background: user.suspended ? 'rgba(134,239,172,0.08)' : 'rgba(248,113,113,0.08)',
                      color: user.suspended ? '#86efac' : '#f87171',
                      border: `1px solid ${user.suspended ? 'rgba(134,239,172,0.2)' : 'rgba(248,113,113,0.2)'}`,
                      transition: 'all 200ms'
                    }}
                  >
                    {user.suspended ? 'Restore' : 'Suspend'}
                  </button>
                ) : <span />}
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 240ms both' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14 }}>Recent processing jobs</h2>
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px', padding: '12px 20px', borderBottom: '1px solid #1a1a1a', gap: 16 }}>
              {['File', 'User', 'Date', 'Status'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {loading ? (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(134,239,172,0.2)', borderTopColor: '#86efac', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : jobs.slice(0, 10).map((job, idx) => {
              const sc = { completed: '#86efac', processing: '#fbbf24', failed: '#f87171', pending: 'rgba(255,255,255,0.3)' }
              return (
                <div key={job.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px',
                  padding: '13px 20px', gap: 16, alignItems: 'center',
                  borderBottom: idx < jobs.slice(0,10).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.original_filename || 'Untitled'}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.user_name || '—'}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(job.created_at).toLocaleDateString()}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: sc[job.status], textTransform: 'capitalize' }}>{job.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
