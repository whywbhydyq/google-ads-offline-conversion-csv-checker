import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated, LocalValidationBoundary, OfficialSources, officialSources } from "@/components/GuideSupportBlocks";
import { organizationId, organizationName, siteUrl, websiteId } from "@/lib/site";

const pageTitle = "Enhanced Conversions CSV Preflight";
const pageDescription = "Review local user-data risks for enhanced conversions for leads CSV files without treating this checker as a Data Manager or final upload validator.";
const pagePath = "/guide/enhanced-conversions-for-leads-csv-errors";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const sections = [
  {
    title: "Data Manager and official workflow boundary",
    body: "Enhanced conversions for leads should be configured and validated in the official Google Ads workflow. This page only explains local CSV-level user-data risks that can be reviewed before final validation.",
  },
  {
    title: "Scheduled/pre-hashed user-data upload",
    body: "When a workflow expects pre-hashed user data, plain email, phone, first name, last name, and street address values should be treated as blockers until they are normalized and SHA-256 hashed.",
  },
  {
    title: "Manual unhashed review",
    body: "Some official manual review workflows may accept unhashed values, but this checker cannot confirm which account workflow will hash them. Plain values still need valid formatting, and invalid email or phone values should be fixed before Google Ads preview.",
  },
  {
    title: "Broken SHA-256 hashes",
    body: "A SHA-256 hex digest should be 64 hexadecimal characters. Short hash-like strings are often caused by truncation, wrong hashing code, missing normalization, or exporting the wrong CRM field.",
  },
  {
    title: "Address-style user data",
    body: "First name, last name, and street address may require hashing in pre-hashed workflows, while city, state, country, and postal code are location fields. Country or postal code alone is not a useful user identifier.",
  },
  {
    title: "Consent fields",
    body: "When your workflow uses consent signals, Ad User Data and Ad Personalization should use clear Granted or Denied values. Blank or unexpected values should be reviewed before previewing the file in Google Ads.",
  },
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

export default function EnhancedConversionsGuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={guideJsonLd} />
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">
        Use this page for local user-data preflight only. It is not a Google Ads Data Manager schema validator, not an account setup check, and not a guarantee that enhanced conversions for leads will import or match.
      </p>
      <LastUpdated />

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6" aria-labelledby="hard-boundary">
        <h2 id="hard-boundary" className="text-2xl font-bold text-slate-950">Important boundary</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Use the official Google Ads, Data Manager, Google Ads API, or other supported workflow for enhanced conversions for leads setup and final validation. This checker can only flag local CSV-level symptoms such as invalid email, suspicious phone values, plain pre-hashed fields, incomplete address data, missing identifiers, consent value issues, duplicate rows, and conversion-time risks.
        </p>
      </section>

      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
          </section>
        ))}
      </div>

      <LocalValidationBoundary />
      <OfficialSources sources={[officialSources.googleAdsDataManager, officialSources.googleAdsImportGuidelines, officialSources.googleAdsApiOffline, officialSources.googleAdsEclDiagnostics, officialSources.googleAdsFileImport]} />

      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check before upload</h2>
        <p className="mt-3 leading-7 text-slate-700">The browser-local checker can flag email, phone, address hashing, consent values, hash-like values, missing identifiers, duplicate rows, and conversion-time issues without uploading your CSV to a server.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
