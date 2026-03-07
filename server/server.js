require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { initDB } = require('./db')
const { CLIPS_DIR, UPLOADS_DIR } = require('./controllers/processor')

const app = express()
const PORT = process.env.PORT || 5000

// Webhook route needs raw body — register BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/payments').webhook || ((req, res, next) => next()))

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(UPLOADS_DIR))
app.use('/clips', express.static(CLIPS_DIR))

// API Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/jobs', require('./routes/jobs'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/admin', require('./routes/admin'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/dist')
  app.use(express.static(buildPath))
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')))
}

app.use((err, req, res, next) => {
  console.error(err.message)
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 2GB)' })
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const start = async () => {
  await initDB()
  app.listen(PORT, () => {
    console.log(`\n🔁 Looped server running on port ${PORT}`)
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   DB:  ${process.env.DATABASE_URL?.split('@')[1] || 'local'}\n`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
