# Google Ads Offline Conversion CSV Checker

A browser-local preflight checker for Google Ads offline conversion CSV files.

The MVP lets PPC operators, agencies, and local service advertisers choose a CSV file in the browser and detect common upload risks before importing offline conversions into Google Ads.

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

Static CSV files are available in `public/samples` for download:

- `valid-click-id-offline-conversions.csv`
- `invalid-enhanced-conversions-sample.csv`

The homepage also generates fresh relative-date sample data at runtime so the interactive demo does not become stale months later.

## Important implementation notes

- The issue table displays the first 500 matching issues for browser performance; the downloaded CSV report includes all detected issues.
- Report CSV cells are escaped to reduce formula injection risk when opened in spreadsheet apps.
- A lightweight checking state appears while the browser parses and validates a CSV.
- Issue filtering supports severity, field, and free-text search.

## Tech stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Papa Parse
- Luxon
- Vercel Analytics
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
npm run build
```

## MVP scope

Included: CSV upload, local parsing, field auto-detection, rule-based validation, results summary, issue table, report download, static sample files, FAQ, SEO guide page, and anonymous usage events.

Not included in v1: Google Ads API, OAuth login, user accounts, server-side CSV storage, CRM sync, Google Sheets sync, complex spreadsheet editing, or automatic hash/export fix workflow.
