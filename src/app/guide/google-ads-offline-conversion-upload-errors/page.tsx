import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "Google Ads Offline Conversion Upload Errors: How to Fix Your CSV";
const pageDescription = "Learn how to fix common Google Ads offline conversion CSV upload errors, including missing headers, invalid conversion time, old GCLIDs, un-hashed user data, and duplicates.";
const pagePath = "/guide/google-ads-offline-conversion-upload-errors";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const sections = [
  { title: "Missing headers", body: "Google Ads offline conversion uploads depend on recognizable columns such as Google Click ID, Conversion Name, Conversion Time, Conversion Value, and Conversion Currency. If headers are duplicated, blank, or named inconsistently, rows can fail before Google Ads can interpret the file." },
  { title: "Invalid conversion time", body: "Conversion Time should include a parseable date and time. A date-only value can be ambiguous, and a future timestamp is almost always wrong. Include a timezone such as +08:00 where possible." },
  { title: "Old click IDs", body: "Very old click-based conversions are risky. If the conversion time is more than 90 days old, verify that the import window and business process make sense before upload." },
  { title: "Un-hashed user data", body: "Enhanced Conversions for Leads often uses user-provided data such as email and phone. Plain-text user data may need to be normalized and hashed with SHA-256 before upload, depending on the workflow you use." },
  { title: "Duplicate conversions", body: "Duplicate identifier + conversion name + conversion time combinations can cause confusion or duplicate import attempts. Use an Order ID where appropriate and remove accidental duplicates before uploading." },
  { title: "What a local checker cannot verify", body: "A browser checker can catch CSV-level issues, but it cannot confirm conversion action ownership, account permissions, whether a click belongs to the account, or final attribution inside Google Ads." },
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
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">Offline conversion import errors are often caused by simple CSV-level problems. Use this guide to spot the most common issues before uploading your file to Google Ads.</p>
      <div className="mt-10 space-y-6">{sections.map((section) => <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-3 leading-7 text-slate-700">{section.body}</p></section>)}</div>
      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6"><h2 className="text-2xl font-bold text-slate-950">Check your CSV before upload</h2><p className="mt-3 leading-7 text-slate-700">Use the free browser-local checker to find missing fields, invalid times, suspicious identifiers, user data issues, and duplicate rows before import.</p><a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a></div>
    </main>
  );
}
