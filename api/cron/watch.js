import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import webpush from 'web-push'
import { fetchPropertiesFromUpstream } from '../_lib/pagibig.js'
import { matchesSearch, summarize, diffSnapshots, buildEmail } from '../_lib/watch.js'
import { getPushSubscription, unsubscribeFromPush } from '../_lib/push-store.js'

const SNAPSHOT_KEY = 'pagibig-watch:snapshot'

/** Sends the daily push regardless of whether anything changed — the point is a guaranteed 8am ping. */
async function sendDailyPush({ diff, matchCount, searchLabel }) {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    return { sent: false, reason: 'push not configured' }
  }

  const subscription = await getPushSubscription()
  if (!subscription) {
    return { sent: false, reason: 'no subscription' }
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const added = diff?.added.length ?? 0
  const removed = diff?.removed.length ?? 0
  const changeSummary = added || removed
    ? `${added ? `${added} new` : ''}${added && removed ? ', ' : ''}${removed ? `${removed} removed` : ''}`
    : 'No changes'
  const body = `${changeSummary} — ${matchCount} listings matching "${searchLabel}"`

  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title: 'Pag-IBIG daily watch', body, url: '/' }))
    return { sent: true }
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await unsubscribeFromPush()
    }
    console.error('Failed to send push notification', err)
    return { sent: false, reason: err.message }
  }
}

export default async function handler(req, res) {
  // Vercel Cron sends this header automatically when CRON_SECRET is set on the project.
  // Guards the endpoint from being triggered by anyone who finds the URL.
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const {
    WATCH_REGION,
    WATCH_PROVINCE,
    WATCH_CITY_MUNI,
    WATCH_SEARCH = 'SAN MARINO',
    NOTIFY_EMAIL,
    RESEND_API_KEY,
    RESEND_FROM_EMAIL = 'Pag-IBIG Watch <onboarding@resend.dev>',
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
  } = process.env

  const missing = ['WATCH_REGION', 'WATCH_PROVINCE', 'WATCH_CITY_MUNI', 'NOTIFY_EMAIL', 'RESEND_API_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'].filter(
    (key) => !process.env[key],
  )
  if (missing.length > 0) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` })
  }

  const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN })

  const { status, body } = await fetchPropertiesFromUpstream({
    region: WATCH_REGION,
    province: WATCH_PROVINCE,
    city_muni: WATCH_CITY_MUNI,
  })

  if (status !== 200) {
    return res.status(status).json(body)
  }

  const matching = (body.data ?? []).filter((raw) => matchesSearch(raw, WATCH_SEARCH))
  const current = Object.fromEntries(matching.map((raw) => [raw.ropa_id, summarize(raw)]))

  const previous = await redis.get(SNAPSHOT_KEY)
  const diff = diffSnapshots(previous, current)
  await redis.set(SNAPSHOT_KEY, current)

  const push = await sendDailyPush({ diff, matchCount: matching.length, searchLabel: WATCH_SEARCH })

  if (!diff) {
    return res.status(200).json({ status: 'baseline stored', count: matching.length, push })
  }

  if (diff.added.length === 0 && diff.removed.length === 0) {
    return res.status(200).json({ status: 'no changes', count: matching.length, push })
  }

  const resend = new Resend(RESEND_API_KEY)
  const { subject, html } = buildEmail({ searchLabel: WATCH_SEARCH, added: diff.added, removed: diff.removed })
  const sendResult = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject,
    html,
  })

  if (sendResult.error) {
    console.error('Failed to send watch email', sendResult.error)
    return res.status(502).json({ error: 'Failed to send email', detail: sendResult.error, push })
  }

  return res.status(200).json({ status: 'notified', added: diff.added.length, removed: diff.removed.length, push })
}
