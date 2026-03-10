export default function Logo({ size = 'md', showText = true, dark = false }) {
  const sizes = {
    sm: { text: 22 },
    md: { text: 28 },
    lg: { text: 40 }
  }
  const s = sizes[size]
  const green = '#86efac'
  const fg = dark ? '#0a0a0a' : '#ffffff'

  return (
    <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none' }}>
      {showText && (
        <span style={{
          fontSize: s.text,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: fg,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'baseline'
        }}>
          <span style={{ color: fg }}>l</span>
          <span style={{ color: green }}>oo</span>
          <span style={{ color: fg }}>ped</span>
        </span>
      )}
    </div>
  )
          }
          
