// Shared upstream-fetching logic, consumed by both the local Express dev
// server (server/index.js) and the Vercel serverless functions in api/*.js —
// keeping a single source of truth for how we talk to the Pag-IBIG API.

export const UPSTREAM = 'https://www.pagibigfundservices.com/OnlinePublicAuction/ListofProperties'
export const USER_AGENT = 'Mozilla/5.0 (compatible; PagibigAssetsFinder/1.0)'

// Pag-IBIG's location lookups rarely change; cache them briefly so we don't
// hammer the upstream service every time a dropdown opens. Best-effort only —
// serverless cold starts get a fresh, empty cache.
const locationsCache = new Map()
const LOCATIONS_TTL_MS = 5 * 60 * 1000

export async function fetchPropertiesFromUpstream(query) {
  const { region, province, city_muni: cityMuni } = query

  if (!region || !province || !cityMuni) {
    return { status: 400, body: { error: 'region, province, and city_muni are required' } }
  }

  const params = new URLSearchParams({
    flag: '1',
    region: String(region),
    province: String(province),
    city_muni: String(cityMuni),
    prop_type: String(query.prop_type ?? ''),
    range_from: String(query.range_from ?? ''),
    range_to: String(query.range_to ?? ''),
    lot_from: String(query.lot_from ?? ''),
    lot_to: String(query.lot_to ?? ''),
    floor_from: String(query.floor_from ?? ''),
    floor_to: String(query.floor_to ?? ''),
    occupancy: String(query.occupancy ?? ''),
  })

  try {
    const upstreamRes = await fetch(`${UPSTREAM}/Load_SearchListProperties_COPA?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!upstreamRes.ok) {
      return { status: 502, body: { error: `Upstream returned ${upstreamRes.status}` } }
    }

    return { status: 200, body: await upstreamRes.json() }
  } catch (err) {
    console.error('Failed to fetch properties', err)
    return { status: 502, body: { error: 'Failed to reach Pag-IBIG API' } }
  }
}

export async function fetchLocationsFromUpstream(query) {
  const { grpid, regionid = '', provinceid = '', cityid = '', brgyid = '' } = query

  if (!grpid) {
    return { status: 400, body: { error: 'grpid is required' } }
  }

  const cacheKey = `${grpid}:${regionid}:${provinceid}:${cityid}:${brgyid}`
  const cached = locationsCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return { status: 200, body: cached.data }
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
      return { status: 502, body: { error: `Upstream returned ${upstreamRes.status}` } }
    }

    const data = await upstreamRes.json()
    locationsCache.set(cacheKey, { data, expiresAt: Date.now() + LOCATIONS_TTL_MS })
    return { status: 200, body: data }
  } catch (err) {
    console.error('Failed to fetch locations', err)
    return { status: 502, body: { error: 'Failed to reach Pag-IBIG API' } }
  }
}

export async function fetchImagesFromUpstream(body) {
  const { ropaId, carousel } = body ?? {}

  if (!ropaId) {
    return { status: 400, body: { error: 'ropaId is required' } }
  }

  try {
    const upstreamRes = await fetch(`${UPSTREAM}/LoadImageUrl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({ flag: carousel ? 3 : 4, acct_id: ropaId }),
    })

    if (!upstreamRes.ok) {
      return { status: 502, body: { error: `Upstream returned ${upstreamRes.status}` } }
    }

    const paths = await upstreamRes.json()
    const urls = Array.isArray(paths)
      ? paths.map((path) => `https://aaonline.pagibigfund.gov.ph/OPABucket${path}`)
      : []
    return { status: 200, body: urls }
  } catch (err) {
    console.error('Failed to fetch images', err)
    return { status: 502, body: { error: 'Failed to reach Pag-IBIG API' } }
  }
}
