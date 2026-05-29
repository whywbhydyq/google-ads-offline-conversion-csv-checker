import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

const pageTitle = "Google Ads Offline Conversion Time Format";
const pageDescription = "Format Google Ads offline conversion time values before CSV upload. Check date, time, timezone, future timestamps, and old click conversion risks.";
const pagePath = "/guide/google-ads-conversion-time-format";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pagePath,
  },
};

const sections = [
  { title: "Include date and time", body: "Conversion Time should include both the calendar date and the local time when the conversion happened. Date-only values are ambiguous and can lead to import or attribution problems." },
  { title: "Use a clear timezone", body: "A timezone offset such as +08:00 or -05:00 makes the timestamp easier to interpret. If your export omits timezone data, verify the account timezone and the source CRM timezone before upload." },
  { title: "Avoid future timestamps", body: "A future conversion time usually means the export used the wrong timezone, date column, or system clock. Fix future rows before previewing the import in Google Ads." },
  { title: "Review old click conversions", body: "Very old conversion times may fall outside the expected import window or business process. Check rows older than your normal attribution workflow before applying the upload." },
  { title: "Keep formatting consistent", body: "Mixing multiple date formats in one CSV makes errors harder to spot. Use one export format for all rows, then run a local checker to find unparseable or timezone-less values." },
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
        Conversion time errors are one of the easiest Google Ads offline conversion CSV problems to catch before upload. Validate the timestamp format, timezone, future dates, and unusually old conversions before previewing the file.
      </p>
      <div className="mt-10 space-y-6">{sections.map((section) => <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-3 leading-7 text-slate-700">{section.body}</p></section>)}</div>
      <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6"><h2 className="text-2xl font-bold text-slate-950">Check conversion times locally</h2><p className="mt-3 leading-7 text-slate-700">Use the CSV checker to flag date-only, future, old, timezone-less, and unparseable conversion time values before Google Ads import.</p><a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a></div>
    </main>
  );
}
