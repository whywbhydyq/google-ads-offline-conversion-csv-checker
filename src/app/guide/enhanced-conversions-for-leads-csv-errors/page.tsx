import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enhanced Conversions for Leads CSV Errors",
  description: "Fix common enhanced conversions for leads CSV issues, including plain-text email, phone format, SHA-256 hash length, and missing user data.",
};

const sections = [
  {
    title: "Plain-text email values",
    body: "If your upload workflow expects hashed user-provided data, plain email addresses should be normalized and hashed before upload. The checker flags plain-text email values so you can review the workflow before importing.",
  },
  {
    title: "Phone formatting issues",
    body: "Phone values should be consistently normalized. When plain text is used, E.164-style formatting is usually easier to audit. Suspicious phone values such as words, short numbers, or broken strings should be fixed before upload.",
  },
  {
    title: "Broken SHA-256 hashes",
    body: "A SHA-256 hex digest should be 64 hexadecimal characters. Short hash-like strings are often caused by truncation, wrong hashing code, or exporting the wrong CRM field.",
  },
  {
    title: "Missing identifiers",
    body: "Every row should include at least one useful identifier such as a click ID, email, phone, or address-style user data. Rows with no identifier cannot be matched reliably.",
  },
  {
    title: "Address-style user data",
    body: "If you use name and address fields, include country and postal code when available. Partial address data is harder to match and should be reviewed before import.",
  },
];

export default function EnhancedConversionsGuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <a href="/guide" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to guides</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Enhanced Conversions for Leads CSV Errors</h1>
      <p className="mt-5 text-lg leading-8 text-slate-700">Use this guide to review user-provided data problems before importing enhanced conversions for leads.</p>
      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950">Check before upload</h2>
        <p className="mt-3 leading-7 text-slate-700">The browser-local checker can flag email, phone, hash-like values, missing identifiers, duplicate rows, and conversion-time issues without uploading your CSV to a server.</p>
        <a href="/" className="mt-5 inline-flex rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Open the checker</a>
      </div>
    </main>
  );
}
