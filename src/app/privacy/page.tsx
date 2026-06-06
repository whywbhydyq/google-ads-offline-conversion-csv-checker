import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "See how the browser-local Google Ads offline conversion CSV checker handles files, analytics events, AdSense scripts, and sensitive row data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Privacy Policy</h1>
      <p className="mt-5 text-sm text-slate-500">Last updated: June 6, 2026</p>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Local file processing</h2>
        <p className="mt-3 leading-7 text-slate-700">
          YmirTool designed this checker so CSV files are processed locally in your browser. The checker does not upload your CSV file to our server and does not store row-level conversion data, click IDs, email addresses, phone numbers, order IDs, or conversion values.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Anonymous usage analytics</h2>
        <p className="mt-3 leading-7 text-slate-700">
          We use Vercel Analytics to understand high-level product usage. Tracked events are limited to file selected, sample loaded, sample downloaded, workflow mode selected, check completed, parse failed, result filter changed, result search used, and report downloaded. These events use bucketed counts, fixed sample IDs, workflow labels, filter labels, and status labels only; they do not include uploaded file names, CSV contents, raw row values, search query text, click IDs, emails, phone numbers, order IDs, conversion names, conversion values, or other conversion data.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Third-party scripts and ads</h2>
        <p className="mt-3 leading-7 text-slate-700">
          The site may load Google AdSense after the page becomes idle. Ad scripts do not receive your CSV file, parsed rows, click IDs, email addresses, phone numbers, order IDs, conversion values, or downloaded report contents from this checker. Ad providers may still process browser-level signals according to their own policies.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">No Google Ads account access</h2>
        <p className="mt-3 leading-7 text-slate-700">
          This checker does not ask for Google Ads credentials, does not use OAuth, and does not connect to the Google Ads API.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Contact</h2>
        <p className="mt-3 leading-7 text-slate-700">
          For privacy questions, use the contact page and include a clear description of your request. Do not send sensitive CSV files by email unless you intentionally choose to do so.
        </p>
      </section>
    </main>
  );
}
