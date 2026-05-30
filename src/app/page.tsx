import { CheckerApp } from "@/components/CheckerApp";
import { JsonLd } from "@/components/JsonLd";
import { defaultDescription, defaultTitle, siteName, siteUrl } from "@/lib/site";

const supportedColumns = [
  "Google Click ID, GBRAID, and WBRAID",
  "Conversion Name",
  "Conversion Time",
  "Conversion Value",
  "Conversion Currency",
  "Order ID",
  "Email, phone, and address-style user data",
  "Ad User Data and Ad Personalization consent fields",
  "SHA-256 hash-like user data fields",
];

const detectedChecks = [
  "Missing, blank, or duplicated headers",
  "Broken row structure caused by commas or quotes",
  "Missing conversion names or conversion times",
  "Future, old, date-only, timezone-less, timezone-ID, or unparseable conversion times",
  "Missing click IDs or user identifiers",
  "GCLID, GBRAID, WBRAID, and mixed-identifier workflow risks",
  "Plain-text email, phone, name, and street address risks for user-data review",
  "Invalid SHA-256 hash-like values",
  "Invalid consent values and ISO 4217 currency risks",
  "Duplicate conversion and Order ID risks",
];

const resultSteps = [
  {
    title: "Start with critical issues",
    body: "Critical issues usually indicate rows that may fail import or match poorly, such as missing identifiers, missing conversion names, invalid conversion times, or broken user data values.",
  },
  {
    title: "Review warnings before previewing in Google Ads",
    body: "Warnings can still matter for match quality and reporting accuracy. Check old click IDs, timezone-less timestamps, suspicious phone values, duplicate Order IDs, and unusual value or currency fields.",
  },
  {
    title: "Download the report for row-level fixes",
    body: "The issue report contains the row number, field, message, current value, and suggested fix. Use it as a working checklist before you preview the corrected file in Google Ads.",
  },
];

const faqPreview = [
  {
    question: "Does the checker upload my CSV?",
    answer: "No. CSV parsing and validation happen locally in your browser. The checker does not upload your file to a server or store row-level conversion data.",
  },
  {
    question: "Can it guarantee that Google Ads will accept my upload?",
    answer: "No. This is a CSV-level preflight checker. Google Ads can still reject or ignore rows because of account settings, conversion action ownership, click ownership, customer data terms, or attribution eligibility.",
  },
  {
    question: "Does it support enhanced conversions for leads?",
    answer: "It can flag CSV-level user-data risks such as plain-text emails, suspicious phone values, address hashing issues, missing identifiers, invalid consent values, and broken SHA-256 hash-like values. It does not replace Google Ads Data Manager or final Google Ads preview validation.",
  },
];

const homepageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any modern web browser",
    browserRequirements: "Requires JavaScript and local browser file access for CSV parsing.",
    description: defaultDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: detectedChecks,
    isAccessibleForFree: true,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPreview.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    mainEntity: {
      "@type": "WebApplication",
      name: siteName,
      url: siteUrl,
    },
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <JsonLd data={homepageJsonLd} />
      <CheckerApp />
      <StaticSeoContent />
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-slate-200 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>Built for quick CSV preflight checks before Google Ads upload.</p>
        <div className="flex flex-wrap gap-4">
          <a href="/faq" className="font-medium text-blue-700 hover:text-blue-900">FAQ</a>
          <a href="/guide" className="font-medium text-blue-700 hover:text-blue-900">Guides</a>
          <a href="/privacy" className="font-medium text-blue-700 hover:text-blue-900">Privacy</a>
          <a href="/terms" className="font-medium text-blue-700 hover:text-blue-900">Terms</a>
          <a href="/disclaimer" className="font-medium text-blue-700 hover:text-blue-900">Disclaimer</a>
          <a href="/contact" className="font-medium text-blue-700 hover:text-blue-900">Contact</a>
        </div>
      </footer>
    </main>
  );
}

function StaticSeoContent() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16" aria-labelledby="csv-checker-guide">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">CSV upload preflight guide</p>
        <h2 id="csv-checker-guide" className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Check common Google Ads offline conversion CSV problems before upload
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
          This free checker is designed for advertisers, PPC operators, agencies, and local service teams that prepare offline conversion imports. It focuses on CSV-level risks that are easier to catch before opening Google Ads: missing columns, malformed rows, invalid conversion timestamps, weak identifiers, duplicate conversion records, consent values, ISO currency issues, and user data formatting issues.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="what-it-checks">
          <h2 id="what-it-checks" className="text-2xl font-bold text-slate-950">What it checks</h2>
          <p className="mt-3 leading-7 text-slate-700">
            The checker scans the structure and values in your CSV, then groups findings by severity so you can fix the riskiest rows first.
          </p>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
            {detectedChecks.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            For a deeper troubleshooting walkthrough, read the <a href="/guide/google-ads-offline-conversion-upload-errors" className="font-semibold text-blue-700 hover:text-blue-900">Google Ads offline conversion upload error guide</a>.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="supported-columns">
          <h2 id="supported-columns" className="text-2xl font-bold text-slate-950">Supported columns</h2>
          <p className="mt-3 leading-7 text-slate-700">
            The tool auto-detects common Google Ads offline conversion, click-ID upload, and user-data preflight fields. Column names do not have to be perfect, but recognizable headers make the report more useful.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {supportedColumns.map((column) => (
              <span key={column} className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">{column}</span>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Use the <a href="/guide/offline-conversion-csv-template-checklist" className="font-semibold text-blue-700 hover:text-blue-900">offline conversion CSV template checklist</a> to review required identifiers, conversion names, timestamps, values, currency codes, and Order IDs before import.
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="how-to-read-results">
        <h2 id="how-to-read-results" className="text-2xl font-bold text-slate-950">How to read the results</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {resultSteps.map((step) => (
            <article key={step.title} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-bold text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm" aria-labelledby="what-it-cannot-verify">
        <h2 id="what-it-cannot-verify" className="text-2xl font-bold text-slate-950">What it cannot verify</h2>
        <p className="mt-3 leading-7 text-amber-950">
          This checker does not connect to Google Ads, does not use OAuth, and does not call the Google Ads API. It cannot verify conversion action ownership, account-level settings, click ownership, MCC permissions, customer data terms, import preview status, or final attribution. Treat it as a local CSV smoke test, then preview the corrected file in Google Ads before applying the upload.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="faq-preview">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="faq-preview" className="text-2xl font-bold text-slate-950">FAQ preview</h2>
            <p className="mt-3 leading-7 text-slate-700">Common questions about privacy, scope, and enhanced conversions support.</p>
          </div>
          <a href="/faq" className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Read full FAQ</a>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faqPreview.map((item) => (
            <article key={item.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-950">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
