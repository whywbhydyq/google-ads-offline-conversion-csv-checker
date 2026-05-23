# SEO / CRO / UX Backlog

This backlog converts the homepage and guide audit into implementation tasks for the Google Ads Offline Conversion CSV Checker.

## Assumptions

- Primary page type: free browser-local tool page.
- Primary KPI: organic CTR, file upload rate, check completion rate, report download rate, guide click rate, and return visits.
- Monetization: AdSense-first. Do not place ads near upload, sample, or report download controls.
- Privacy position: CSV files are processed locally in the browser and are not uploaded by this site.
- Compliance position: this is not an official Google product and does not guarantee Google Ads import success.

## P0 tasks

| Priority | Task | Problem | Change | Estimate | Impact | Risk / review | Acceptance criteria |
|---|---|---|---|---|---|---|---|
| P0 | Unify canonical, robots, and sitemap domain | Search signals can split if fallback URLs differ | Use one production fallback URL and require `NEXT_PUBLIC_SITE_URL` in Vercel | XS | SEO | Wrong production URL can canonicalize to the wrong host | `/robots.txt`, `/sitemap.xml`, and canonical use the same host |
| P0 | Improve homepage metadata | Current SERP copy is too narrow | Include free, local, CSV checker, upload risk, and offline conversion terms | XS | CTR / SEO | Do not keyword-stuff | Title and description are readable and within SERP limits |
| P0 | Add crawlable homepage content | Tool UI alone is thin for search intent | Add validation, common errors, report reading, limitation, and FAQ sections | S | SEO / UX | Do not claim guaranteed upload success | Core explanatory text is visible without uploading a file |
| P0 | Add result fix guidance | Issue tables alone do not tell operators what to fix first | Add a result guidance panel with contextual guide links | M | UX / report downloads | Keep account-level disclaimer visible | Invalid sample shows critical fix guidance |
| P0 | Keep ad slots away from controls | Upload and report buttons are high-intent actions | Place future ad slots only inside content sections or after results | XS | RPM / policy | Never disguise ads as buttons | Ads are labeled and not adjacent to upload/download controls |

## P1 tasks

| Priority | Task | Problem | Change | Estimate | Impact | Risk / review | Acceptance criteria |
|---|---|---|---|---|---|---|---|
| P1 | Expand guide pages | Short guide pages can look low-value | Add workflow, examples, limitations, and CTA sections | M | Long-tail SEO | Avoid copying official docs | Each guide has clear H2 sections and a checker CTA |
| P1 | Add changelog | Users need trust in validation rules | Add visible update history and review policy | S | Trust / return visits | Do not imply rules are always current | Changelog is linked from guides and sitemap |
| P1 | Improve mobile issue display | Wide tables are hard on phones | Add mobile issue cards while keeping desktop table | M | Mobile UX | Do not hide important fields | Mobile users can read severity, row, field, issue, and fix without horizontal scrolling |
| P1 | Add structured data | Search engines need clearer app context | Add WebApplication and BreadcrumbList JSON-LD | S | SEO semantics | Schema is not a rich-result guarantee | Schema validates without critical errors |
| P1 | Improve accessibility | Filters and status states need clear semantics | Add labels, role status, role alert, and aria-pressed | S | Accessibility / UX | Keep keyboard operation intact | Keyboard and screen-reader states are clear |

## P2 tasks

| Priority | Task | Problem | Change | Estimate | Impact | Risk / review | Acceptance criteria |
|---|---|---|---|---|---|---|---|
| P2 | Add downloadable checklist asset | Some users search for templates and checklists | Add a short downloadable checklist or printable guide | S | SEO / return visits | Do not imply official template | Asset links to checker and guide pages |
| P2 | Add comparison block | Users need to understand preflight vs official import diagnostics | Compare local checker, manual spreadsheet review, and Google Ads diagnostics | M | UX / SEO | Avoid negative claims about Google Ads | Comparison clarifies scope and limitations |
| P2 | Add content refresh SOP | Validation rules need maintenance | Document how to review rules after platform changes | XS | Maintenance | Do not overpromise update frequency | Changelog entries follow the SOP |

## Release checklist

- Run `npm run typecheck`.
- Run `npm run build`.
- Test valid sample CSV.
- Test invalid enhanced conversions sample CSV.
- Test file rejection cases: non-CSV, empty file, too large file.
- Check mobile layout at 390px width.
- Confirm analytics events fire in Vercel Analytics or GA4.
- Confirm Search Console sees final canonical URL after deployment.
