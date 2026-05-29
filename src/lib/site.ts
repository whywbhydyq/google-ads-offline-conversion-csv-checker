export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ads-csv.ymirtool.com";

export const siteName = "Google Ads Offline Conversion CSV Checker";

export const defaultTitle =
  "Google Ads Offline Conversion CSV Checker";

export const defaultDescription =
  "Check Google Ads offline conversion CSV files locally before upload. Validate required columns, conversion time, GCLID, GBRAID, WBRAID, currency, and common import errors.";
