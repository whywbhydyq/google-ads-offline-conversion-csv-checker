export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ads-csv.ymirtool.com";

export const siteName = "Google Ads Offline Conversion CSV Checker";

export const defaultTitle =
  "Free Google Ads Offline Conversion CSV Checker | Local Upload Error Preflight";

export const defaultDescription =
  "Check CSV-level Google Ads offline conversion upload risks locally before preview: headers, time formats, click IDs, consent fields, user-data hash risks, duplicates, value, and currency.";
