import { Redis } from '@upstash/redis'

const KEY = 'pagibig-watch:push-subscription'

function client() {
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
}

export async function getPushSubscription() {
  return client().get(KEY)
}

export async function subscribeToPush(subscription) {
  if (!subscription?.endpoint) {
    return { status: 400, body: { error: 'Invalid subscription' } }
  }
  await client().set(KEY, subscription)
  return { status: 200, body: { status: 'subscribed' } }
}

export async function unsubscribeFromPush() {
  await client().del(KEY)
  return { status: 200, body: { status: 'unsubscribed' } }
}
