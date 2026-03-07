import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../lib/api'

export default function Settings() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [subStatus, setSubStatus] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  useEffect(() => {
    api.get('/payments/status')
      .then(res => setSubStatus(res.data))
      .catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put('/auth/profile', { name })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.post('/payments/cancel')
      const res = await api.get('/payments/status')
      setSubStatus(res.data)
      setCancelConfirm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel')
    }
    setCancelling(false)
  }

  const isActive = subStatus?.plan === 'pro' && subStatus?.canUpload
  const periodEnd = subStatus?.subscription?.current_period_end

  return (
    <AppLayout>
      <div style={{ padding: 'clamp(28px, 4vw, 48px)', maxWidth: 600 }}>
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>
            Settings
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Manage your account and subscription</p>
        </div>

        {/* Profile */}
        <div style={{
          background: '#0d0d0d', border: '1px solid #1a1a1a',
          borderRadius: 16, padding: 28, marginBottom: 16,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 20 }}>Profile</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled />
            {error && <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button type="submit" size="md" loading={saving}>Save changes</Button>
              {saved && <span style={{ fontSize: 12, color: '#86efac' }}>✓ Saved</span>}
            </div>
          </form>
        </div>

        {/* Subscription */}
        <div style={{
          background: '#0d0d0d', border: `1px solid ${isActive ? 'rgba(134,239,172,0.2)' : '#1a1a1a'}`,
          borderRadius: 16, padding: 28, marginBottom: 16,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Subscription</h2>
            {isActive && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#86efac' }}>Active</span>
              </div>
            )}
          </div>

          {isActive ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  ['Plan', 'Pro Monthly · $12/mo (₦16,800)'],
                  ['Status', 'Active'],
                  ['Next billing', periodEnd
                    ? new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—']
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline'
                  }}
                >
                  Cancel subscription
                </button>
              ) : (
                <div style={{
                  padding: '16px 20px', background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12
                }}>
                  <p style={{ fontSize: 13, color: '#fff', marginBottom: 4, fontWeight: 500 }}>
                    Cancel your subscription?
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>
                    You'll keep Pro access until {periodEnd ? new Date(periodEnd).toLocaleDateString() : 'the end of the billing period'}. Your existing clips are always yours.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button size="sm" variant="danger" loading={cancelling} onClick={handleCancel}>
                      Yes, cancel
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCancelConfirm(false)}>
                      Keep subscription
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                You're on the <strong style={{ color: '#fff' }}>Free plan</strong>.
                {subStatus?.freeUsed >= 1
                  ? ' Your free upload has been used.'
                  : ` You have 1 free upload remaining.`}
              </p>
              <Link to="/pricing">
                <Button size="md">
                  Upgrade to Pro · $12/mo →
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Account info */}
        <div style={{
          background: '#0d0d0d', border: '1px solid #1a1a1a',
          borderRadius: 16, padding: 28,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 240ms both'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 16 }}>Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Account type', user?.role === 'admin' ? 'Administrator' : 'Creator'],
              ['Member since', user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—']
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
