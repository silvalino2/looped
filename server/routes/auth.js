const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')
const { auth } = require('../middleware/auth')

const router = express.Router()

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rows.length) return res.status(409).json({ message: 'Email already in use' })

    const hash = await bcrypt.hash(password, 12)
    const isFirstUser = (await pool.query('SELECT COUNT(*) FROM users')).rows[0].count === '0'
    const role = isFirstUser || email.toLowerCase() === process.env.ADMIN_EMAIL ? 'admin' : 'user'

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email.toLowerCase(), hash, role]
    )
    const user = result.rows[0]
    res.status(201).json({ token: signToken(user.id), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    if (user.suspended) return res.status(403).json({ message: 'Account suspended' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const { password_hash, ...safeUser } = user
    res.json({ token: signToken(user.id), user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user })
})

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'Name required' })

    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role',
      [name, req.user.id]
    )
    res.json({ user: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
