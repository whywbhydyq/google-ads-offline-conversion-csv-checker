import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ads-csv.ymirtool.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Google Ads Offline Conversion CSV Checker",
  title: {
    default: "Google Ads Offline Conversion CSV Checker | Free Local CSV Validator",
    template: "%s | Google Ads Offline Conversion CSV Checker",
  },
  description:
    "Check Google Ads offline conversion CSV files locally before upload. Find missing headers, invalid conversion times, old GCLIDs, unhashed user data, duplicates, and CSV formatting risks.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Google Ads Offline Conversion CSV Checker | Free Local CSV Validator",
    description:
      "Find common Google Ads offline conversion CSV upload risks locally in your browser before import.",
    url: siteUrl,
    siteName: "Google Ads Offline Conversion CSV Checker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Ads Offline Conversion CSV Checker | Free Local CSV Validator",
    description: "Check offline conversion CSV files locally before uploading to Google Ads.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
