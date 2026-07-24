# Pag-IBIG Acquired Assets Finder

A fast, searchable, filterable interface for Pag-IBIG's acquired assets (foreclosed property) listings — built with React 19, Vite, TypeScript, Tailwind v4, shadcn/ui, TanStack Query/Table, and ky.

## Why a proxy server

The Pag-IBIG API (`pagibigfundservices.com`) doesn't send CORS headers, so the browser can't call it directly. `server/index.js` is a small Express proxy that forwards three endpoints and is required for both dev and production:

- `GET /api/properties` → `Load_SearchListProperties_COPA` (property search; requires `region`, `province`, `city_muni`)
- `GET /api/locations` → `LoadLocations` (cascading region/province/city dropdowns)
- `POST /api/images` → `LoadImageUrl` (property photos)

## Running locally

```bash
npm install
npm run dev:all   # runs the Express proxy (3001) + Vite dev server (5173) together
```

Or run them separately:

```bash
npm run server    # Express proxy on :3001
npm run dev        # Vite dev server on :5173, proxies /api/* to :3001
```

Open http://localhost:5173. Search requires selecting Region → Province → City in the filters panel first (the upstream API errors without a city).

## Production

```bash
npm run build      # tsc + vite build → dist/
npm run server      # serve the proxy in production too, in front of (or alongside) dist/
```

Deploy `dist/` behind any static host, and run `server/index.js` as a small Node service the frontend's `/api/*` requests are routed to (e.g. via a reverse proxy or a platform rewrite rule).

## Notable implementation notes

- **Excel export** uses the HTML-table-as-workbook trick (`src/lib/export.ts`) instead of the `xlsx`/SheetJS package, which has unpatched high-severity advisories.
- **Auction type** (First Auction / Second Auction / Negotiated Sale) is derived client-side from `disposal_flag`, matching how the real site's tabs work — the search API itself always returns all three for a given city.
- Filters, search text, view mode, and the active auction tab are mirrored into the URL query string for shareable links.
- Favorites and saved searches persist to `localStorage`.
