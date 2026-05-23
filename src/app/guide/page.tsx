import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline Conversion CSV Guides",
  description:
    "Practical guides for preparing, checking, and troubleshooting Google Ads offline conversion CSV files before upload.",
};

const guides = [
  ["Upload error guide", "/guide/google-ads-offline-conversion-upload-errors", "Fix missing headers, invalid conversion times, old rows, identifiers, values, currency, and duplicate risks before import."],
  ["CSV template checklist", "/guide/offline-conversion-csv-template-checklist", "Review required columns, identifiers, dates, values, currency, Order ID, and duplicate handling before upload."],
  ["Enhanced conversions CSV errors", "/guide/enhanced-conversions-for-leads-csv-errors", "Check email, phone, hash-like values, missing identifiers, and user data issues in enhanced conversions workflows."],
  ["Validation rule changelog", "/changelog", "See recent content, SEO, analytics, and validation guidance updates for the checker."],
];

export default function GuideIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Offline Conversion CSV Guides</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Practical guides for preparing, validating, and troubleshooting offline conversion CSV files before import. Use these pages with the browser-local checker when you need to understand why a file is risky and what to fix first.</p>
      <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Recommended workflow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-700"><li>Start with the CSV template checklist before exporting a production file.</li><li>Run the file through the local checker.</li><li>Use the upload error guide to fix critical issues and warnings.</li><li>Use the enhanced conversions guide when user-provided data fields are present.</li></ol>
      </section>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {guides.map(([title, href, description]) => (
          <a key={href} href={href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{description}</p>
            <span className="mt-5 inline-flex text-sm font-semibold text-blue-700">Read more</span>
          </a>
        ))}
      </div>
    </main>
  );
}
