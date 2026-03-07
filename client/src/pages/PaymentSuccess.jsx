import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          navigate('/dashboard')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 24, textAlign: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(134,239,172,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both', position: 'relative' }}>
        <div style={{ marginBottom: 40 }}>
          <Logo size="md" />
        </div>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 32px',
          background: 'rgba(134,239,172,0.1)', border: '1.5px solid rgba(134,239,172,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) 200ms both'
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700,
          letterSpacing: '-0.04em', color: '#fff', marginBottom: 12,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 150ms both'
        }}>
          You're on Pro 🎉
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 8,
          maxWidth: 360, lineHeight: 1.6,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 220ms both'
        }}>
          Your subscription is active. Unlimited uploads, auto-captions, and all clips — every month.
        </p>

        {/* Plan badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 48,
          padding: '8px 18px', borderRadius: 999,
          background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)',
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 280ms both'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#86efac' }}>Pro Monthly · $12/mo (₦16,800)</span>
        </div>

        {/* Countdown */}
        <div style={{
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 340ms both'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 36px', background: '#86efac', color: '#0a0a0a',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif',",
              letterSpacing: '-0.01em', marginBottom: 16
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
            onMouseLeave={e => e.currentTarget.style.background = '#86efac'}
          >
            Go to dashboard →
          </button>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
            Redirecting automatically in {countdown}s
          </p>
        </div>
      </div>
    </div>
  )
}
