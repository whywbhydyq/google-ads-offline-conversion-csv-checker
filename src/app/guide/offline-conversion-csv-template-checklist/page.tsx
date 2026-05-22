import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline Conversion CSV Template Checklist",
  description: "A practical checklist for Google Ads offline conversion CSV columns, identifiers, dates, values, and currencies before upload.",
};

const items = [
  ["Identifier", "Use GCLID, GBRAID, WBRAID, email, phone, or address-style user data. Every row needs at least one usable identifier."],
  ["Conversion Name", "Match the conversion action name used in Google Ads. Empty values are a high-risk upload problem."],
  ["Conversion Time", "Use a parseable date and time. Include a timezone such as +08:00 where possible."],
  ["Value and Currency", "Use numeric conversion values and three-letter currency codes such as USD, EUR, GBP, SGD, or JPY."],
  ["Order ID", "Use Order ID when available to reduce duplicate import risk and make troubleshooting easier."],
  ["Duplicates", "Check repeated identifier + conversion name + conversion time combinations before importing."],
];

export default function TemplateChecklistPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Offline Conversion CSV Template Checklist</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">Use this checklist before uploading an offline conversion CSV to Google Ads.</p>
      <div className="mt-10 space-y-5">
        {items.map(([title, body]) => (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{body}</p>
          </section>
        ))}
      </div>
      <a href="/" className="mt-8 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Check a CSV</a>
    </main>
  );
}
