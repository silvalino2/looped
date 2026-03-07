const express = require('express')
const axios = require('axios')
const crypto = require('crypto')
const { pool } = require('../db')
const { auth } = require('../middleware/auth')
const { getSubscriptionStatus } = require('../middleware/subscription')

const router = express.Router()

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = 'https://api.paystack.co'
const PLAN_CODE = process.env.PAYSTACK_PLAN_CODE
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
const AMOUNT = 16800 // ₦16,800 NGN (displayed as $12/month on site)

const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET}`,
  'Content-Type': 'application/json'
}

// GET /api/payments/status — check user's current subscription
router.get('/status', auth, async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user.id)

    // Get full subscription record
    const subResult = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    )

    res.json({
      ...status,
      subscription: subResult.rows[0] || null
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/payments/initialize — start Paystack checkout
router.post('/initialize', auth, async (req, res) => {
  try {
    const user = req.user
    const reference = `looped_${user.id}_${Date.now()}`

    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: user.email,
        amount: AMOUNT * 100, // Paystack expects kobo (NGN minor unit × 100)
        reference,
        plan: PLAN_CODE,
        callback_url: `${CLIENT_URL}/payment/verify?reference=${reference}`,
        metadata: {
          userId: user.id,
          userName: user.name,
          plan: 'pro_monthly'
        },
        channels: ['card']
      },
      { headers: paystackHeaders }
    )

    const { authorization_url, access_code } = response.data.data

    // Store pending payment
    await pool.query(
      `INSERT INTO payments (user_id, paystack_reference, amount, currency, status, metadata)
       VALUES ($1, $2, $3, 'USD', 'pending', $4)
       ON CONFLICT (paystack_reference) DO NOTHING`,
      [user.id, reference, AMOUNT, JSON.stringify({ plan: 'pro_monthly', currency: 'NGN' })]
    )

    res.json({ authorization_url, reference })
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to initialize payment' })
  }
})

// GET /api/payments/verify/:reference — verify after redirect
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params

    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: paystackHeaders }
    )

    const data = response.data.data
    const { status, customer, subscription_code, plan } = data

    if (status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful', status })
    }

    // Update payment record
    await pool.query(
      `UPDATE payments SET status = 'success', metadata = $1 WHERE paystack_reference = $2`,
      [JSON.stringify(data), reference]
    )

    // Upsert subscription
    const periodStart = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await pool.query(
      `INSERT INTO subscriptions
         (user_id, paystack_customer_code, paystack_subscription_code, plan_code, status, amount, currency, current_period_start, current_period_end)
       VALUES ($1, $2, $3, $4, 'active', $5, 'USD', $6, $7)
       ON CONFLICT DO NOTHING`,
      [
        req.user.id,
        customer?.customer_code || '',
        subscription_code || '',
        plan?.plan_code || PLAN_CODE,
        AMOUNT,
        periodStart,
        periodEnd
      ]
    )

    res.json({ success: true, message: 'Subscription activated' })
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// POST /api/payments/webhook — Paystack webhook (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(req.body)
    .digest('hex')

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature')
  }

  res.sendStatus(200) // Acknowledge immediately

  const event = JSON.parse(req.body)
  const { event: eventType, data } = event

  try {
    switch (eventType) {

      // Subscription renewed
      case 'charge.success': {
        const meta = data.metadata
        if (!meta?.userId) break
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        await pool.query(
          `UPDATE subscriptions SET status = 'active', current_period_end = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [periodEnd, meta.userId]
        )
        await pool.query(
          `INSERT INTO payments (user_id, paystack_reference, amount, currency, status, metadata)
           VALUES ($1, $2, $3, 'NGN', 'success', $4)
           ON CONFLICT (paystack_reference) DO UPDATE SET status = 'success'`,
          [meta.userId, data.reference, data.amount / 100, JSON.stringify(data)]
        )
        break
      }

      // Subscription disabled/cancelled
      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subCode = data.subscription_code
        await pool.query(
          `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
           WHERE paystack_subscription_code = $1`,
          [subCode]
        )
        break
      }

      // Subscription reactivated
      case 'subscription.enable': {
        const subCode = data.subscription_code
        const periodEnd = new Date(data.next_payment_date || Date.now())
        await pool.query(
          `UPDATE subscriptions SET status = 'active', current_period_end = $1, updated_at = NOW()
           WHERE paystack_subscription_code = $2`,
          [periodEnd, subCode]
        )
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message)
  }
})

// POST /api/payments/cancel — cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subResult = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    )
    const sub = subResult.rows[0]
    if (!sub?.paystack_subscription_code || !sub?.paystack_email_token) {
      return res.status(404).json({ error: 'No active subscription found' })
    }

    await axios.post(
      `${PAYSTACK_BASE}/subscription/disable`,
      {
        code: sub.paystack_subscription_code,
        token: sub.paystack_email_token
      },
      { headers: paystackHeaders }
    )

    await pool.query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [sub.id]
    )

    res.json({ success: true, message: 'Subscription cancelled. You keep access until the period ends.' })
  } catch (err) {
    console.error('Cancel error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
})

module.exports = router
