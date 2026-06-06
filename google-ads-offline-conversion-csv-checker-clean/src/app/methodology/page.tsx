import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { methodologyId, organizationId, organizationName, siteName, siteUrl, websiteId } from "@/lib/site";

const pageTitle = "CSV Check Methodology";
const pageDescription = "How the browser-local checker reviews Google Ads offline conversion CSV structure, time, identifiers, user data, consent, value, and duplicate risks.";
const pagePath = "/methodology";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pagePath },
};

const severityRows = [
  ["Critical", "Rows likely to fail upload, fail matching, or need workflow review before preview.", "Missing conversion time, missing conversion name, invalid time, missing usable identifier, invalid pre-hashed user data."],
  ["Warning", "Rows that may import but deserve operator review because reporting or match quality can degrade.", "Old conversion time, timezone-less timestamp, suspicious phone value, duplicate Order ID, non-standard value shape."],
  ["Info", "Contextual findings that help clean the file but are not immediate blockers.", "Recognized optional columns, local-only limitations, or workflow reminders."],
];

const methodologySteps = [
  {
    title: "Parse the CSV locally",
    body: "The checker reads the selected CSV in the browser, handles UTF-8 BOM, detects a header row, checks row width, and reports malformed quote or delimiter structure before value-level validation starts.",
  },
  {
    title: "Identify the workflow",
    body: "Validation changes depending on whether the file is a click-ID upload, scheduled/pre-hashed user-data upload, or manual unhashed review. The selected workflow controls how identifiers, hashes, and plain user data are interpreted.",
  },
  {
    title: "Validate row-level risks",
    body: "Each row is checked for conversion name, conversion time, timezone context, click identifiers, user-provided data, consent fields, conversion value, ISO currency code, Order ID, and duplicate conversion keys.",
  },
  {
    title: "Return a fix-oriented report",
    body: "Findings are grouped by severity and exported with row number, field, current value, issue, and suggested fix so the CSV owner can correct the source export before using Google Ads preview.",
  },
];

const methodologyJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": methodologyId,
    headline: pageTitle,
    description: pageDescription,
    mainEntityOfPage: `${siteUrl}${pagePath}`,
    author: { "@id": organizationId, name: organizationName },
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
    dateModified: CONTENT_DATE_MODIFIED,
    about: [
      "Google Ads offline conversions",
      "CSV validation",
      "Enhanced conversions for leads",
      "Browser-local file processing",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: pageTitle, item: `${siteUrl}${pagePath}` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}${pagePath}#webpage`,
    name: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    url: `${siteUrl}${pagePath}`,
    isPartOf: { "@id": websiteId },
    mainEntity: { "@id": methodologyId },
  },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <JsonLd data={methodologyJsonLd} />
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
        This page documents how the local checker reviews a Google Ads offline conversion CSV. It is written for PPC operators, agencies, and data teams that need to explain why a row was flagged before previewing the file in Google Ads.
      </p>
      <LastUpdated />

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="methodology-steps">
        <h2 id="methodology-steps" className="text-2xl font-bold text-slate-950">Validation pipeline</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {methodologySteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-bold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="severity-model">
        <h2 id="severity-model" className="text-2xl font-bold text-slate-950">Severity model</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Severity is assigned from the expected impact on upload preview, matching quality, reporting accuracy, and workflow safety. It is not a final Google Ads account decision.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th scope="col" className="py-3 pr-4 font-semibold">Severity</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Meaning</th>
                <th scope="col" className="py-3 font-semibold">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {severityRows.map(([severity, meaning, examples]) => (
                <tr key={severity}>
                  <td className="py-3 pr-4 font-semibold text-slate-950">{severity}</td>
                  <td className="py-3 pr-4 leading-6 text-slate-700">{meaning}</td>
                  <td className="py-3 leading-6 text-slate-700">{examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="privacy-methodology">
        <h2 id="privacy-methodology" className="text-2xl font-bold text-slate-950">Privacy boundary</h2>
        <p className="mt-3 leading-7 text-slate-700">
          CSV parsing and validation run in the browser. The checker does not upload the selected file, file name, row values, click IDs, email addresses, phone numbers, Order IDs, search text, or conversion values to a server. Aggregated product events may be recorded as described in the privacy policy.
        </p>
      </section>

      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsFileImport, officialSources.googleAdsImportGuidelines, officialSources.googleAdsDataManager, officialSources.googleAdsApiOffline, officialSources.googleAdsEclDiagnostics]} />
    </main>
  );
}
