import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CONTENT_DATE_MODIFIED, LastUpdated } from "@/components/GuideSupportBlocks";
import { siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Google Ads Offline Conversion CSV Guides",
  description: "Practical guides for checking upload errors, conversion time formats, click IDs, user-data risks, and CSV templates before Google Ads preview.",
  alternates: {
    canonical: "/guide",
  },
};

const startHere = [
  {
    title: "Fix upload blockers first",
    href: "/guide/google-ads-offline-conversion-upload-errors",
    body: "Start here when Google Ads preview fails or a CSV export looks risky.",
    audience: "PPC operators and agencies troubleshooting an upload",
  },
  {
    title: "Check timestamp formats",
    href: "/guide/google-ads-conversion-time-format",
    body: "Use this when rows have timezone, future-date, old-click, or unparseable time warnings.",
    audience: "CRM, analytics, and operations teams exporting conversion times",
  },
  {
    title: "Review user-data boundaries",
    href: "/guide/enhanced-conversions-for-leads-csv-errors",
    body: "Use this for local email, phone, address, consent, and hash preflight checks only.",
    audience: "Teams using user-provided data or enhanced conversions workflows",
  },
];

const guides = [
  {
    title: "Upload error guide",
    href: "/guide/google-ads-offline-conversion-upload-errors",
    description: "Fix common CSV upload problems before import.",
    audience: "Use when the file fails preview or has many row-level issues.",
  },
  {
    title: "Conversion time format",
    href: "/guide/google-ads-conversion-time-format",
    description: "Format conversion timestamps, time zones, Parameters:TimeZone rows, and date values before upload.",
    audience: "Use when rows are timezone-less, future-dated, or too old.",
  },
  {
    title: "GCLID, GBRAID, WBRAID fields",
    href: "/guide/gclid-gbraid-wbraid-offline-conversion-csv",
    description: "Choose the right click identifier columns and avoid mixed click-ID rows.",
    audience: "Use for click-ID upload or API-style click conversion workflows.",
  },
  {
    title: "CSV template checklist",
    href: "/guide/offline-conversion-csv-template-checklist",
    description: "Review columns, dates, values, ISO currency codes, consent fields, and identifiers.",
    audience: "Use before sending a cleaned export to Google Ads preview.",
  },
  {
    title: "Enhanced conversions user data preflight",
    href: "/guide/enhanced-conversions-for-leads-csv-errors",
    description: "Check email, phone, address hash, consent, and user-data issues without treating this as a Data Manager schema validator.",
    audience: "Use for local user-data field review, not final ECL validation.",
  },
];

const guideJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Offline Conversion CSV Guides | ${siteName}`,
    description: metadata.description,
    url: `${siteUrl}/guide`,
    dateModified: CONTENT_DATE_MODIFIED,
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Offline Conversion CSV Guides",
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${guide.href}`,
      name: guide.title,
      description: guide.description,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guide` },
    ],
  },
];

export default function GuideIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={guideJsonLd} />
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Google Ads Offline Conversion CSV Guides</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
        Short, practical guides for checking CSV structure, timestamps, click identifiers, user-data fields, and template risks before Google Ads preview.
      </p>
      <LastUpdated />

      <section className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm" aria-labelledby="start-here">
        <h2 id="start-here" className="text-2xl font-bold text-slate-950">Start here</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {startHere.map((item) => (
            <a key={item.href} href={item.href} className="rounded-2xl border border-blue-100 bg-white p-5 transition hover:border-blue-300 hover:shadow-soft">
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-700">{item.audience}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="all-guides">
        <h2 id="all-guides" className="text-2xl font-bold text-slate-950">All guides</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <a key={guide.href} href={guide.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-soft">
              <h3 className="text-xl font-bold text-slate-950">{guide.title}</h3>
              <p className="mt-3 leading-7 text-slate-700">{guide.description}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{guide.audience}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-blue-700">Read guide</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
