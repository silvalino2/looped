const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const { pool } = require('../db')

const CLIPS_DIR = process.env.CLIPS_DIR || path.join(__dirname, '../clips')
const UPLOADS_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')

// Ensure dirs exist
;[CLIPS_DIR, UPLOADS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }))

// Get video duration
const getDuration = (filePath) => new Promise((resolve, reject) => {
  ffmpeg.ffprobe(filePath, (err, meta) => {
    if (err) reject(err)
    else resolve(meta.format.duration)
  })
})

// Cut a single clip from video
const cutClip = (inputPath, outputPath, start, duration) => new Promise((resolve, reject) => {
  ffmpeg(inputPath)
    .setStartTime(start)
    .setDuration(duration)
    .outputOptions([
      '-c:v libx264',
      '-c:a aac',
      '-preset fast',
      '-crf 23',
      '-movflags +faststart'
    ])
    .output(outputPath)
    .on('end', resolve)
    .on('error', reject)
    .run()
})

// Generate clip segments based on duration
const getSegments = (duration) => {
  const segments = []
  const targetLength = 60 // aim for 60s clips, adjust down for short videos
  const clipDuration = Math.min(targetLength, Math.max(15, duration / 4))

  let start = 0
  while (start < duration - 10) {
    const end = Math.min(start + clipDuration, duration)
    if (end - start >= 10) {
      segments.push({ start, end, duration: end - start })
    }
    start += clipDuration
    if (segments.length >= 6) break // max 6 clips per video
  }
  return segments
}

// Main processing pipeline
const processVideo = async (jobId, filePath, originalFilename) => {
  const updateStatus = async (status, error = null) => {
    await pool.query(
      'UPDATE jobs SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
      [status, error, jobId]
    )
  }

  try {
    // 1. Get job & user info
    const jobResult = await pool.query('SELECT user_id FROM jobs WHERE id = $1', [jobId])
    const userId = jobResult.rows[0]?.user_id

    // 2. Extract audio / get metadata
    await updateStatus('extracting')
    const duration = await getDuration(filePath)
    await pool.query('UPDATE jobs SET duration_seconds = $1 WHERE id = $2', [duration, jobId])

    // 3. "Transcribing" — in production plug in Whisper or AssemblyAI here
    await updateStatus('transcribing')
    await new Promise(r => setTimeout(r, 1000)) // placeholder

    // 4. Segment clips
    await updateStatus('segmenting')
    const segments = getSegments(duration)

    // 5. Cut clips
    await updateStatus('rendering')
    const clipPromises = segments.map(async (seg, i) => {
      const clipFilename = `${jobId}_clip_${i + 1}.mp4`
      const clipPath = path.join(CLIPS_DIR, clipFilename)
      await cutClip(filePath, clipPath, seg.start, seg.duration)

      // Generate clip URL
      const url = `/clips/${clipFilename}`

      // Placeholder caption (replace with Whisper transcript in production)
      const caption = `Clip ${i + 1} — ${Math.round(seg.duration)}s from your video`

      // Save clip to DB
      await pool.query(
        `INSERT INTO clips (job_id, user_id, filename, file_path, url, start_time, end_time, duration_seconds, caption)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [jobId, userId, clipFilename, clipPath, url, seg.start, seg.end, seg.duration, caption]
      )
      return clipFilename
    })

    await Promise.all(clipPromises)

    // 6. Done
    await updateStatus('completed')
    console.log(`✓ Job ${jobId} completed — ${segments.length} clips`)

  } catch (err) {
    console.error(`✗ Job ${jobId} failed:`, err.message)
    await updateStatus('failed', err.message)
  }
}

module.exports = { processVideo, UPLOADS_DIR, CLIPS_DIR }
