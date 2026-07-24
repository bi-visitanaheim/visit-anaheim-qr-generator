# Visit Anaheim QR Generator

Internal tool for generating branded vCard QR codes for Canva business cards. Single-contact and bulk (staff roster / CSV) modes, with export options for size, color, and logo overlay.

The page is fully self-contained — the QR library is vendored inline, so it has no external network dependencies at runtime. There's no backend or database: everything happens client-side in the browser, and nothing entered into the form is transmitted anywhere.

## What it does

The tool generates QR codes that encode a **vCard directly** — the contact's name, title, phone, email, organization, and website are embedded in the code itself. Scanning it saves the contact straight to a phone's address book; there's no URL, redirect, or lookup involved, so the codes keep working even if this site ever goes offline.

### Single mode

For generating one QR at a time:

- Enter contact details — first name and last name are required, along with title, phone, email, organization, and website as optional fields
- Choose output size (256, 512, or 1024 px)
- Choose QR color: **Brand teal** (#77C7C9), **Print-safe teal** (#01696F — used for previously printed cards, better contrast at small sizes), or a custom color
- Optionally embed the Visit Anaheim logo in the center of the code (or upload a different image). High error correction (30% recovery) is used automatically so the code stays scannable with a logo overlaid
- Live preview of the QR and the contact details before exporting
- Export as a PNG, copy the raw vCard text, or download the vCard as a `.txt` file

### Bulk mode

For generating QR codes for many staff members at once:

- Upload a CSV with `firstname`, `lastname`, `title`, `phone`, `email` columns (header names are matched flexibly, so slight variations in naming still work)
- Or skip the CSV entirely and click **Load Visit Anaheim staff roster** to pull in the current staff list (69 people) directly
- A column-mapping preview shows how uploaded CSV headers were matched to expected fields
- Same export settings as single mode (size, color, logo), plus a per-row `colorhex` column override if a CSV needs different colors for different rows
- A validation table shows row-by-row status before generating — total rows, valid rows, and invalid/skipped rows with notes explaining why
- Generates QR codes only for valid rows
- Bulk export options: download all QR PNGs as a ZIP, download PNGs + vCard files together as a ZIP, or download a CSV summary of the export (name, contact fields, filename, and generated/failed status per row)

### Canva workflow

Both modes are built around a specific print workflow: download the QR as a PNG and place it into a Canva business card layout as an image — QR codes should not be regenerated inside Canva's own QR tool, since that would encode a different (and likely wrong) payload. Recommended final print size is about 1.25–1.5 inches square, kept dark-on-white for reliable scanning.

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
