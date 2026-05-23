import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ads-csv.ymirtool.com";

const routes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/changelog", changeFrequency: "monthly" as const, priority: 0.55 },
  { path: "/guide", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/guide/google-ads-offline-conversion-upload-errors", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/guide/offline-conversion-csv-template-checklist", changeFrequency: "monthly" as const, priority: 0.75 },
  { path: "/guide/enhanced-conversions-for-leads-csv-errors", changeFrequency: "monthly" as const, priority: 0.75 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
