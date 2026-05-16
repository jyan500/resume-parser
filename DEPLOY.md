# Deployment

Two-tier deploy:

- **Frontend** — Next.js app under `client/`, deployed to **Cloudflare Pages** via `@cloudflare/next-on-pages`.
- **Backend** — Flask app under `server/`, deployed to **Railway**.

Production frontend: `https://cvsquared.pages.dev`.

---

## Frontend (Cloudflare Pages)

### Build

| Setting          | Value                                     |
| ---------------- | ----------------------------------------- |
| Root directory   | `client`                                  |
| Build command    | `npm run pages:build`                     |
| Build output dir | `.vercel/output/static`                   |

`pages:build` runs `npx @cloudflare/next-on-pages` (see `client/package.json:10`).

### Environment variables (Pages → Settings → Environment variables)

| Variable                          | Purpose                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`             | Railway backend URL, e.g. `https://resume-parser-production-eed3.up.railway.app`                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`  | Cloudflare Turnstile site key. If unset, the frontend uses a `"dev-bypass"` token (dev only).    |
| `NEXT_PUBLIC_SITE_URL`            | Canonical apex (non-www) site origin, no trailing `/`. Drives `metadataBase`, `<link rel="canonical">`, `sitemap.xml`, and `robots.txt`. |

`NEXT_PUBLIC_*` are **inlined at build time**, so changing them requires a fresh Pages build — restarting the deploy is not enough.

### Static headers

`client/public/_headers` sets the CSP. The `connect-src` and `frame-src` directives must include:

- `https://challenges.cloudflare.com` (Turnstile)
- The Railway backend origin

If the Railway URL changes, update `connect-src` in `_headers`.

---

## URL canonicalization

The canonical URL is the **apex (non-www)** form of `NEXT_PUBLIC_SITE_URL`. Each
indexable page emits a `<link rel="canonical">` resolved against `metadataBase`
(`client/app/layout.tsx`), and `sitemap.ts` / `robots.ts` build their URLs from the same
env var. `NEXT_PUBLIC_*` vars are inlined at build time, so changing the site URL
requires a fresh Pages build.

On the `*.pages.dev` domain there is nothing to redirect — `www.cvsquared.pages.dev` is
not routed to the Pages project, so the canonical tags alone are the fix.

When moving to a custom domain:

1. Set `NEXT_PUBLIC_SITE_URL` to the apex custom domain (e.g. `https://cvsquared.com`)
   and trigger a fresh Pages build.
2. Add **both** `cvsquared.com` and `www.cvsquared.com` as custom domains on the Pages
   project so requests to either host reach the project.
3. Add a `client/public/_redirects` file to 301 www → apex:

   ```
   https://www.cvsquared.com/* https://cvsquared.com/:splat 301!
   ```

   (No `_redirects` file exists today — on `pages.dev` it would be inert.)

---

## Backend (Railway)

### Environment variables

| Variable                | Purpose                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `ALLOWED_ORIGINS`       | Comma-separated frontend origins for CORS. **Must include the current Pages URL** (no trailing `/`). |
| `TURNSTILE_SECRET_KEY`  | Paired with the frontend site key. If unset, Turnstile verification is bypassed (dev only).          |
| `SECRET_KEY`            | Flask session secret.                                                                                |
| `GEMINI_API_KEY`        | Gemini LLM key (primary tailoring path).                                                             |
| `OPENROUTER_API_KEY`    | OpenRouter key (fallback).                                                                           |
| `OPENROUTER_BASE_URL`   | e.g. `https://openrouter.ai/api/v1`.                                                                 |
| `OPENAI_API_KEY`        | Used by the OpenAI-compatible client path in `utils/client.py`.                                      |
| `PORT`                  | Set by Railway automatically.                                                                        |

`ALLOWED_ORIGINS` defaults to `http://localhost:3000` when unset (see `server/app.py:28`).

---

## Turnstile configuration

In the Cloudflare dashboard → **Turnstile** → site key:

- **Domains** must list every host the frontend is served from, e.g.:
  - `cvsquared.pages.dev`
  - any custom domain
  - `localhost` (for local dev)

A hostname mismatch causes a **400 from `challenges.cloudflare.com/cdn-cgi/challenge-platform/...`**. Because `client/app/_lib/api/baseQuery.ts` blocks each request until Turnstile mints a token, a 400 makes uploads **hang silently** — the request never leaves the browser and the backend logs show nothing.

---

## Checklist: changing the deploy URL

1. Add the new host to **Turnstile → Domains**.
2. Add the new origin to Railway **`ALLOWED_ORIGINS`**.
3. Update `NEXT_PUBLIC_SITE_URL` on Pages to the new canonical apex origin (see
   [URL canonicalization](#url-canonicalization)).
4. If the backend URL also changed:
   - Update `NEXT_PUBLIC_API_URL` on Pages.
   - Update the `connect-src` entry in `client/public/_headers`.
5. Trigger a fresh Pages build (env-var change alone won't rebuild the bundle).

---

## Troubleshooting

| Symptom                                                                                          | Likely cause                                                                  |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Upload hangs, backend logs show nothing, console: `challenges.cloudflare.com … 400` and `'about:blank' … sandboxed` warnings | Turnstile domain mismatch — current host not in the site key's allowed Domains. |
| Upload reaches backend, then fails with a CORS error                                             | Current frontend origin missing from `ALLOWED_ORIGINS` on Railway.            |
| Updated a `NEXT_PUBLIC_*` env var on Pages but the new value isn't taking effect                 | Inlined at build time — must redeploy, not just restart.                      |
| Backend rejects every request with a Turnstile failure                                           | `TURNSTILE_SECRET_KEY` on Railway doesn't match the site key used by the frontend. |
