import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
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
        <DeferredAdsenseScript />
      </body>
    </html>
  );
}

function DeferredAdsenseScript() {
  const script = `
(function () {
  var loaded = false;
  function loadAdsense() {
    if (loaded || document.querySelector('script[data-ads-csv-adsense="true"]')) return;
    loaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.adsCsvAdsense = 'true';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}';
    document.head.appendChild(script);
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadAdsense, { timeout: 5000 });
  } else {
    window.setTimeout(loadAdsense, 3500);
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
