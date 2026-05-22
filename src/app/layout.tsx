import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ads-csv.ymirtool.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Google Ads Offline Conversion CSV Checker",
    template: "%s | Google Ads Offline Conversion CSV Checker",
  },
  description:
    "Check Google Ads offline conversion CSV files locally before upload. Detect missing headers, invalid times, old GCLIDs, un-hashed user data, duplicates, and formatting issues in your browser.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Google Ads Offline Conversion CSV Checker",
    description: "Browser-local checker for Google Ads offline conversion CSV upload errors.",
    url: siteUrl,
    type: "website",
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
