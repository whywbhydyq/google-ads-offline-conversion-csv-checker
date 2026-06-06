export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ads-csv.ymirtool.com";

export const siteName = "Google Ads Offline Conversion CSV Checker";
export const shortSiteName = "Ads CSV Checker";
export const organizationName = "YmirTool";
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const webApplicationId = `${siteUrl}/#web-application`;
export const methodologyId = `${siteUrl}/methodology#methodology`;
export const socialImagePath = "/opengraph-image.png";
export const socialImageUrl = `${siteUrl}${socialImagePath}`;

export const contentLastUpdated = "June 6, 2026";
export const contentDateModified = "2026-06-06";

export const defaultTitle = "Free Google Ads Offline Conversion CSV Checker";

export const defaultDescription =
  "Check Google Ads offline conversion CSV files locally before upload. Find header, time, click ID, user-data, consent, duplicate, value, and currency risks.";
