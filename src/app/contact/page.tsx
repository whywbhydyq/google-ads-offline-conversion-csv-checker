import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact page for feedback about the Google Ads Offline Conversion CSV Checker.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Contact</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">
        Use this page for feedback, bug reports, and feature requests about the Google Ads Offline Conversion CSV Checker.
      </p>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Before sending feedback</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Please do not send sensitive CSV files, customer emails, phone numbers, click IDs, order IDs, or conversion values unless you intentionally choose to share them. A small redacted example is usually enough for debugging.
        </p>
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">What to include in a bug report</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
          <li>What you expected the checker to report.</li>
          <li>What it actually reported.</li>
          <li>A redacted header row and one or two redacted sample rows if the issue depends on CSV structure.</li>
          <li>Your browser and operating system if the upload or download button did not work.</li>
        </ul>
      </section>
      <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Feedback channel</h2>
        <p className="mt-3 leading-7 text-slate-700">
          For now, use the GitHub repository issue tracker or your normal project feedback channel. A dedicated support email can be added after the domain and brand are finalized.
        </p>
      </section>
    </main>
  );
}
