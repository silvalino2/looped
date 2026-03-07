import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import api from '../lib/api'

const included = [
  'Unlimited video uploads',
  'Auto clip generation (15s, 30s, 60s)',
  'AI-powered burned-in captions',
  'Download all clips',
  'Full clip history',
  'Priority processing',
  'All future features included'
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [subStatus, setSubStatus] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/payments/status')
      .then(res => setSubStatus(res.data))
      .catch(() => {})
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/payments/initialize')
      // Redirect to Paystack hosted checkout
      window.location.href = res.data.authorization_url
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const isActive = subStatus?.plan === 'pro' && subStatus?.canUpload

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Upgrade to Pro
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            {isActive
              ? "You're already on the Pro plan."
              : "You've used your free upload. Subscribe to keep creating."}
          </p>
        </div>

        {/* Plan card */}
        <div style={{
          background: '#0d0d0d',
          border: '1px solid rgba(134,239,172,0.25)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 0 48px rgba(134,239,172,0.06)',
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          {/* Plan header */}
          <div style={{
            padding: '28px 32px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(134,239,172,0.06) 0%, transparent 60%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 999, marginBottom: 14,
                  background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.2)'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#86efac', letterSpacing: '0.06em' }}>
                    PRO MONTHLY
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.05em', color: '#fff' }}>$12</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>/month</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                  Billed monthly · Cancel anytime · Charged as ₦16,800 NGN
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '24px 32px' }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16
            }}>
              Everything included
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {included.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: '11px 14px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 10, fontSize: 13, color: '#f87171'
              }}>
                {error}
              </div>
            )}

            {isActive ? (
              <div style={{
                padding: '14px 20px', borderRadius: 12,
                background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#86efac' }}>
                  ✓ Pro plan active
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  {subStatus?.subscription?.current_period_end
                    ? `Renews ${new Date(subStatus.subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Subscription active'}
                </p>
              </div>
            ) : (
              <Button size="xl" fullWidth onClick={handleSubscribe} loading={loading}>
                Subscribe with Paystack →
              </Button>
            )}

            <p style={{
              textAlign: 'center', marginTop: 14,
              fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6
            }}>
              Secured by Paystack · Cancel anytime from Settings
            </p>
          </div>
        </div>

        {/* Free tier note */}
        <div style={{
          marginTop: 16, padding: '14px 20px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Free tier:</strong>{' '}
            1 upload included on every account. Your existing clips are always accessible.
          </p>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 12, color: 'rgba(255,255,255,0.25)'
        }}>
          <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back to dashboard</Link>
        </p>
      </div>
    </AppLayout>
  )
}
