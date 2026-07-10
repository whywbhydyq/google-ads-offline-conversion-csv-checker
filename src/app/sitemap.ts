import type { MetadataRoute } from 'next';
import { contentDateModified, siteUrl } from '@/lib/site';

type SitemapRoute = {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
};

const routes: SitemapRoute[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/methodology', changeFrequency: 'monthly', priority: 0.72 },
  { path: '/guide', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/guide/google-ads-offline-conversion-upload-errors', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/guide/google-ads-conversion-time-format', changeFrequency: 'monthly', priority: 0.82 },
  { path: '/guide/gclid-gbraid-wbraid-offline-conversion-csv', changeFrequency: 'monthly', priority: 0.82 },
  { path: '/guide/offline-conversion-csv-template-checklist', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/guide/enhanced-conversions-for-leads-csv-errors', changeFrequency: 'monthly', priority: 0.75 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${contentDateModified}T00:00:00.000Z`);
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
