const express = require('express')
const { pool } = require('../db')
const { auth, adminOnly } = require('../middleware/auth')

const router = express.Router()
router.use(auth, adminOnly)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, jobs, clips, active, failed] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM clips'),
      pool.query("SELECT COUNT(*) FROM jobs WHERE status IN ('pending','extracting','transcribing','segmenting','rendering')"),
      pool.query("SELECT COUNT(*) FROM jobs WHERE status = 'failed'")
    ])
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalJobs: parseInt(jobs.rows[0].count),
      totalClips: parseInt(clips.rows[0].count),
      activeJobs: parseInt(active.rows[0].count),
      failedJobs: parseInt(failed.rows[0].count)
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.suspended, u.created_at,
              COUNT(j.id) as job_count
       FROM users u LEFT JOIN jobs j ON j.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC`
    )
    res.json({ users: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/admin/users/:id — suspend/restore
router.put('/users/:id', async (req, res) => {
  try {
    const { suspended } = req.body
    await pool.query('UPDATE users SET suspended = $1 WHERE id = $2', [suspended, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as user_name, u.email as user_email
       FROM jobs j JOIN users u ON u.id = j.user_id
       ORDER BY j.created_at DESC LIMIT 50`
    )
    res.json({ jobs: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
