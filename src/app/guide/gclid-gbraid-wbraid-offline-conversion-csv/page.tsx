import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "GCLID, GBRAID, and WBRAID in Offline Conversion CSV Files";
const pageDescription = "Check GCLID, GBRAID, and WBRAID columns in Google Ads offline conversion CSV files. Learn which identifiers are required and how to avoid missing ID import errors.";
const pagePath = "/guide/gclid-gbraid-wbraid-offline-conversion-csv";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const sections = [
  { title: "Use at least one click identifier when required", body: "Offline conversion rows commonly need a Google Click ID, GBRAID, WBRAID, or eligible user-provided data workflow. Rows without a usable identifier are high risk because Google Ads may not be able to match them." },
  { title: "Keep GCLID, GBRAID, and WBRAID in separate columns", body: "Do not combine identifiers into one free-text field. Separate columns make the CSV easier to validate, troubleshoot, and map during the Google Ads upload preview." },
  { title: "Do not edit captured IDs manually", body: "Click identifiers should be exported exactly as captured by the lead form, CRM, or landing page system. Trimming, lowercasing, splitting, or reformatting IDs can reduce match quality." },
  { title: "Watch for blank identifier rows", body: "Blank IDs can happen when tracking was not available, consent changed, or CRM fields were mapped incorrectly. Review blank identifier rows before upload instead of assuming the import will recover them." },
  { title: "Use Order ID for deduplication when appropriate", body: "Order ID does not replace a click identifier, but it can help avoid duplicate conversion imports when your workflow supports it." },
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

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={guideJsonLd} />
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">
        GCLID, GBRAID, and WBRAID fields are common matching identifiers in offline conversion imports. Check that identifier columns exist, are not blank, and are not accidentally reformatted before upload.
      </p>
      <div className="mt-10 space-y-6">{sections.map((section) => <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-3 leading-7 text-slate-700">{section.body}</p></section>)}</div>
      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6"><h2 className="text-2xl font-bold text-slate-950">Check identifier fields before import</h2><p className="mt-3 leading-7 text-slate-700">Use the local CSV checker to find missing click IDs, blank identifier rows, duplicate conversion records, and Order ID risks before previewing the upload in Google Ads.</p><a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a></div>
    </main>
  );
}
