import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16,
      padding: '24px 28px', transition: 'border-color 200ms'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(134,239,172,0.2)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
    >
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', marginBottom: 10, textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </p>
      <p style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.04em', color: accent || '#fff', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>{sub}</p>}
    </div>
  )
}

function JobRow({ job }) {
  const navigate = useNavigate()
  const statusColors = {
    completed: '#86efac', processing: '#fbbf24', failed: '#f87171', pending: 'rgba(255,255,255,0.3)'
  }
  return (
    <div
      onClick={() => navigate(`/clips/${job.id}`)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
        transition: 'background 150ms', gap: 16
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: 'rgba(134,239,172,0.08)',
          border: '1px solid rgba(134,239,172,0.12)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, fontSize: 16
        }}>🎬</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.original_filename || 'Untitled video'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          {job.clips_count ?? 0} clips
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: statusColors[job.status] || 'rgba(255,255,255,0.3)',
            display: 'inline-block',
            animation: job.status === 'processing' ? 'pulse-green 1.5s infinite' : 'none'
          }} />
          <span style={{ fontSize: 11, color: statusColors[job.status], fontWeight: 500, textTransform: 'capitalize' }}>
            {job.status}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({ total: 0, clips: 0, processing: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jobs').catch(() => ({ data: { jobs: [] } })),
      api.get('/jobs/stats').catch(() => ({ data: { total: 0, clips: 0, processing: 0 } }))
    ]).then(([jobsRes, statsRes]) => {
      setJobs(jobsRes.data.jobs?.slice(0, 6) || [])
      setStats(statsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 1000 }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 40, flexWrap: 'wrap', gap: 16,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both'
        }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', marginBottom: 4 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.03em' }}>
              {firstName} 👋
            </h1>
          </div>
          <Link to="/upload">
            <Button size="md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New upload
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 40,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          <StatCard label="Videos processed" value={loading ? '—' : stats.total} sub="All time" />
          <StatCard label="Clips generated" value={loading ? '—' : stats.clips} sub="Ready to download" accent="#86efac" />
          <StatCard label="Processing" value={loading ? '—' : stats.processing} sub="Currently active" />
        </div>

        {/* Recent jobs */}
        <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>Recent videos</h2>
            <Link to="/history" style={{ fontSize: 12, color: '#86efac', fontWeight: 500 }}>View all →</Link>
          </div>

          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid rgba(134,239,172,0.2)', borderTopColor: '#86efac',
                  animation: 'spin 0.8s linear infinite', margin: '0 auto'
                }} />
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ padding: '56px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No videos yet</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
                  Upload your first video to get started
                </p>
                <Link to="/upload"><Button size="md">Upload a video</Button></Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                {jobs.map(job => <JobRow key={job.id} job={job} />)}
              </div>
            )}
          </div>
        </div>

        {/* Quick tip */}
        {!loading && jobs.length > 0 && (
          <div style={{
            marginTop: 20, padding: '14px 20px',
            background: 'rgba(134,239,172,0.05)', border: '1px solid rgba(134,239,172,0.12)',
            borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center',
            animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 240ms both'
          }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
              Clips are optimized for 9:16 vertical format — ideal for TikTok, Reels, and Shorts.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
