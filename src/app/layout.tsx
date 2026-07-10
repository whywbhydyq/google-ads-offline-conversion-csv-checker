import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AdSenseAutoAds } from "@/components/AdSenseAutoAds";
import { JsonLd } from "@/components/JsonLd";
import { defaultDescription, defaultTitle, organizationId, organizationName, shortSiteName, siteName, siteUrl, socialImagePath, socialImageUrl, websiteId } from "@/lib/site";
import "./globals.css";

const adsenseClientId = "ca-pub-1653188471819736";

const globalJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: organizationName,
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    alternateName: shortSiteName,
    url: siteUrl,
    inLanguage: "en",
    publisher: { "@id": organizationId },
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${shortSiteName}`,
  },
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "Browser-local Google Ads offline conversion CSV checker interface summary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [socialImagePath],
  },
  other: {
    "google-adsense-account": adsenseClientId,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={globalJsonLd} />
        {children}
        <Analytics />
        <AdSenseAutoAds />
      </body>
    </html>
  );
}
