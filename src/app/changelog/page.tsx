import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validation Rule Changelog",
  description: "Track updates to the offline conversion CSV checker validation rules, page content, and known limitations.",
};

const entries = [
  {
    date: "2026-05-23",
    title: "Homepage SEO and validation guidance upgrade",
    changes: [
      "Improved homepage metadata and structured data.",
      "Unified canonical, robots, and sitemap fallback URLs.",
      "Added homepage validation guidance, limitations, and FAQ content.",
      "Added result guidance for fixing critical issues first.",
      "Added more analytics events for upload, check, filter, search, report, FAQ, and guide interactions.",
    ],
  },
  {
    date: "2026-05-23",
    title: "Guide content expansion",
    changes: [
      "Expanded the upload error guide with more detailed triage steps.",
      "Clarified that the checker is a browser-local preflight tool and not an official account-level validator.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Validation Rule Changelog</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">This page records visible content, SEO, analytics, and validation-rule changes so users can understand when the checker was last reviewed and what changed.</p>
      <div className="mt-10 space-y-6">
        {entries.map((entry) => (
          <article key={`${entry.date}-${entry.title}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">{entry.date}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{entry.title}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-700">{entry.changes.map((change) => <li key={change}>{change}</li>)}</ul>
          </article>
        ))}
      </div>
      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Review policy</h2>
        <p className="mt-3 leading-7 text-slate-800">Validation rules should be reviewed when import workflows, field names, browser parsing behavior, or common advertiser CSV patterns change. This checker remains a preflight tool and does not verify account-level settings.</p>
      </section>
    </main>
  );
}
