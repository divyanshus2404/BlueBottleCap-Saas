import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bluebottlecap.com';
  const now = new Date();

  // Public, indexable routes only. /dashboard, /create-profile, and
  // /onboarding are intentionally omitted — they require auth, so Google
  // would just see the empty client shell. Tool routes ARE included even
  // though most users won't see them logged-out, because the free-trial
  // flow lives on them and they're our best long-tail SEO bait
  // ("AI handwritten notes scanner India", "JEE diagnostic test", etc.).
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/tools', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/diagnostic', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/scan-notes', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/pdf-editor', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/for-institutes', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/bundles/jee-2026', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/signup', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
