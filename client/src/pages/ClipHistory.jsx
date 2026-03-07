import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'

const STATUS_STYLE = {
  completed: { bg: 'rgba(134,239,172,0.08)', color: '#86efac', border: 'rgba(134,239,172,0.2)' },
  processing: { bg: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  failed: { bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
  pending: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' }
}

export default function ClipHistory() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 900 }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 32, flexWrap: 'wrap', gap: 16,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both'
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>
              Clip history
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              All your processed videos and generated clips
            </p>
          </div>
          <Link to="/upload"><Button size="md">New upload</Button></Link>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: '#0d0d0d', border: '1px solid #1a1a1a',
          borderRadius: 10, padding: 4, width: 'fit-content',
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          {['all', 'completed', 'processing', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              background: filter === f ? '#1a1a1a' : 'transparent',
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 200ms', fontFamily: "'DM Sans', sans-serif"
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{
          background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 16,
          overflow: 'hidden', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          {loading ? (
            <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '2px solid rgba(134,239,172,0.2)', borderTopColor: '#86efac',
                animation: 'spin 0.8s linear infinite'
              }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '56px 40px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>No videos found</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
                {filter === 'all' ? "You haven't uploaded any videos yet" : `No ${filter} videos`}
              </p>
              {filter === 'all' && <Link to="/upload"><Button size="md">Upload your first video</Button></Link>}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 40px',
                padding: '12px 20px', borderBottom: '1px solid #1a1a1a',
                gap: 16, alignItems: 'center'
              }}>
                {['File', 'Date', 'Clips', 'Status', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {h}
                  </span>
                ))}
              </div>

              {filtered.map((job, idx) => {
                const s = STATUS_STYLE[job.status] || STATUS_STYLE.pending
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/clips/${job.id}`)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 40px',
                      padding: '16px 20px', gap: 16, alignItems: 'center',
                      borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      cursor: 'pointer', transition: 'background 150ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>🎬</span>
                      <span style={{
                        fontSize: 13, fontWeight: 500, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em'
                      }}>
                        {job.original_filename || 'Untitled'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                      {job.clips_count ?? '—'}
                    </span>
                    <div style={{
                      display: 'inline-flex', padding: '4px 10px', borderRadius: 999,
                      background: s.bg, border: `1px solid ${s.border}`, width: 'fit-content'
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'capitalize' }}>
                        {job.status}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
