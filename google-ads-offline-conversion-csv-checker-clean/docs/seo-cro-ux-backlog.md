# SEO / CRO / UX / Technical Backlog

## A. Page diagnostic summary

The MVP already has a clear utility premise: a browser-local checker for Google Ads offline conversion CSV files. The main risks are not product-market mismatch but execution depth: search engines need crawlable explanatory content, users need clearer pre-upload decision guidance after validation, and analytics need a minimal funnel that separates file selection, sample usage, check completion, issue severity, and report export. The page should avoid promising that Google Ads will accept a file, because account settings, conversion action ownership, click ownership, customer data terms, and attribution eligibility are outside this local checker.

Key blockers:

1. Results interpretation must be explicit enough for non-technical advertisers to decide whether to preview, fix, or discard a CSV.
2. Long-tail guide pages need structured data, internal links, and unique answers to avoid thin-page risk.
3. The upload flow must remain mobile-friendly, accessible, and clearly local/private.
4. Measurement must capture the full funnel without logging filenames, row values, emails, phone numbers, click IDs, or CSV content.
5. Production verification must use source HTML checks for title, canonical, JSON-LD, and server-rendered text.

Assumptions:

- Primary persona: PPC operators, local service marketers, agencies, and small teams preparing offline conversion uploads.
- Primary KPI: organic traffic, checker usage, completed checks, report downloads, and return visits.
- Monetization: free tool with AdSense-compatible layout, without deceptive ad placement.
- Tech stack: Next.js App Router, TypeScript, Tailwind, Papa Parse, Luxon, Vercel Analytics, Vercel deployment.
- Current compliance boundary: no Google Ads API, no OAuth, no server-side CSV storage.

## B. Priority execution checklist

| Priority | Task | Problem | Concrete change | Size | Expected impact | Dependency | Risk / review point | Acceptance criteria |
|---|---|---|---|---:|---|---|---|---|
| P0 | Keep homepage server-rendered SEO content | A pure interactive tool can look thin to crawlers | Keep static guide blocks under the checker: checks, supported columns, result reading, limits, FAQ preview | M | SEO / UX | Existing homepage | Avoid duplicate FAQ wording across pages | View-source contains H1, CTA, static H2 blocks |
| P0 | Add local privacy and scope copy above upload | Users may fear uploading customer data | State that CSV parsing happens locally; no row-level data is stored | XS | UX / trust | None | Must not imply Google certification | Privacy copy visible above upload |
| P0 | Add result decision guidance | Users see issues but may not know what to do next | Add a result interpretation panel that explains critical/warning/info and next step | S | UX / conversion | Validation result | Avoid guarantee of acceptance | After a check, page displays clear next action |
| P0 | Add report download explanation | Export CTA needs a working-context value proposition | Add copy explaining row number, field, current value, and suggested fix | XS | UX / repeat use | Export report | CSV may be opened in spreadsheets; keep formula-escaping | Report panel states what export contains |
| P0 | Add canonical per index and guide page | Subpages should self-canonicalize | Use Next metadata alternates canonical | XS | SEO | siteUrl config | Relative canonical must resolve correctly | View-source shows correct canonical |
| P0 | Add JSON-LD to homepage | Tool pages need machine-readable context | Add WebApplication, FAQPage, BreadcrumbList, WebPage | S | SEO | JsonLd component | Schema does not guarantee rich results | View-source contains application/ld+json |
| P0 | Add JSON-LD to FAQ page | FAQ page should be machine-readable | Add FAQPage, BreadcrumbList, WebPage | S | SEO | JsonLd component | FAQ rich results are not guaranteed | View-source /faq contains FAQPage |
| P0 | Add JSON-LD to guide index | Guide index should expose the content hub | Add CollectionPage, ItemList, BreadcrumbList | S | SEO / internal links | JsonLd component | Keep guide list in sync with sitemap | View-source /guide contains ItemList |
| P0 | Add JSON-LD to guide details | Articles should identify topic and breadcrumbs | Add Article and BreadcrumbList on each guide | S | SEO | JsonLd component | Do not overstate author expertise or freshness | Each guide source contains Article |
| P1 | Improve internal links | Crawler and user paths are shallow | Add contextual links from homepage to guide pages and guide pages to checker | S | SEO / UX | Pages exist | Anchor text should be natural | Each key page links to 2+ relevant pages |
| P1 | Add FAQ and template content depth | Short pages risk thin content | Add practical questions, examples, and scope caveats | M | SEO / trust | Existing pages | Avoid copied Google Ads documentation | FAQ has unique checker-specific answers |
| P1 | Improve accessibility labels | File input and filters need clear accessible names | Add `htmlFor`, `aria-label`, `sr-only` headings, semantic sections | S | UX / accessibility | Current components | Must not hide essential visible labels | Keyboard and screen-reader flow is clear |
| P1 | Add analytics funnel events | Product decisions need data | Track file_selected, sample_loaded, check_completed, report_downloaded, parse_failed, result_filter_changed | S | CRO / UX | Vercel Analytics | No PII, filenames, raw values, row content | Events use buckets and status only |
| P1 | Add Search Console weekly checklist | SEO needs operating process | Document weekly query/page/index checks | XS | SEO / growth | GSC access | Manual process must be lightweight | Monitoring doc exists |
| P1 | Add issue templates | Backlog should become engineering tasks | Add Jira, Notion, Markdown templates | XS | execution | None | Avoid bloated templates | Templates included in docs |
| P2 | Add changelog / validation version page | Returning users need confidence in freshness | Publish validation changelog linked from footer or guide | M | SEO / return visits | Rule versioning | Must maintain with releases | Changelog URL in sitemap |
| P2 | Add downloadable CSV template page | Template-intent search can convert strongly | Add template page with sample columns and safe download | M | SEO / usage | Sample files | Avoid implying official Google template | Page explains unofficial template boundary |
| P2 | A/B test upload CTA | CTA wording may affect checker starts | Compare privacy-first vs error-prevention CTA copy | S | CRO | Analytics | Sample size may be low | Event lift measured without layout tricks |
| P2 | Add comparison page | Searchers compare local checker vs Google Ads preview | Explain local preflight vs Google Ads preview/import | M | SEO / trust | Existing guide content | Must not discourage official preview | Comparison page has clear scope table |

## C. Concrete copy changes

Recommended title:

`Free Google Ads Offline Conversion CSV Checker | Local Upload Error Preflight`

Recommended meta description:

`Check Google Ads offline conversion CSV files locally before upload. Find missing headers, invalid conversion times, old GCLIDs, unhashed user data, duplicate rows, value and currency issues, and download a fix report.`

Recommended H1:

`Google Ads Offline Conversion CSV Checker`

Recommended hero subtitle:

`Upload a CSV locally in your browser to catch common Google Ads offline conversion import risks before you preview or apply the file: missing headers, invalid conversion times, old click IDs, unhashed user data, duplicate rows, and value or currency formatting issues.`

Internal links:

1. Homepage `What it checks` section -> `/guide/google-ads-offline-conversion-upload-errors` with anchor `Google Ads offline conversion upload error guide`.
2. Homepage `Supported columns` section -> `/guide/offline-conversion-csv-template-checklist` with anchor `offline conversion CSV template checklist`.
3. Homepage FAQ preview -> `/faq` with anchor `Read full FAQ`.
4. Guide index card -> `/guide/enhanced-conversions-for-leads-csv-errors` with anchor `Enhanced conversions CSV errors`.
5. Upload error guide CTA -> `/` with anchor `Open the checker`.
6. Checklist guide CTA -> `/` with anchor `Check a CSV`.
7. Enhanced conversions guide CTA -> `/` with anchor `Open the checker`.
8. Footer -> `/privacy`, `/terms`, `/contact`, `/guide`, `/faq`.

CTA variants:

- `Check CSV File Locally`
- `Find CSV Upload Risks`
- `Preview CSV Issues Before Google Ads`
- `Run Local Preflight Check`

FAQ draft:

### Is my CSV uploaded to your server?

No. The file is processed locally in your browser. The checker does not upload your CSV file to a server and does not store row data.

### Can this guarantee my Google Ads upload will succeed?

No. It checks CSV-level issues only. Google Ads account settings, conversion action ownership, click ownership, MCC permissions, customer data terms, and final attribution must still be checked inside Google Ads.

### Does it support Enhanced Conversions for Leads?

Yes. The checker can detect common user-provided data issues such as invalid email, suspicious phone values, plain-text user data, and invalid SHA-256 hash-like values.

### Can it fix my CSV automatically?

The first version generates a report and clear suggested fixes. Auto-fix and hash-export workflows are intentionally kept out of the MVP.

Result explanation copy:

- Critical: `Fix these before previewing or applying the upload. Critical findings usually include missing identifiers, missing conversion names, invalid times, broken structure, or unusable user data.`
- Warning: `Review these before upload. Warnings can affect match quality, attribution, duplicate handling, or reporting accuracy even when Google Ads accepts the file.`
- Info: `Informational findings help you understand fields, formatting, and cleanup opportunities.`
- Report export: `Download the full report to work row by row. It includes row number, field, issue, suggested fix, and current value.`

Batch replacement suggestion:

```regex
Find: Browser-local preflight checker for Google Ads offline conversion CSV upload errors\.
Replace: Check CSV-level upload risks locally before importing offline conversions into Google Ads.
```

## D. Code / schema / meta examples

Canonical examples:

```tsx
export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about the browser-local Google Ads Offline Conversion CSV Checker.",
  alternates: {
    canonical: "/faq",
  },
};
```

Robots meta:

No page-level `noindex` is needed for public utility, FAQ, guide, privacy, terms, and contact pages. Use site-level `robots.txt` allowing crawl and pointing to sitemap.

Hreflang:

Do not add hreflang until equivalent translated pages exist.

Homepage JSON-LD:

```tsx
const homepageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any modern web browser",
    description: defaultDescription,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPreview.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];
```

Note: schema is semantic enhancement and does not guarantee rich results.

HTML structure:

```tsx
<main>
  <section aria-labelledby="checker-title">
    <h1 id="checker-title">Google Ads Offline Conversion CSV Checker</h1>
    <section aria-labelledby="upload-title">
      <h2 id="upload-title" className="sr-only">Upload a CSV for a local preflight check</h2>
      <label htmlFor="csv-upload">Check CSV File Locally</label>
      <input id="csv-upload" type="file" accept=".csv,text/csv" />
    </section>
  </section>
</main>
```

## E. A/B testing plan

| Experiment | Hypothesis | A | B | Primary metric | Secondary metric | Stop condition | Low-sample fallback |
|---|---|---|---|---|---|---|---|
| Upload CTA | More concrete CTA increases file starts | `Check CSV File Locally` | `Find CSV Upload Risks` | file_selected / page_view | sample_loaded | 2 weeks or 500 upload-card views | Use directional lift and qualitative review |
| Hero angle | Privacy-first copy reduces anxiety | Risk-focused subtitle | Privacy-first subtitle | file_selected | scroll to results | 2 weeks or 500 homepage sessions | Use Search Console CTR and engagement proxy |
| Sample placement | Prominent samples help users understand value | Samples under upload | Samples before upload | sample_loaded | check_completed | 2 weeks or 300 sessions | Keep version with higher check completion |
| Report CTA | Clear export value increases report downloads | `Download full report CSV` | `Download row-level fix report` | report_downloaded / check_completed | return visit | 2 weeks or 100 completed checks | Use user clarity and zero confusion reports |

## F. Monitoring and analytics recommendations

Recommended events:

| Event | Trigger | Parameters | Key event |
|---|---|---|---|
| `file_selected` | User selects a CSV | `size_bucket` | No |
| `sample_loaded` | User loads an in-page sample | `sample_id`, `requested_workflow_mode` | No |
| `sample_downloaded` | User downloads a generated sample | `sample_id`, `source` | No |
| `check_completed` | Validation finishes | `source`, `processing_mode`, `row_count_bucket`, `issue_count_bucket`, `risk_status` | Yes |
| `parse_failed` | Validation fails before result | `reason`, `size_bucket` | No |
| `report_downloaded` | Report CSV downloads | `row_count_bucket`, `issue_count_bucket`, `risk_status` | Yes |
| `result_filter_changed` | User filters result table | `filter_type`, `value` | No |
| `result_search_used` | User searches results | `query_length_bucket` | No |

Minimum funnel:

1. Landing page view
2. Upload card interaction or sample click
3. `file_selected` or `sample_loaded`
4. `check_completed`
5. `report_downloaded`
6. Return visit or guide click

Privacy rule:

Never send uploaded file names, CSV row content, email addresses, phone numbers, click IDs, order IDs, conversion names, raw values, conversion values, or search query text to analytics. Use fixed sample IDs for built-in sample files.

Weekly Search Console checklist:

- Queries gaining impressions but CTR below 1 percent.
- Pages indexed vs submitted sitemap URLs.
- Guide pages with impressions but no clicks.
- Queries containing `template`, `upload errors`, `enhanced conversions`, `gclid`, `conversion time`.
- Coverage warnings, duplicate canonical warnings, and soft 404 risk.

Weekly GA4 / Vercel Analytics checklist:

- file_selected / landing page view.
- check_completed / file_selected.
- report_downloaded / check_completed.
- sample_loaded trend.
- risk_status distribution.
- guide clicks after report completion.

## G. Jira / Notion / Markdown templates

### Jira issue template

```md
Title: [SEO/CRO/UX] <task title>

Context:
<Why this matters>

User / search intent:
<Persona, query, or funnel step>

Scope:
- <file/page/component>
- <specific change>

Acceptance criteria:
- [ ] <observable result>
- [ ] View-source or interaction verified
- [ ] No PII analytics payload
- [ ] Mobile and keyboard flow checked

Risk / review:
<SEO, compliance, ad policy, maintenance risk>

Estimate: XS / S / M / L
Priority: P0 / P1 / P2
```

### Notion task template

```md
Task: <task title>
Priority: P0 / P1 / P2
Owner: <name>
Page: <URL or route>
KPI: SEO / CTR / UX / RPM / return visits
Problem:
Proposed change:
Files touched:
Analytics events:
Risk and review point:
Acceptance criteria:
Status: Not started / In progress / In review / Shipped / Verified
```

### Markdown backlog template

```md
## <Task title>

- Priority:
- Route:
- Problem:
- Change:
- Files:
- Estimate:
- KPI:
- Dependencies:
- Risk:
- Acceptance criteria:
  - [ ]
  - [ ]
  - [ ]
```

## H. Seven-day action plan

Day 1: Lock production URL, title, description, canonical, sitemap, robots, homepage H1, and privacy copy.

Day 2: Add server-rendered static SEO content to homepage: checks, supported columns, result reading, limitations, FAQ preview.

Day 3: Add JSON-LD to homepage, FAQ, guide index, and guide details.

Day 4: Improve result interpretation, report explanation, issue table accessibility, and filter/search analytics.

Day 5: Expand guide content, strengthen internal links, and verify all sitemap routes in view-source.

Day 6: Add monitoring/backlog docs, issue templates, and changelog or template backlog tasks.

Day 7: Run build, verify production deployment, inspect title/canonical/JSON-LD for every sitemap URL, and create the next SEO expansion branch.
