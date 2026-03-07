const express = require('express')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')
const { auth } = require('../middleware/auth')
const { requireUploadAccess } = require('../middleware/subscription')
const { processVideo, UPLOADS_DIR } = require('../controllers/processor')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only MP4 and MOV files allowed'))
  }
})

// POST /api/jobs/upload — gated by subscription check
router.post('/upload', auth, requireUploadAccess, upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  try {
    const result = await pool.query(
      `INSERT INTO jobs (user_id, original_filename, stored_filename, file_path, file_size_bytes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
      [req.user.id, req.file.originalname, req.file.filename, req.file.path, req.file.size]
    )
    const jobId = result.rows[0].id

    // Increment free_uploads_used if on free plan
    if (req.subscriptionStatus?.plan === 'free') {
      await pool.query(
        'UPDATE users SET free_uploads_used = free_uploads_used + 1 WHERE id = $1',
        [req.user.id]
      )
    }

    processVideo(jobId, req.file.path, req.file.originalname).catch(console.error)
    res.status(202).json({ jobId, message: 'Processing started' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create job' })
  }
})

// GET /api/jobs
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(c.id) as clips_count
       FROM jobs j LEFT JOIN clips c ON c.job_id = j.id
       WHERE j.user_id = $1
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]
    )
    res.json({ jobs: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/jobs/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [jobsRes, clipsRes, activeRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT COUNT(*) FROM clips WHERE user_id = $1', [req.user.id]),
      pool.query("SELECT COUNT(*) FROM jobs WHERE user_id = $1 AND status IN ('pending','extracting','transcribing','segmenting','rendering')", [req.user.id])
    ])
    res.json({
      total: parseInt(jobsRes.rows[0].count),
      clips: parseInt(clipsRes.rows[0].count),
      processing: parseInt(activeRes.rows[0].count)
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/jobs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Job not found' })
    res.json({ job: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/jobs/:id/status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT status, error_message FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/jobs/:id/clips
router.get('/:id/clips', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clips WHERE job_id = $1 AND user_id = $2 ORDER BY start_time ASC',
      [req.params.id, req.user.id]
    )
    res.json({ clips: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
