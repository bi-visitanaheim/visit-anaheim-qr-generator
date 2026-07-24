# Visit Anaheim QR Generator

Internal tool for generating branded vCard QR codes for Canva business cards. Single-contact and bulk (staff roster / CSV) modes, with export options for size, color, and logo overlay.

The page is fully self-contained — the QR library is vendored inline, so it has no external network dependencies at runtime.

## Access

This tool is gated behind HTTP Basic Auth so it isn't publicly browsable. Visiting the site will prompt for a username and password before showing the page.

Username and password: [password](https://visitanaheimorg.sharepoint.com/:t:/s/BusinessIntelligence-Apps/IQBeHSbulUIXTIs1ssrw8joaATNfG2IDBEGPi3dufTz-Xcw?e=Y7ebwj) (only Visit Anaheim staff have access to view this document).

Credentials are configured as environment variables in the Vercel project (Settings → Environment Variables): `GATE_USER` and `GATE_PASSWORD`.

**Important:** environment variable changes only apply to deployments made *after* they're saved. After adding or changing either variable, trigger a new deployment (push a commit, or use Deployments → **⋯** → Redeploy) — otherwise the live site keeps running on the old build.

## How the gate works

```
request → vercel.json rewrites "/" → api/gate.js
                                        ├─ no/invalid credentials → 401 + Basic Auth prompt
                                        └─ valid credentials     → reads api/page.html and serves it
```

- `vercel.json` routes all requests to `/` through the `api/gate.js` serverless function instead of serving a static file directly.
- `api/gate.js` checks the request's `Authorization` header against `GATE_USER` / `GATE_PASSWORD`. On success, it reads `api/page.html` from disk and returns it as the response body.
- `api/page.html` holds the actual tool — the file that used to be `index.html` at the repo root.

There is intentionally no static `index.html` in the repo. If one is ever re-added at the root, Vercel will serve it directly and bypass the gate entirely, since static files take priority over rewrites.

## Repo structure

```
├── api/
│   ├── gate.js       # Basic Auth check + serves page.html on success
│   └── page.html     # The actual QR generator tool
└── vercel.json        # Routes "/" through the gate function
```

## Updating the tool itself

Edit `api/page.html` directly and commit — that file *is* the site. No build step is required; Vercel serves it as-is once it passes the auth check.

## Deployment

Hosted on Vercel, connected to this repo's `main` branch. Framework preset: **Other** (static content + one serverless function, no build step).
