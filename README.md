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

## Important implementation notes

- The homepage sample buttons generate fresh relative dates at runtime so the demo does not become stale months later.
- The issue table displays the first 500 matching issues for browser performance; the downloaded CSV report includes all detected issues.
- Report CSV cells are escaped to reduce formula injection risk when opened in spreadsheet apps.

## Tech stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Papa Parse
- Luxon
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

Included: CSV upload, local parsing, field auto-detection, rule-based validation, results summary, issue table, report download, FAQ, and SEO guide page.

Not included in v1: Google Ads API, OAuth login, user accounts, server-side CSV storage, CRM sync, Google Sheets sync, complex spreadsheet editing, or automatic hash/export fix workflow.
