import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AdSenseAutoAds } from "@/components/AdSenseAutoAds";
import { defaultDescription, defaultTitle, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const adsenseClientId = "ca-pub-1653188471819736";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: defaultTitle,
    description: "Browser-local preflight checker for Google Ads offline conversion CSV upload errors.",
    url: siteUrl,
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: "Check CSV-level upload risks locally before importing offline conversions into Google Ads.",
  },
  other: {
    "google-adsense-account": adsenseClientId,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <AdSenseAutoAds />
      </body>
    </html>
  );
}
