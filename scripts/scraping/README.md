# Institution data scraper

Collects faculty/school/programme data and brand colors for South African
institutions that `config/institutions.seed.ts` lists as Tier 2 ("schema
present, not yet populated") but has no `seed-*.mts` script for: University
of Johannesburg (`uj`), University of South Africa (`unisa`), Cape
Peninsula University of Technology (`cput`).

## Output is local JSON only — nothing touches Firestore

This script writes to `output/<institution-id>.json` and nothing else. It
never imports `firebase-admin`, never reads `.env*`, never calls any
`npm run seed:*` script. A human reviews the JSON before any of it becomes
a real Firestore write — see "Why no `verifiedOn`" below for the reason
that matters, not just a process nicety.

## Why no `verifiedOn` or `academicYear` on any record

`lib/firestore/types.ts`'s `isFactVerified()` is the one gate every public
page in this app checks before rendering a fact — it requires `sourceUrl`,
`verifiedOn`, AND `academicYear` all present. `verifiedOn` specifically
means "a human confirmed this is current and correct," which scraping
cannot do. Every record this script produces carries a real `sourceUrl`
(the exact page it came from) but **never** a `verifiedOn` — so if this
JSON is ever imported into Firestore as-is, `isFactVerified()` correctly
returns false and it won't render as fact to a real learner. That's not a
missing feature to add later; it's the actual safety mechanism. Don't add
a fabricated `verifiedOn` date anywhere in this pipeline.

## Usage

```bash
pip install -r requirements.txt
python scrape.py unisa    # or cput, or uj
```

`uj` will exit immediately with an explanation: uj.ac.za is behind a
Cloudflare managed challenge (confirmed via both `/robots.txt` and `/` —
both return HTTP 403 "Just a moment..."). This script does not attempt to
solve or bypass that challenge; doing so is out of scope by design, not an
oversight. If UJ data is wanted, it needs a different acquisition path
(e.g. an official data-sharing arrangement with the institution) — not a
harder scraper.

## What's genuinely in each institution's output, and what's missing and why

See `REPORT.md` in this directory for the full per-institution breakdown —
counts, exact gaps, and why each gap exists (JS-rendered content, PDF-only
prospectus, robots.txt restriction, etc.). Read that before treating either
JSON file as more complete than it is.

## Respecting the sites being scraped

- `robots_check.py` checks the target host's `/robots.txt` before any
  fetch and skips (doesn't fetch) any disallowed path. Absence of a
  robots.txt (UNISA returns 404 for it) is treated as "no restriction
  declared," the standard interpretation.
- Every request sends an honest, bot-identifying User-Agent
  (`UCAG-DataCollector/1.0`) — never a spoofed browser UA.
- At least 1.5s between requests to the same host (`RATE_LIMIT_SECONDS` in
  `scrape.py`), single-threaded, no concurrency.
- Public pages only. No login, no CAPTCHA/challenge solving.
