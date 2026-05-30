import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "GCLID, GBRAID, and WBRAID in Offline Conversion CSV Files";
const pageDescription = "Check GCLID, GBRAID, and WBRAID columns in Google Ads offline conversion CSV files, including exactly-one click ID risks for click-conversion rows.";
const pagePath = "/guide/gclid-gbraid-wbraid-offline-conversion-csv";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const sections = [
  {
    title: "Use a usable identifier for each row",
    body: "Click-ID upload rows usually need a usable Google Click ID, GBRAID, or WBRAID. Rows without a valid click identifier or eligible user-data workflow are high risk because Google Ads may not be able to match them.",
  },
  {
    title: "Use exactly one click ID in API-style click conversion rows",
    body: "For the click-conversion workflow this checker models, each row should provide exactly one of GCLID, GBRAID, or WBRAID. If the same row contains multiple click IDs, the checker treats that as a blocker in click-ID workflow mode. Confirm edge cases in the official Google Ads workflow or API documentation before changing production imports.",
  },
  {
    title: "Keep GCLID, GBRAID, and WBRAID in separate columns",
    body: "Do not combine identifiers into one free-text field. Separate columns make the CSV easier to validate, troubleshoot, and map during the Google Ads upload preview.",
  },
  {
    title: "Do not edit captured IDs manually",
    body: "Click identifiers should be exported exactly as captured by the lead form, CRM, or landing page system. Trimming, lowercasing, splitting, or reformatting IDs can reduce match quality.",
  },
  {
    title: "Do not mix click-ID imports with PII unless the workflow requires it",
    body: "Legacy click-ID file imports and user-data preflight workflows have different assumptions. Use the workflow selector in the checker so the report does not apply user-data rules to a click-only file or click-only age rules to a user-data file.",
  },
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
        GCLID, GBRAID, and WBRAID fields are click identifiers used in offline conversion workflows. Check that identifier columns exist, are not blank, are not malformed, and are not accidentally combined before upload.
      </p>
      <LastUpdated />
      <div className="mt-10 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
          </section>
        ))}
      </div>
      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsApiClickSample, officialSources.googleAdsApiTroubleshooting, officialSources.googleAdsFileImport, officialSources.googleAdsImportGuidelines]} />
      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check identifier fields before import</h2>
        <p className="mt-3 leading-7 text-slate-700">Use the local CSV checker to find missing click IDs, malformed click IDs, duplicate conversion records, mixed identifiers, and Order ID risks before previewing the upload in Google Ads.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
