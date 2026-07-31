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

No environment variables or secrets are required for the core app — the proxy talks to Pag-IBIG's public endpoints directly. The listing watch (below) does need a few.

## Daily alerts for new/removed listings

`api/cron/watch.js` runs once a day on Vercel Cron (`vercel.json`, 8am PHT — once daily is the max frequency on the free Hobby plan), re-runs one saved search server-side, and:

- **Sends a push notification every run**, regardless of whether anything changed — a guaranteed daily ping, delivered via a service worker (`public/sw.js`) so it arrives even with the browser/app fully closed on desktop or Android. iOS Safari needs the site added to the Home Screen first; a plain Safari tab can't receive push at all.
- **Sends an email only when the search results actually changed** (a listing appeared or disappeared), so the inbox doesn't get a message every single day.

Setup:

1. Create a free [Upstash Redis](https://upstash.com) database (remembers the last-seen listings and your push subscription between runs) and a free [Resend](https://resend.com) account (sends the change email — 100/day, 3,000/month on the free tier).
2. Copy `.env.example` to `.env` and fill in the values, or set the same keys directly as Environment Variables in the Vercel project dashboard (Settings → Environment Variables). `WATCH_REGION`/`WATCH_PROVINCE`/`WATCH_CITY_MUNI`/`WATCH_SEARCH` define which saved search gets watched; they default to Dasmariñas, Cavite filtered to "SAN MARINO", matching the app's default filters.
3. Generate a push keypair with `npx web-push generate-vapid-keys` and set `VITE_VAPID_PUBLIC_KEY` (also readable by the client bundle) + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` (a `mailto:` address).
4. Deploy, open the app, and click the **"Daily alert"** button once to grant notification permission and register the push subscription — there's no way to push to a browser that's never subscribed.
5. The first cron run after that just stores a baseline (no email, but the push still fires); every run after emails `NOTIFY_EMAIL` only when the watched search's results actually changed.
6. Optional: set `CRON_SECRET` too — Vercel attaches it as a bearer token on cron-triggered requests, so the endpoint rejects anyone else who finds the URL.

To trigger it manually instead of waiting for the daily schedule: run `npm run vercel-dev` (reads `.env` automatically), then in another terminal `npm run watch:test`. Leave `CRON_SECRET` unset in `.env` for local testing, since the manual curl doesn't send that header.

## Notable implementation notes

- **Excel export** uses the HTML-table-as-workbook trick (`src/lib/export.ts`) instead of the `xlsx`/SheetJS package, which has unpatched high-severity advisories.
- **The `vercel` CLI is intentionally not a devDependency** — its bundled per-framework builders drag in a long transitive vulnerability list (including a critical `tar` advisory). `npm run vercel-dev` / `npm run deploy` shell out via `npx`, which gets the same result without pinning it into `package-lock.json`.
- **Auction type** (First Auction / Second Auction / Negotiated Sale) is derived client-side from `disposal_flag`, matching how the real site's tabs work — the search API itself always returns all three for a given city.
- Filters, search text, view mode, and the active auction tab are mirrored into the URL query string for shareable links.
- Favorites and saved searches persist to `localStorage`.
