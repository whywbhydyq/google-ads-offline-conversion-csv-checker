import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Ads Offline Conversion Upload Errors: How to Fix Your CSV",
  description:
    "Fix common Google Ads offline conversion CSV upload errors, including missing headers, invalid conversion time, old identifiers, unhashed user data, duplicates, values, and currency problems.",
};

const sections = [
  {
    id: "missing-headers",
    title: "Missing, blank, or duplicated headers",
    body:
      "Offline conversion imports depend on recognizable column headers. A file can look correct in a spreadsheet but still fail because a header is blank, duplicated, misspelled, exported with extra whitespace, or renamed by a CRM export. Start by checking that the file has one header row and that important columns are present: click identifier, Conversion Name, Conversion Time, Conversion Value, Conversion Currency, Order ID, and user-provided data fields when your workflow uses enhanced conversions for leads.",
    fix:
      "Keep one header row, remove duplicated columns, avoid merged spreadsheet cells, and use stable field names. If your CRM exports custom names, map them manually before upload.",
  },
  {
    id: "conversion-time",
    title: "Invalid Conversion Time values",
    body:
      "Conversion Time is one of the most common failure points. Empty values, future timestamps, date-only values, unparseable strings, and timezone-free timestamps can all create import risk. A date-only value may be accepted by a spreadsheet but is ambiguous for an ad import workflow. A timestamp without timezone can also be interpreted differently from what the source system intended.",
    fix:
      "Use a full timestamp such as 2026-05-22 14:30:00+08:00. Keep the timezone consistent with the source system and avoid future timestamps in production uploads.",
  },
  {
    id: "old-identifiers",
    title: "Old click-based conversions",
    body:
      "Very old conversion times are risky for click-based imports. Even when the CSV structure is valid, an old conversion may fall outside the expected import window or may no longer be useful for attribution. This checker flags conversion times more than 90 days old so you can review whether the row belongs in the current upload.",
    fix:
      "Confirm the business event date, source click date, and upload window before importing old rows. If you are backfilling historic CRM data, separate old rows into a dedicated file for review.",
  },
  {
    id: "missing-identifiers",
    title: "Empty click IDs or user identifiers",
    body:
      "Every row needs at least one usable identifier. For click-based imports, that may be a click identifier. For enhanced conversions for leads workflows, that may be email, phone, or address-style user-provided data. Rows without any identifier cannot be matched reliably, even if the conversion name and time are present.",
    fix:
      "Trace the row back to the CRM, form submission, call tracking system, or lead source. If no identifier exists, remove the row from the upload or route it to a different measurement workflow.",
  },
  {
    id: "user-data",
    title: "Unhashed or malformed user-provided data",
    body:
      "Enhanced conversions for leads can involve user-provided data such as email and phone. Depending on your upload workflow, values may need normalization and SHA-256 hashing before upload. Plain-text email, suspicious phone values, and short hash-like strings are strong signals that the export should be reviewed before import.",
    fix:
      "Verify whether your workflow expects raw or hashed user-provided data. When hashing is required, normalize values first, hash with SHA-256, and confirm the output is a 64-character hexadecimal digest.",
  },
  {
    id: "values-currency",
    title: "Invalid values or currency codes",
    body:
      "Conversion Value and Conversion Currency are optional in some workflows but still important for reporting and bidding. Invalid numbers, negative values, comma-formatted amounts, and non-standard currency codes can cause import errors or unreliable reporting. Currency should be a three-letter code such as USD, EUR, GBP, SGD, or JPY.",
    fix:
      "Export values as plain numbers, keep currency codes uppercase, and avoid spreadsheet formatting that turns values into localized text strings.",
  },
  {
    id: "duplicates",
    title: "Duplicate rows and repeated Order IDs",
    body:
      "Duplicate conversion rows can create confusing diagnostics and may lead to repeated import attempts. Repeated Order IDs are especially important to review when your conversion action uses transaction IDs or deduplication logic. A duplicate can be caused by exporting overlapping CRM date ranges or joining multiple source files without deduplication.",
    fix:
      "Deduplicate by identifier, conversion name, conversion time, and Order ID where available. Keep a separate audit copy of removed rows so you can explain what changed.",
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Google Ads Offline Conversion Upload Errors: How to Fix Your CSV</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">Offline conversion import errors are often caused by simple CSV-level problems: missing fields, invalid timestamps, unusable identifiers, unhashed user data, value formatting issues, or duplicate rows. Use this guide as a preflight checklist before uploading a file to Google Ads.</p>
      <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><strong>Important limitation:</strong> this guide and the checker do not connect to Google Ads. They cannot verify conversion action ownership, account permissions, click ownership, consent settings, or final attribution. They only help you catch CSV-level risks before import.</div>
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="quick-triage"><h2 id="quick-triage" className="text-2xl font-bold text-slate-950">Quick triage order</h2><ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-700"><li>Fix file-level problems first: empty file, missing headers, duplicated headers, or missing required columns.</li><li>Fix row-level critical issues: empty conversion names, invalid conversion times, and missing identifiers.</li><li>Review warnings: old conversion times, timezone-free timestamps, suspicious identifiers, invalid values, and duplicate Order IDs.</li><li>Rerun the CSV through the checker, then upload the cleaned file and review official Google Ads diagnostics.</li></ol></section>
      <div className="mt-10 space-y-6">{sections.map((section) => (<section id={section.id} key={section.id} className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-3 leading-7 text-slate-700">{section.body}</p><p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><strong>Fix:</strong> {section.fix}</p></section>))}</div>
      <section className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-6"><h2 className="text-2xl font-bold text-slate-950">Check your CSV before upload</h2><p className="mt-3 leading-7 text-slate-700">Use the free browser-local checker to find missing fields, invalid times, suspicious identifiers, user data issues, duplicate rows, and value formatting problems before import.</p><div className="mt-5 flex flex-wrap gap-3"><a href="/" className="inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a><a href="/guide/offline-conversion-csv-template-checklist" className="inline-flex rounded-full border border-blue-300 px-5 py-3 text-sm font-semibold text-blue-800 hover:bg-white">CSV template checklist</a></div></section>
    </main>
  );
}
