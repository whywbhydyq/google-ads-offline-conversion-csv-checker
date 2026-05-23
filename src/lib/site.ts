export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ads-csv.ymirtool.com";

export const siteName = "Google Ads Offline Conversion CSV Checker";

export const defaultTitle =
  "Free Google Ads Offline Conversion CSV Checker | Local Upload Error Preflight";

export const defaultDescription =
  "Check Google Ads offline conversion CSV files locally before upload. Find missing headers, invalid conversion times, old GCLIDs, unhashed user data, duplicate rows, value and currency issues, and download a fix report.";
