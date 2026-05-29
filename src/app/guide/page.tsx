import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "CSV Guides",
  description: "Guides for checking offline conversion CSV files before upload.",
  alternates: {
    canonical: "/guide",
  },
};

const guides = [
  ["Upload error guide", "/guide/google-ads-offline-conversion-upload-errors", "Fix common CSV upload problems before import."],
  ["Conversion time format", "/guide/google-ads-conversion-time-format", "Format conversion timestamps, time zones, and date values before upload."],
  ["GCLID, GBRAID, WBRAID fields", "/guide/gclid-gbraid-wbraid-offline-conversion-csv", "Choose the right click identifier columns for offline conversion imports."],
  ["CSV template checklist", "/guide/offline-conversion-csv-template-checklist", "Review columns, dates, values, currency, and identifiers."],
  ["Enhanced conversions CSV errors", "/guide/enhanced-conversions-for-leads-csv-errors", "Check email, phone, hash, and user data issues."],
];

const guideJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Offline Conversion CSV Guides | ${siteName}`,
    description: metadata.description,
    url: `${siteUrl}/guide`,
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Offline Conversion CSV Guides",
    itemListElement: guides.map(([title, href, description], index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${href}`,
      name: title,
      description,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${siteUrl}/guide`,
      },
    ],
  },
];

export default function GuideIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <JsonLd data={guideJsonLd} />
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Offline Conversion CSV Guides</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Practical guides for preparing and troubleshooting CSV files before import.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {guides.map(([title, href, description]) => (
          <a key={href} href={href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{description}</p>
            <span className="mt-5 inline-flex text-sm font-semibold text-blue-700">Read guide</span>
          </a>
        ))}
      </div>
    </main>
  );
}
