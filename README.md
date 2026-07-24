# Pag-IBIG Acquired Assets Finder

A fast, searchable, filterable interface for Pag-IBIG's acquired assets (foreclosed property) listings — built with React 19, Vite, TypeScript, Tailwind v4, shadcn/ui, TanStack Query/Table, and ky.

## Why a proxy

The Pag-IBIG API (`pagibigfundservices.com`) doesn't send CORS headers, so the browser can't call it directly. Something server-side has to sit in front of it and forward three endpoints:

- `GET /api/properties` → `Load_SearchListProperties_COPA` (property search; requires `region`, `province`, `city_muni`)
- `GET /api/locations` → `LoadLocations` (cascading region/province/city dropdowns)
- `POST /api/images` → `LoadImageUrl` (property photos)

The actual upstream-fetching logic lives once, in `api/_lib/pagibig.js`, and is consumed by two different runtimes so it never drifts out of sync:

- **`server/index.js`** — a small Express server for local development (`npm run dev:all`).
- **`api/properties.js`, `api/locations.js`, `api/images.js`** — Vercel serverless functions with the same behavior, used in production.

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

To test against the real Vercel serverless functions locally (closer to production than `dev:all`):

```bash
npm run vercel-dev   # runs `vercel dev`, serving Vite + api/*.js together on one port
```

## Deploying to Vercel

This repo is zero-config for Vercel: push it to a Git provider and import it in the Vercel dashboard, or deploy straight from the CLI:

```bash
npm run deploy        # npx vercel deploy --prod
```

Vercel auto-detects the Vite framework preset (build: `vite build`, output: `dist/`) and turns each file in `api/` into its own serverless function — `server/index.js` isn't used in production at all and can be ignored by the deploy. `vercel.json` adds one SPA fallback rewrite so client-side routes resolve to `index.html` (everything except `/api/*`).

No environment variables or secrets are required — the proxy talks to Pag-IBIG's public endpoints directly.

## Notable implementation notes

- **Excel export** uses the HTML-table-as-workbook trick (`src/lib/export.ts`) instead of the `xlsx`/SheetJS package, which has unpatched high-severity advisories.
- **The `vercel` CLI is intentionally not a devDependency** — its bundled per-framework builders drag in a long transitive vulnerability list (including a critical `tar` advisory). `npm run vercel-dev` / `npm run deploy` shell out via `npx`, which gets the same result without pinning it into `package-lock.json`.
- **Auction type** (First Auction / Second Auction / Negotiated Sale) is derived client-side from `disposal_flag`, matching how the real site's tabs work — the search API itself always returns all three for a given city.
- Filters, search text, view mode, and the active auction tab are mirrored into the URL query string for shareable links.
- Favorites and saved searches persist to `localStorage`.
