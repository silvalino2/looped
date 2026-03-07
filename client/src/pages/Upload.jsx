import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'

const STAGES = [
  { key: 'uploading', label: 'Uploading video' },
  { key: 'extracting', label: 'Extracting audio' },
  { key: 'transcribing', label: 'Transcribing speech' },
  { key: 'segmenting', label: 'Segmenting clips' },
  { key: 'rendering', label: 'Burning captions' },
  { key: 'done', label: 'Complete' }
]

export default function Upload() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState(null) // null = idle
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [error, setError] = useState(null)
  const [jobId, setJobId] = useState(null)

  const handleFile = (f) => {
    if (!f) return
    if (!['video/mp4', 'video/quicktime'].includes(f.type)) {
      setError('Only MP4 and MOV files are supported')
      return
    }
    if (f.size > 2 * 1024 * 1024 * 1024) {
      setError('File must be under 2GB')
      return
    }
    setFile(f)
    setError(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleProcess = async () => {
    if (!file) return
    setError(null)
    setStage('uploading')
    setCurrentStage(0)

    const formData = new FormData()
    formData.append('video', file)

    try {
      // Upload
      const uploadRes = await api.post('/jobs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total))
        }
      })

      const id = uploadRes.data.jobId
      setJobId(id)
      setCurrentStage(1)

      // Poll for status
      let done = false
      const stageMap = {
        extracting: 1, transcribing: 2, segmenting: 3, rendering: 4, completed: 5
      }

      while (!done) {
        await new Promise(r => setTimeout(r, 2000))
        const statusRes = await api.get(`/jobs/${id}/status`)
        const { status } = statusRes.data
        if (stageMap[status] !== undefined) setCurrentStage(stageMap[status])
        if (status === 'completed') { done = true; setCurrentStage(5) }
        if (status === 'failed') throw new Error(statusRes.data.error || 'Processing failed')
      }

      setTimeout(() => navigate(`/clips/${id}`), 800)
    } catch (err) {
      // 402 = subscription required — redirect to pricing
      if (err.response?.status === 402) {
        navigate('/pricing')
        return
      }
      setError(err.response?.data?.error || err.message || 'Something went wrong')
      setStage(null)
    }
  }

  // Check subscription status on mount to show paywall proactively
  useEffect(() => {
    import('../lib/api').then(({ default: apiInstance }) => {
      apiInstance.get('/payments/status').then(res => {
        if (!res.data.canUpload) {
          navigate('/pricing')
        }
      }).catch(() => {})
    })
  }, [])

  const isProcessing = stage !== null

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 720 }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }}>
            New upload
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Upload a long-form video and Looped will generate ready-to-post short clips.
          </p>
        </div>

        {/* Drop zone */}
        {!isProcessing && (
          <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both' }}>
            <div
              onClick={() => !file && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragging ? '#86efac' : file ? 'rgba(134,239,172,0.4)' : '#1e1e1e'}`,
                borderRadius: 20, padding: '60px 40px', textAlign: 'center',
                cursor: file ? 'default' : 'pointer', transition: 'all 250ms',
                background: dragging ? 'rgba(134,239,172,0.04)' : file ? 'rgba(134,239,172,0.03)' : '#0d0d0d',
                boxShadow: dragging ? '0 0 40px rgba(134,239,172,0.08)' : 'none'
              }}
            >
              <input
                ref={fileRef} type="file" accept="video/mp4,video/quicktime"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />

              {file ? (
                <div>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: 'rgba(134,239,172,0.1)',
                    border: '1px solid rgba(134,239,172,0.2)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 16px', fontSize: 24
                  }}>🎬</div>
                  <p style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    style={{
                      marginTop: 14, fontSize: 12, color: '#f87171', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '4px 8px',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 20px', fontSize: 22
                  }}>
                    ⬆
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' }}>
                    Drop your video here
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    or click to browse · MP4 or MOV · up to 2GB
                  </p>
                </>
              )}
            </div>

            {error && (
              <div style={{
                marginTop: 14, padding: '12px 16px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, fontSize: 13, color: '#f87171'
              }}>
                {error}
              </div>
            )}

            {file && (
              <div style={{ marginTop: 20 }}>
                {/* Settings summary */}
                <div style={{
                  background: '#0d0d0d', border: '1px solid #1a1a1a',
                  borderRadius: 14, padding: '20px 24px', marginBottom: 16
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 14 }}>
                    Processing settings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      ['Clip lengths', '15s, 30s, 60s'],
                      ['Captions', 'Auto-generated, burned in'],
                      ['Format', 'MP4 · 9:16 vertical'],
                      ['Platforms', 'TikTok, Reels, Shorts']
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button size="lg" fullWidth onClick={handleProcess}>
                  Generate clips →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div style={{
            background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 20,
            padding: '40px 36px', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px',
                border: '2px solid rgba(134,239,172,0.15)',
                borderTopColor: '#86efac', animation: 'spin 0.9s linear infinite'
              }} />
              <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
                Processing your video
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                This may take a few minutes depending on video length
              </p>
            </div>

            {/* Stage tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STAGES.map((s, i) => {
                const done = i < currentStage
                const active = i === currentStage
                const pending = i > currentStage
                return (
                  <div key={s.key} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: i < STAGES.length - 1 ? 0 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                        flexShrink: 0, transition: 'all 300ms',
                        background: done ? '#86efac' : active ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${done ? '#86efac' : active ? '#86efac' : '#1e1e1e'}`,
                        color: done ? '#0a0a0a' : active ? '#86efac' : 'rgba(255,255,255,0.25)'
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div style={{
                          width: 1, height: 28, margin: '4px 0',
                          background: done ? 'rgba(134,239,172,0.4)' : 'rgba(255,255,255,0.06)',
                          transition: 'background 500ms'
                        }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 5, paddingBottom: i < STAGES.length - 1 ? 24 : 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        color: done ? 'rgba(255,255,255,0.5)' : active ? '#fff' : 'rgba(255,255,255,0.25)',
                        transition: 'all 300ms', letterSpacing: '-0.01em'
                      }}>
                        {s.label}
                        {active && s.key === 'uploading' && ` · ${uploadProgress}%`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
