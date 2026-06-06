import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { organizationId, organizationName, siteUrl, websiteId } from "@/lib/site";

const pageTitle = "Offline Conversion CSV Checklist";
const pageDescription = "Use a practical Google Ads offline conversion CSV checklist for identifiers, conversion names, timestamps, values, currency, consent, and duplicates.";
const pagePath = "/guide/offline-conversion-csv-template-checklist";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const workflowItems = [
  ["Click ID upload", "Use GCLID, GBRAID, or WBRAID fields. Keep one click identifier per click-conversion row when the workflow requires exactly one."],
  ["Scheduled/pre-hashed user-data upload", "Use pre-hashed user-provided data where required by your workflow. Plain email, phone, first name, last name, or street address values should be reviewed as blockers."],
  ["Manual unhashed review", "Manual workflows may allow Google Ads to hash some plain values, but you still need valid email/phone formatting and final preview in Google Ads."],
  ["Data Manager / ECL boundary", "Do not treat this local checker as a Google Ads Data Manager schema validator or an official account setup check."],
];

const items = [
  ["Identifier", "Every row needs a usable identifier for the chosen workflow: a valid click ID, valid email, valid phone, or complete address-style user data. Location-only fields such as country or postal code are not enough."],
  ["Conversion Name", "Match the conversion action name used in Google Ads. Empty values are a high-risk upload problem."],
  ["Conversion Time", "Use a parseable date and time. Include a row-level timezone or a file-level Parameters:TimeZone row when your export uses one timezone."],
  ["Value and Currency", "Use numeric conversion values and ISO 4217 currency codes such as USD, EUR, GBP, SGD, or JPY."],
  ["Consent", "If your workflow uses consent signals, review Ad User Data and Ad Personalization values before previewing the file."],
  ["Order ID and duplicates", "Use Order ID when appropriate, then check repeated identifier + conversion name + conversion time combinations before importing."],
];

const checklistJsonLd = [
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

export default function TemplateChecklistPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={checklistJsonLd} />
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">Use this checklist before uploading an offline conversion CSV to Google Ads preview. Google Ads supports additional template formats, but this local checker only validates CSV files.</p>
      <LastUpdated />

      <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm" aria-labelledby="workflow-checklist">
        <h2 id="workflow-checklist" className="text-2xl font-bold text-slate-950">Choose the workflow before reading the report</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {workflowItems.map(([title, body]) => (
            <article key={title} className="rounded-2xl bg-white p-5">
              <h3 className="font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-5" aria-labelledby="csv-template-items">
        <h2 id="csv-template-items" className="sr-only">CSV template items</h2>
        {items.map(([title, body]) => (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-950">{title}</h3>
            <p className="mt-3 leading-7 text-slate-700">{body}</p>
          </section>
        ))}
      </section>

      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsFileImport, officialSources.googleAdsBulkTemplates, officialSources.googleAdsApiClickSample, officialSources.googleAdsDataManager, officialSources.googleAdsImportGuidelines]} />
      <a href="/" className="mt-8 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Check a CSV</a>
    </main>
  );
}
