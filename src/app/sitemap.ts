import type { MetadataRoute } from "next";
import { contentDateModified, siteUrl } from "@/lib/site";

type SitemapRoute = {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  lastModified: string;
};

const routes: SitemapRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1, lastModified: contentDateModified },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7, lastModified: contentDateModified },
  { path: "/methodology", changeFrequency: "monthly", priority: 0.72, lastModified: contentDateModified },
  { path: "/about", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-05-24" },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.5, lastModified: contentDateModified },
  { path: "/terms", changeFrequency: "yearly", priority: 0.5, lastModified: "2026-05-22" },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.5, lastModified: "2026-05-24" },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5, lastModified: "2026-05-24" },
  { path: "/guide", changeFrequency: "monthly", priority: 0.8, lastModified: contentDateModified },
  { path: "/guide/google-ads-offline-conversion-upload-errors", changeFrequency: "monthly", priority: 0.85, lastModified: contentDateModified },
  { path: "/guide/google-ads-conversion-time-format", changeFrequency: "monthly", priority: 0.82, lastModified: contentDateModified },
  { path: "/guide/gclid-gbraid-wbraid-offline-conversion-csv", changeFrequency: "monthly", priority: 0.82, lastModified: contentDateModified },
  { path: "/guide/offline-conversion-csv-template-checklist", changeFrequency: "monthly", priority: 0.75, lastModified: contentDateModified },
  { path: "/guide/enhanced-conversions-for-leads-csv-errors", changeFrequency: "monthly", priority: 0.75, lastModified: contentDateModified },
];

function toUtcDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: toUtcDate(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
