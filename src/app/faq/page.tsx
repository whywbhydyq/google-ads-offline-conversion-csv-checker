import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Google Ads Offline Conversion CSV Checker FAQ",
  description: "Answers about local CSV processing, supported files, enhanced conversions limits, report downloads, privacy, and final Google Ads validation.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    question: "Is my CSV uploaded to your server?",
    answer: "No. The file is processed locally in your browser. The checker does not upload your CSV file to a server and does not store row data.",
  },
  {
    question: "Is this an official Google tool?",
    answer: "No. This is an independent CSV preflight checker. It is not an official Google product and is not affiliated with Google.",
  },
  {
    question: "Can this guarantee my Google Ads upload will succeed?",
    answer: "No. It checks CSV-level issues only. Google Ads account settings, conversion action ownership, click ownership, MCC permissions, customer data terms, and final attribution must still be checked inside Google Ads.",
  },
  {
    question: "Does it support Enhanced Conversions for Leads?",
    answer: "It supports local CSV-level checks for user-provided data risks, such as invalid email format, suspicious phone values, plain-text values in pre-hashed workflows, incomplete address data, consent values, and invalid SHA-256 hash-like values. It is not a Google Ads Data Manager schema validator and does not verify final matching.",
  },
  {
    question: "Can it fix my CSV automatically?",
    answer: "The first version generates a report and clear suggested fixes. Auto-fix and hash-export workflows are intentionally kept out of the MVP.",
  },
  {
    question: "What file types are supported?",
    answer: "The MVP supports UTF-8 CSV files with a header row, comma delimiter, and a suggested maximum size of 10MB. XLSX files and Google Sheets URLs are not supported in v1.",
  },
];

const faqJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
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
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: `${siteUrl}/faq`,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Google Ads Offline Conversion CSV Checker FAQ | ${siteName}`,
    description: metadata.description,
    url: `${siteUrl}/faq`,
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={faqJsonLd} />
      <a href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to checker</a>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">Google Ads Offline Conversion CSV Checker FAQ</h1>
      <p className="mt-4 text-lg leading-8 text-slate-700">
        Common questions about privacy, independence, scope, supported files, and what this Google Ads offline conversion CSV checker can and cannot verify.
      </p>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <section key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{faq.question}</h2>
            <p className="mt-3 leading-7 text-slate-700">{faq.answer}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
