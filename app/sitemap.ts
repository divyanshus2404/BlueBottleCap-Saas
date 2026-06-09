import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bluebottlecap.com';

  const routes = [
    '',
    '/about',
    '/pricing',
    '/study-material',
    '/tools',
    '/btech-study-planner',
    '/engineering-flashcard-maker',
    '/jee-question-generator',
    '/seniors'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
