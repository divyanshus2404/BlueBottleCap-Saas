import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bluebottlecap.com';

  // Only list routes that actually have a page — including non-existent URLs
  // (which return 404) in the sitemap hurts SEO. Add entries back here as the
  // corresponding pages ship.
  const routes = [
    '',
    '/about',
    '/signup',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
