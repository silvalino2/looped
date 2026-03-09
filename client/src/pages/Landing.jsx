import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'

const features = [
  {
    icon: '⬆',
    title: 'Upload once',
    desc: 'Drop any long-form video — podcasts, interviews, webinars, courses. MP4 or MOV, up to 2GB.'
  },
  {
    icon: '✂',
    title: 'Auto-clip',
    desc: 'Looped detects the best moments and cuts them into 15, 30, and 60-second segments automatically.'
  },
  {
    icon: '💬',
    title: 'Burned-in captions',
    desc: 'Speech recognition transcribes every word. Captions are rendered directly into the video — no subtitle files.'
  },
  {
    icon: '↓',
    title: 'Download & post',
    desc: 'Preview every clip. Download individually. Ready for TikTok, Reels, Shorts, and LinkedIn.'
  }
]

const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'X / Twitter', 'LinkedIn']

const stats = [
  { value: '10x', label: 'Faster than manual editing' },
  { value: '6+', label: 'Clips per video' },
  { value: '5', label: 'Platforms supported' },
]

export default function Landing() {
  return (
    <div style={{
      background: '#0a0a0a', color: '#fff', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden'
    }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(24px)',
        padding: '0 clamp(20px, 5vw, 60px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 58
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '130px clamp(20px, 6vw, 60px) 100px',
        textAlign: 'center', position: 'relative'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(134,239,172,0.05) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 36, padding: '5px 14px', borderRadius: 999,
          background: 'rgba(134,239,172,0.07)',
          border: '1px solid rgba(134,239,172,0.18)',
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#86efac',
            display: 'inline-block', animation: 'pulse-green 2s infinite'
          }} />
          <span style={{ fontSize: 11, color: '#86efac', fontWeight: 500, letterSpacing: '0.06em' }}>
            MVP · Beta now open
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px, 7vw, 76px)',
          fontWeight: 650,
          lineHeight: 1.06,
          letterSpacing: '-0.04em',
          maxWidth: 780,
          marginBottom: 24,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          Turn long videos into{' '}
          <span style={{ color: '#86efac' }}>short‑form clips</span>
          {' '}automatically.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.45)',
          maxWidth: 480, lineHeight: 1.7,
          marginBottom: 44,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          Upload once. Looped cuts, captions, and exports clips for every platform — in seconds, not hours.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 56,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 220ms both'
        }}>
          <Link to="/register">
            <Button size="xl">Start for free →</Button>
          </Link>
          <Link to="/login">
            <Button size="xl" variant="ghost">Log in</Button>
          </Link>
        </div>

        {/* Platform pills */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 300ms both'
        }}>
          {platforms.map(p => (
            <span key={p} style={{
              padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 500,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em'
            }}>
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Thin divider */}
      <div style={{
        height: 1, margin: '0 clamp(20px, 8vw, 100px)',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)'
      }} />

      {/* Stats strip */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 8vw, 100px)' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden'
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#0d0d0d', padding: '36px 32px', textAlign: 'center'
            }}>
              <p style={{
                fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700,
                letterSpacing: '-0.04em', color: '#86efac', lineHeight: 1, marginBottom: 8
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 clamp(20px, 8vw, 100px) clamp(60px, 10vw, 120px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            color: '#86efac', textTransform: 'uppercase', marginBottom: 14
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 650,
            letterSpacing: '-0.03em', lineHeight: 1.15,
            maxWidth: 440, marginBottom: 60
          }}>
            Four steps from raw footage to ready clips.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 1,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 18, overflow: 'hidden'
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#0d0d0d', padding: '32px 28px',
                transition: 'background 200ms', cursor: 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#111'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d0d0d'}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(134,239,172,0.08)',
                  border: '1px solid rgba(134,239,172,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, marginBottom: 20
                }}>
                  {f.icon}
                </div>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.1em', marginBottom: 10
                }}>
                  0{i + 1}
                </p>
                <h3 style={{
                  fontSize: 15, fontWeight: 600, color: '#fff',
                  marginBottom: 10, letterSpacing: '-0.02em'
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 clamp(20px, 8vw, 100px) clamp(60px, 10vw, 120px)' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(134,239,172,0.07) 0%, rgba(134,239,172,0.02) 100%)',
          border: '1px solid rgba(134,239,172,0.14)',
          borderRadius: 24,
          padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 64px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 650,
            letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.15
          }}>
            Ready to automate your content?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 15,
            marginBottom: 36, maxWidth: 360, lineHeight: 1.6
          }}>
            Free to start. No credit card required.
          </p>
          <Link to="/register">
            <Button size="xl">Create your free account →</Button>
          </Link>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 16 }}>
            1 free upload included · Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '28px clamp(20px, 8vw, 100px)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12
      }}>
        <Logo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © 2025 Looped. Built for creators.
        </p>
      </footer>
    </div>
  )
}
