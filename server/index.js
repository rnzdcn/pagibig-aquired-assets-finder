import express from 'express'
import cors from 'cors'

const UPSTREAM = 'https://www.pagibigfundservices.com/OnlinePublicAuction/ListofProperties'
const PORT = process.env.PORT ?? 3001
const USER_AGENT = 'Mozilla/5.0 (compatible; PagibigAssetsFinder/1.0)'

const app = express()
app.use(cors())
app.use(express.json())

// Pag-IBIG's location lookups rarely change; cache them briefly so we
// don't hammer the upstream service every time a dropdown opens.
const locationsCache = new Map()
const LOCATIONS_TTL_MS = 5 * 60 * 1000

app.get('/api/properties', async (req, res) => {
  const { region, province, city_muni: cityMuni } = req.query

  if (!region || !province || !cityMuni) {
    return res.status(400).json({ error: 'region, province, and city_muni are required' })
  }

  const params = new URLSearchParams({
    flag: '1',
    region: String(region),
    province: String(province),
    city_muni: String(cityMuni),
    prop_type: String(req.query.prop_type ?? ''),
    range_from: String(req.query.range_from ?? ''),
    range_to: String(req.query.range_to ?? ''),
    lot_from: String(req.query.lot_from ?? ''),
    lot_to: String(req.query.lot_to ?? ''),
    floor_from: String(req.query.floor_from ?? ''),
    floor_to: String(req.query.floor_to ?? ''),
    occupancy: String(req.query.occupancy ?? ''),
  })

  try {
    const upstreamRes = await fetch(
      `${UPSTREAM}/Load_SearchListProperties_COPA?${params.toString()}`,
      { headers: { 'User-Agent': USER_AGENT } },
    )

    if (!upstreamRes.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstreamRes.status}` })
    }

    const data = await upstreamRes.json()
    res.json(data)
  } catch (err) {
    console.error('Failed to fetch properties', err)
    res.status(502).json({ error: 'Failed to reach Pag-IBIG API' })
  }
})

app.get('/api/locations', async (req, res) => {
  const { grpid, regionid = '', provinceid = '', cityid = '', brgyid = '' } = req.query

  if (!grpid) {
    return res.status(400).json({ error: 'grpid is required' })
  }

  const cacheKey = `${grpid}:${regionid}:${provinceid}:${cityid}:${brgyid}`
  const cached = locationsCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data)
  }

  const params = new URLSearchParams({
    grpid: String(grpid),
    regionid: String(regionid),
    provinceid: String(provinceid),
    cityid: String(cityid),
    brgyid: String(brgyid),
  })

  try {
    const upstreamRes = await fetch(`${UPSTREAM}/LoadLocations?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!upstreamRes.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstreamRes.status}` })
    }

    const data = await upstreamRes.json()
    locationsCache.set(cacheKey, { data, expiresAt: Date.now() + LOCATIONS_TTL_MS })
    res.json(data)
  } catch (err) {
    console.error('Failed to fetch locations', err)
    res.status(502).json({ error: 'Failed to reach Pag-IBIG API' })
  }
})

app.post('/api/images', async (req, res) => {
  const { ropaId, carousel } = req.body ?? {}

  if (!ropaId) {
    return res.status(400).json({ error: 'ropaId is required' })
  }

  try {
    const upstreamRes = await fetch(`${UPSTREAM}/LoadImageUrl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({ flag: carousel ? 3 : 4, acct_id: ropaId }),
    })

    if (!upstreamRes.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstreamRes.status}` })
    }

    const paths = await upstreamRes.json()
    const urls = Array.isArray(paths)
      ? paths.map((path) => `https://aaonline.pagibigfund.gov.ph/OPABucket${path}`)
      : []
    res.json(urls)
  } catch (err) {
    console.error('Failed to fetch images', err)
    res.status(502).json({ error: 'Failed to reach Pag-IBIG API' })
  }
})

app.listen(PORT, () => {
  console.log(`Pag-IBIG API proxy listening on http://localhost:${PORT}`)
})
