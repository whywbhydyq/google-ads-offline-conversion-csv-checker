import { CheckerApp } from "@/components/CheckerApp";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ads-csv.ymirtool.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: "Google Ads Offline Conversion CSV Checker",
      url: `${siteUrl}/`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web browser",
      browserRequirements: "Requires JavaScript. CSV files are processed locally in the browser.",
      isAccessibleForFree: true,
      description:
        "A browser-local checker for Google Ads offline conversion CSV files. It detects missing headers, invalid conversion times, old or empty click IDs, unhashed user data, duplicates, and formatting risks before upload.",
      featureList: [
        "Local CSV parsing",
        "Missing header detection",
        "Conversion time validation",
        "GCLID, GBRAID, and WBRAID checks",
        "Enhanced conversions for leads CSV checks",
        "Duplicate row risk detection",
        "CSV issue report download",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "Ymir Tool",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "CSV Checker",
          item: `${siteUrl}/`,
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CheckerApp />
    </>
  );
}
