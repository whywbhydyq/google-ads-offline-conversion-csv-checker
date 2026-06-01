import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for the browser-local Google Ads Offline Conversion CSV Checker.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Disclaimer</h1>
      <p className="mt-5 text-sm text-slate-500">Last updated: May 24, 2026</p>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">CSV-level checks only</h2>
        <p className="mt-3 leading-7 text-slate-700">
          This YmirTool checker helps identify common CSV formatting and data quality issues before Google Ads upload. It is not affiliated with Google and does not verify account settings, conversion action ownership, click ownership, policy status, customer data terms, import preview results, or attribution.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Use with Google Ads preview</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Use the report as a practical review aid, then preview and verify the corrected file in Google Ads before applying an import.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">No professional advice</h2>
        <p className="mt-3 leading-7 text-slate-700">
          The output is informational and is not legal, advertising, tax, or compliance advice.
        </p>
      </section>
    </main>
  );
}
