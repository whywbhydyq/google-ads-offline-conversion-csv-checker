import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the browser-local Google Ads Offline Conversion CSV Checker.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Terms of Use</h1>
      <p className="mt-5 text-sm text-slate-500">Last updated: May 22, 2026</p>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Use at your own discretion</h2>
        <p className="mt-3 leading-7 text-slate-700">
          This YmirTool tool is provided as a local preflight checker to help identify common CSV formatting and data quality risks before uploading offline conversions to Google Ads. It is not an official Google product and does not guarantee that an upload will be accepted or attributed.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">No account-level validation</h2>
        <p className="mt-3 leading-7 text-slate-700">
          The checker cannot verify your Google Ads account settings, conversion action ownership, click ownership, import permissions, attribution eligibility, consent configuration, or final Google Ads import results.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">No professional advice</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Output from this tool is informational. You are responsible for reviewing your CSV, following Google Ads policies, handling customer data lawfully, and deciding whether a file is appropriate to upload.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Availability</h2>
        <p className="mt-3 leading-7 text-slate-700">
          The checker may change, become unavailable, or produce imperfect results. Use it as a practical smoke test and keep your own review process for production conversion imports.
        </p>
      </section>
    </main>
  );
}
