import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'

const features = [
  {
    icon: '⬆', title: 'Upload once',
    desc: 'Drop any long-form video — podcasts, interviews, webinars, courses. MP4 or MOV, up to 2GB.'
  },
  {
    icon: '✂', title: 'Auto-clip',
    desc: 'Looped detects the best moments and cuts them into 15, 30, and 60-second segments automatically.'
  },
  {
    icon: '💬', title: 'Burned-in captions',
    desc: 'Speech recognition transcribes every word. Captions are rendered directly into the video — no subtitle files.'
  },
  {
    icon: '↓', title: 'Download & post',
    desc: 'Preview every clip. Download individually. Ready for TikTok, Reels, Shorts, and LinkedIn.'
  }
]

const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'X / Twitter', 'LinkedIn']

export default function Landing() {
  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)',
        padding: '0 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Subtle green glow behind */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(134,239,172,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'pulse-green 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#86efac', fontWeight: 500, letterSpacing: '0.04em' }}>
              MVP · Beta now open
            </span>
          </div>
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 600,
          lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 760,
          animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 80ms both'
        }}>
          Turn long videos into{' '}
          <span style={{ color: '#86efac' }}>short-form clips</span>
          {' '}automatically.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)',
          maxWidth: 520, lineHeight: 1.6, marginTop: 24,
          animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 160ms both'
        }}>
          Upload once. Looped cuts, captions, and exports clips for every platform — in seconds, not hours.
        </p>

        <div style={{
          display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 240ms both'
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
          display: 'flex', gap: 8, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 320ms both'
        }}>
          {platforms.map(p => (
            <span key={p} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)', letterSpacing: '0.01em'
            }}>
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '0 40px' }} />

      {/* Features */}
      <section style={{ padding: 'clamp(60px, 10vw, 120px) clamp(20px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#86efac', textTransform: 'uppercase', marginBottom: 16 }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, letterSpacing: '-0.03em', maxWidth: 480, lineHeight: 1.15, marginBottom: 64 }}>
            Four steps from raw footage to ready clips.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden'
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#0d0d0d', padding: 32,
                transition: 'background 200ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#111111'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d0d0d'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(134,239,172,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, marginBottom: 20, border: '1px solid rgba(134,239,172,0.15)'
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  0{i + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 clamp(20px, 6vw, 80px) clamp(60px, 10vw, 120px)' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(134,239,172,0.08) 0%, rgba(134,239,172,0.02) 100%)',
          border: '1px solid rgba(134,239,172,0.15)', borderRadius: 24,
          padding: 'clamp(40px, 6vw, 72px)', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ready to automate your content?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 32 }}>
            Free to start. No credit card required.
          </p>
          <Link to="/register">
            <Button size="xl">Create your free account →</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12
      }}>
        <Logo size="sm" />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © 2025 Looped. Built for creators.
        </p>
      </footer>
    </div>
  )
}
