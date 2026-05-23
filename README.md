# Google Ads Offline Conversion CSV Checker

A browser-local preflight checker for Google Ads offline conversion CSV files.

The tool helps PPC operators, agencies, and local service advertisers choose a CSV file in the browser and detect common upload risks before importing offline conversions into Google Ads.

## Production domain / site URL

Set `NEXT_PUBLIC_SITE_URL` to your production domain, e.g., https://ads-csv.ymirtool.com. All canonical, sitemap, and robots URLs are unified to this host.

## Live app pages

- `/` - CSV checker
- `/faq` - FAQ and product boundary
- `/about` - project scope and privacy-first positioning
- `/privacy` - privacy policy
- `/terms` - terms of use
- `/contact` - feedback and bug report guidance
- `/guide` - guide index
- `/guide/google-ads-offline-conversion-upload-errors` - upload error guide
- `/guide/offline-conversion-csv-template-checklist` - CSV template checklist
- `/guide/enhanced-conversions-for-leads-csv-errors` - enhanced conversions CSV guide

## What it checks

- Empty files, missing headers, empty headers, duplicate headers
- Row length mismatch caused by broken commas or quotes
- Missing `Conversion Name`
- Missing `Conversion Time`
- Missing click ID or user-provided identifier data
- Invalid, future, old, date-only, or timezone-less conversion times
- Empty or suspicious GCLID / GBRAID / WBRAID rows
- Plain-text email and phone signals for Enhanced Conversions for Leads
- Invalid SHA-256 hash-like values
- Invalid conversion value and currency format
- Duplicate conversion and duplicate Order ID risks

## Privacy boundary

CSV files are processed locally in the browser. The app does not upload CSV files to a server, does not require Google Ads login, and does not store row data.

This tool checks CSV-level issues only. It cannot verify Google Ads account-level settings, conversion action ownership, click ownership, MCC permissions, or final attribution.

## Anonymous analytics

Vercel Analytics is used for high-level product events only. Events use buckets and status labels, not CSV row content, file names, raw values, email addresses, phone numbers, click IDs, or conversion data.

Tracked events include:

- `file_selected`
- `sample_loaded`
- `sample_downloaded`
- `check_completed`
- `report_downloaded`

## Sample files

Static CSV files are available in `public/samples` for direct download:

- `valid-click-id-offline-conversions.csv`
- `invalid-enhanced-conversions-sample.csv`

The homepage also generates fresh relative-date sample data at runtime so the interactive demo and downloadable fresh samples do not become stale months later.

## Architecture notes

- CSV parsing uses Papa Parse.
- Validation rules are split under `src/lib/validation/`:
  - `fieldDetection.ts`
  - `structureRules.ts`
  - `requiredFieldRules.ts`
  - `timeRules.ts`
  - `identifierRules.ts`
  - `userDataRules.ts`
  - `valueRules.ts`
  - `duplicateRules.ts`
  - `rowRules.ts`
  - `helpers.ts`
  - `constants.ts`
- `src/lib/validation.ts` remains the public validation entry point.
- Uploaded CSV checks use a browser Web Worker when possible, with a main-thread fallback.
- The issue table displays the first 500 matching issues for browser performance; the downloaded CSV report includes all detected issues.
- Report CSV cells are escaped to reduce formula injection risk when opened in spreadsheet apps.
- Issue filtering supports severity, field, and free-text search.

## Testing and CI

Vitest covers CSV parsing, report escaping, field detection, and core validation rules.

```bash
npm run typecheck
npm run test
npm run build
```

GitHub Actions runs install, typecheck, tests, and build on pushes and pull requests to `main`.

## Tech stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Papa Parse
- Luxon
- Vercel Analytics
- Vitest
- Vercel-ready frontend app

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run typecheck
npm run test
npm run build
```

## MVP scope

Included: CSV upload, local parsing, field auto-detection, split rule-based validation, results summary, issue table, report download, static and dynamic sample files, Web Worker validation, FAQ, trust pages, SEO guide pages, sitemap, anonymous usage events, and CI tests.

Not included in v1: Google Ads API, OAuth login, user accounts, server-side CSV storage, CRM sync, Google Sheets sync, complex spreadsheet editing, or automatic hash/export fix workflow.

<!-- deployment retry: 2026-05-23 FAQ and guide structured data -->