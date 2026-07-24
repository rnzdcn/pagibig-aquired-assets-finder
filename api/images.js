import { fetchImagesFromUpstream } from './_lib/pagibig.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { status, body } = await fetchImagesFromUpstream(req.body)
  res.status(status).json(body)
}
