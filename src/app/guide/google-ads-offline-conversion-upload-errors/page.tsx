import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "Google Ads Offline Conversion Upload Errors: How to Fix Your CSV";
const pageDescription = "Fix common Google Ads offline conversion CSV upload risks before preview: headers, conversion time, click IDs, hashed user data, consent, currency, and duplicates.";
const pagePath = "/guide/google-ads-offline-conversion-upload-errors";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const errorRows = [
  ["Missing or duplicate headers", "Headers such as Conversion Name, Conversion Time, click ID, value, currency, consent, or user-data fields cannot be mapped reliably.", "Fix blank, duplicated, or renamed headers before upload."],
  ["Invalid conversion time", "Date-only, future, timezone-less, unparseable, or old rows can fail preview or create attribution confusion.", "Use a supported timestamp format and a clear row-level timezone or Parameters:TimeZone row."],
  ["Missing or invalid identifiers", "Rows without a valid click ID, valid email, valid phone, or usable address-style user data cannot be matched locally.", "Choose the correct workflow and fix invalid identifiers before preview."],
  ["Plain or invalid user data", "Scheduled/pre-hashed workflows should not contain plain email, phone, first name, last name, or street address values.", "Normalize and SHA-256 hash where your workflow requires pre-hashed user data."],
  ["Consent value problems", "Unexpected Ad User Data or Ad Personalization values may not match your workflow expectations.", "Review consent mapping before previewing the file in Google Ads."],
  ["Value, currency, and duplicate risks", "Invalid numeric values, non-ISO currency codes, duplicate conversion keys, and repeated Order IDs can create upload or reporting problems.", "Fix the report rows, then preview the corrected file in Google Ads."],
];

const guideJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageTitle,
    description: pageDescription,
    mainEntityOfPage: `${siteUrl}${pagePath}`,
    author: { "@type": "Organization", name: siteName, url: siteUrl },
    publisher: { "@type": "Organization", name: siteName, url: siteUrl },
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
        Offline conversion import errors are often caused by CSV-level problems that can be caught before upload. Use this guide to decide which rows to fix before opening Google Ads preview.
      </p>
      <LastUpdated />

      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="error-fix-table">
        <h2 id="error-fix-table" className="text-2xl font-bold text-slate-950">Common CSV-level errors and fixes</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th scope="col" className="py-3 pr-4 font-semibold">Issue</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Why it matters</th>
                <th scope="col" className="py-3 font-semibold">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {errorRows.map(([issue, risk, action]) => (
                <tr key={issue}>
                  <td className="py-3 pr-4 font-semibold text-slate-950">{issue}</td>
                  <td className="py-3 pr-4 leading-6 text-slate-700">{risk}</td>
                  <td className="py-3 leading-6 text-slate-700">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="old-rows">
        <h2 id="old-rows" className="text-2xl font-bold text-slate-950">Why old rows are flagged</h2>
        <p className="mt-3 leading-7 text-slate-700">
          The checker uses different age windows by workflow. Click-ID upload rows are reviewed against a 90-day offline conversion window, while user-data / enhanced-conversion preflight rows are reviewed against a 63-day window. Treat these as local review signals, then confirm final eligibility in Google Ads.
        </p>
      </section>

      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsFileImport, officialSources.googleAdsImportGuidelines, officialSources.googleAdsDataManager, officialSources.googleAdsApiOffline]} />

      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check your CSV before upload</h2>
        <p className="mt-3 leading-7 text-slate-700">Use the free browser-local checker to find missing fields, invalid times, suspicious identifiers, user data issues, consent values, currency problems, and duplicate rows before import.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
