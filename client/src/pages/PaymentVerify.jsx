import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function PaymentVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | failed

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      setStatus('failed')
      return
    }

    api.get(`/payments/verify/${reference}`)
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate('/payment/success'), 1200)
      })
      .catch(() => {
        setStatus('failed')
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 24
    }}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 24px',
              border: '2px solid rgba(134,239,172,0.2)', borderTopColor: '#86efac',
              animation: 'spin 0.9s linear infinite'
            }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
              Verifying payment...
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Please don't close this page
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#86efac', marginBottom: 6 }}>
              Payment confirmed
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Redirecting you now...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
            }}>✕</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#f87171', marginBottom: 10 }}>
              Verification failed
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Your payment may still have gone through. Check your email or try again.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                padding: '10px 24px', background: '#86efac', color: '#0a0a0a',
                border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
              }}
            >
              Back to pricing
            </button>
          </>
        )}
      </div>
    </div>
  )
}
