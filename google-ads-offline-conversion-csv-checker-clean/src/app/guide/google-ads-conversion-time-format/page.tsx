import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { organizationId, organizationName, siteUrl, websiteId } from "@/lib/site";

const pageTitle = "Google Ads Conversion Time Format";
const pageDescription = "Check Google Ads offline conversion timestamp patterns, timezone offsets, Parameters:TimeZone rows, future dates, and old click conversion risks before upload.";
const pagePath = "/guide/google-ads-conversion-time-format";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const acceptedExamples = [
  ["Parameters:TimeZone=America/Chicago", "File-level timezone parameter. Use when rows omit timezone values and the whole file uses one timezone."],
  ["Parameters:TimeZone=-0500", "File-level GMT offset parameter. Timezone IDs are usually safer around daylight saving changes."],
  ["05/22/2026 14:30:00 -0500", "Numeric date and time with a GMT offset."],
  ["05/22/2026 02:30:00 PM", "US-style date with 12-hour time. Add a file-level timezone if rows do not carry their own offset."],
  ["2026-05-22 14:30:00+0800", "ISO-style date and time with a compact numeric offset."],
  ["2026-05-22T14:30:00 America/Los_Angeles", "ISO-style date and time with an IANA timezone ID."],
];

const riskRows = [
  ["Date only", "2026-05-22", "Missing time of day; attribution and import preview may be ambiguous."],
  ["No timezone and no file parameter", "05/22/2026 14:30:00", "The checker can parse the date, but the intended timezone is unclear."],
  ["Future timestamp", "2099-05-22 14:30:00 +0000", "Usually indicates wrong timezone, wrong date column, or bad export logic."],
  ["Old click conversion", "A click-ID row older than the expected import window", "Review before upload; the local checker cannot confirm final eligibility."],
];

const guideJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageTitle,
    description: pageDescription,
    mainEntityOfPage: `${siteUrl}${pagePath}`,
    author: { "@id": organizationId, name: organizationName },
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId },
    dateModified: CONTENT_DATE_MODIFIED,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guide` },
      { "@type": "ListItem", position: 3, name: pageTitle, item: `${siteUrl}${pagePath}` },
    ],
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={guideJsonLd} />
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">
        Conversion time errors are common in offline conversion CSV files. Check the row timestamp, optional file-level <code className="rounded bg-slate-100 px-1 py-0.5">Parameters:TimeZone</code> value, future dates, and old conversion warnings before Google Ads preview.
      </p>
      <LastUpdated />

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="accepted-time-examples">
        <h2 id="accepted-time-examples" className="text-2xl font-bold text-slate-950">Timestamp and timezone examples this checker expects</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th scope="col" className="py-3 pr-4 font-semibold">Example</th>
                <th scope="col" className="py-3 font-semibold">How to use it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {acceptedExamples.map(([example, note]) => (
                <tr key={example}>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-900">{example}</td>
                  <td className="py-3 leading-6 text-slate-700">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="time-risks">
        <h2 id="time-risks" className="text-2xl font-bold text-slate-950">Rows the checker flags for review</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {riskRows.map(([title, example, note]) => (
            <article key={title} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-950">{title}</h3>
              <p className="mt-2 font-mono text-xs text-slate-700">{example}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsFileImport, officialSources.googleAdsImportGuidelines, officialSources.googleAdsApiOffline]} />

      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check conversion times locally</h2>
        <p className="mt-3 leading-7 text-slate-700">Use the CSV checker to flag date-only, future, old, timezone-less, invalid timezone, and unparseable conversion time values before Google Ads import preview.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
