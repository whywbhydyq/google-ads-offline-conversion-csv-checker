import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "Enhanced Conversions for Leads User Data Preflight — Not a Data Manager Validator";
const pageDescription = "Review CSV-level enhanced conversions for leads user-data risks before using the official Google Ads workflow. This is not a Data Manager schema validator.";
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
    title: "Plain-text email values",
    body: "If your upload workflow expects hashed user-provided data, plain email addresses should be normalized and hashed before upload. The checker flags plain-text email values so you can review the workflow before importing.",
  },
  {
    title: "Phone formatting issues",
    body: "Phone values should be consistently normalized. When plain text is used, E.164-style formatting is usually easier to audit. Suspicious phone values such as words, short numbers, or broken strings should be fixed before upload.",
  },
  {
    title: "Broken SHA-256 hashes",
    body: "A SHA-256 hex digest should be 64 hexadecimal characters. Short hash-like strings are often caused by truncation, wrong hashing code, or exporting the wrong CRM field.",
  },
  {
    title: "Missing identifiers",
    body: "Every row should include at least one useful identifier such as a click ID, email, phone, or address-style user data. Rows with no identifier cannot be matched reliably.",
  },
  {
    title: "Address-style user data",
    body: "If you use name and address fields, first name, last name, and street address may need hashing for user-data workflows, while city, state, country, and postal code should remain plain location values. Partial address data is harder to match and should be reviewed before import.",
  },
  {
    title: "Consent fields",
    body: "When your workflow uses consent signals, Ad User Data and Ad Personalization should use clear Granted or Denied values. Blank or unexpected values should be reviewed before previewing the file in Google Ads.",
  },
  {
    title: "Workflow boundary",
    body: "This checker is a local CSV-level preflight. It does not replace Google Ads Data Manager, the official template for your account, or final Google Ads preview validation.",
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
      <p className="mt-5 text-lg leading-8 text-slate-700">Use this guide to review user-provided data problems before previewing or importing enhanced conversions for leads. Treat this as an independent CSV-level preflight. It is not a Google Ads Data Manager schema validator and does not replace the official Google Ads workflow.</p>
      <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Workflow boundary</h2>
        <p className="mt-3 leading-7 text-slate-700">Enhanced conversions for leads and Data Manager imports can have account-specific schemas and upload requirements. Use this page to catch local CSV-level user-data risks only, then validate the actual file in Google Ads.</p>
      </div>
      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check before upload</h2>
        <p className="mt-3 leading-7 text-slate-700">The browser-local checker can flag email, phone, address hashing, consent values, hash-like values, missing identifiers, duplicate rows, and conversion-time issues without uploading your CSV to a server.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
