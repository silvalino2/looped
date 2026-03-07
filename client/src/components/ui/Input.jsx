export default function Input({ label, error, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.01em'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        style={{
          background: '#141414', border: `1px solid ${error ? '#f87171' : '#1e1e1e'}`,
          borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff',
          width: '100%', transition: 'border-color 200ms, box-shadow 200ms',
          fontFamily: "'DM Sans', sans-serif"
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? '#f87171' : '#86efac'
          e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(248,113,113,0.1)' : 'rgba(134,239,172,0.1)'}`
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#f87171' : '#1e1e1e'
          e.target.style.boxShadow = 'none'
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
      )}
    </div>
  )
}
