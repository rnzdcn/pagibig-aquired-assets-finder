// Diff-and-notify logic for the scheduled listing watch (api/cron/watch.js).
// Kept separate from the cron handler so the matching/diff logic is unit-testable
// without spinning up a request.

/** Mirrors the substring search in src/pages/properties-page.tsx so the watched set matches what the UI shows. */
export function matchesSearch(raw, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return [raw.batch_no, raw.ropa_id, raw.prop_location, raw.city_muni, raw.prop_type]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(q))
}

export function summarize(raw) {
  return {
    batchNo: raw.batch_no,
    propertyType: raw.prop_type,
    location: raw.prop_location,
    cityMuni: raw.city_muni,
    minBid: Number.parseFloat(raw.min_sellprice) || 0,
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
    amount,
  )
}

function listItemHtml(id, item) {
  return `<li><strong>${item.propertyType}</strong> — ${item.location}, ${item.cityMuni}<br>Batch ${item.batchNo} · ROPA ${id} · Min bid ${formatCurrency(item.minBid)}</li>`
}

export function buildEmail({ searchLabel, added, removed }) {
  const sections = []
  if (added.length > 0) {
    sections.push(
      `<h3>New listings (${added.length})</h3><ul>${added.map(([id, item]) => listItemHtml(id, item)).join('')}</ul>`,
    )
  }
  if (removed.length > 0) {
    sections.push(
      `<h3>Removed listings (${removed.length})</h3><ul>${removed.map(([id, item]) => listItemHtml(id, item)).join('')}</ul>`,
    )
  }

  return {
    subject: `Pag-IBIG watch: ${added.length ? `${added.length} new` : ''}${added.length && removed.length ? ', ' : ''}${removed.length ? `${removed.length} removed` : ''} — ${searchLabel}`,
    html: `<p>Changes for saved search "<strong>${searchLabel}</strong>":</p>${sections.join('')}`,
  }
}

/** Compares the current listing snapshot against the last stored one. Returns null on first run (baseline only). */
export function diffSnapshots(previous, current) {
  if (!previous) return null

  const added = Object.entries(current).filter(([id]) => !(id in previous))
  const removed = Object.entries(previous).filter(([id]) => !(id in current))
  return { added, removed }
}
