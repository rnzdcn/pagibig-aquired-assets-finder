import { fetchLocationsFromUpstream } from './_lib/pagibig.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { status, body } = await fetchLocationsFromUpstream(req.query)
  res.status(status).json(body)
}
