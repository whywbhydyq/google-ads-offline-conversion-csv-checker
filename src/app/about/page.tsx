import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the browser-local Google Ads Offline Conversion CSV Checker and its privacy-first scope.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">About this checker</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">
        Google Ads Offline Conversion CSV Checker is an independent browser-local preflight tool for advertisers, PPC operators, agencies, and local service teams that upload offline conversion data to Google Ads.
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        It is not an official Google product and is not affiliated with Google.
      </p>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Why it exists</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Offline conversion uploads often fail for preventable CSV-level reasons: missing headers, invalid conversion times, old click IDs, un-hashed user data, duplicate rows, or malformed value and currency fields. This tool catches those issues before you upload.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Privacy-first scope</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Files are processed in your browser. The checker does not require a Google Ads login, does not connect to the Google Ads API, and does not upload or store your CSV file on a server.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">What it cannot verify</h2>
        <p className="mt-3 leading-7 text-slate-700">
          It cannot confirm conversion action ownership, account-level settings, click ownership, MCC permissions, attribution eligibility, or final import status inside Google Ads. Treat it as a local smoke test, not a replacement for Google Ads validation.
        </p>
      </section>
    </main>
  );
}
