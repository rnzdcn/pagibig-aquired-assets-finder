import { subscribeToPush, unsubscribeFromPush } from './_lib/push-store.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { status, body } = await subscribeToPush(req.body)
    return res.status(status).json(body)
  }

  if (req.method === 'DELETE') {
    const { status, body } = await unsubscribeFromPush()
    return res.status(status).json(body)
  }

  res.setHeader('Allow', 'POST, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
