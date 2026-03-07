const jwt = require('jsonwebtoken')
const { pool } = require('../db')

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const result = await pool.query(
      'SELECT id, name, email, role, suspended FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (!result.rows[0]) return res.status(401).json({ message: 'User not found' })
    if (result.rows[0].suspended) return res.status(403).json({ message: 'Account suspended' })

    req.user = result.rows[0]
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = { auth, adminOnly }
