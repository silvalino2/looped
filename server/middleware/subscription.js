const { pool } = require('../db')

// Returns subscription status for a user
const getSubscriptionStatus = async (userId) => {
  const result = await pool.query(
    `SELECT s.status, s.current_period_end, u.free_uploads_used
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id
     WHERE u.id = $1
     ORDER BY s.created_at DESC LIMIT 1`,
    [userId]
  )
  const row = result.rows[0]
  if (!row) return { canUpload: false, reason: 'user_not_found' }

  const freeUsed = row.free_uploads_used || 0
  const subStatus = row.status
  const periodEnd = row.current_period_end

  // Active subscriber
  if (subStatus === 'active' && periodEnd && new Date(periodEnd) > new Date()) {
    return { canUpload: true, plan: 'pro', freeUsed }
  }

  // Free tier — first upload allowed
  if (freeUsed < 1) {
    return { canUpload: true, plan: 'free', freeUsed }
  }

  // Free used up, no active sub
  return {
    canUpload: false,
    reason: 'subscription_required',
    plan: 'free',
    freeUsed
  }
}

// Middleware — blocks upload if not allowed
const requireUploadAccess = async (req, res, next) => {
  try {
    const status = await getSubscriptionStatus(req.user.id)
    if (!status.canUpload) {
      return res.status(402).json({
        error: 'subscription_required',
        message: 'Free upload used. Subscribe to continue.',
        redirectTo: '/pricing'
      })
    }
    req.subscriptionStatus = status
    next()
  } catch (err) {
    console.error('Subscription check error:', err)
    next() // fail open — don't block user on DB error
  }
}

module.exports = { getSubscriptionStatus, requireUploadAccess }
