import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/src/data/blogPosts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bluebottlecap.com';
  const now = new Date();

  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/tools', priority: 0.95, changeFrequency: 'weekly' },
    { path: '/mock-test', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/question-bank', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/previous-year-papers', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/flashcards', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/study-timer', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/diagnostic', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/scan-notes', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/pdf-editor', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/for-institutes', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/bundles/jee-2026', priority: 0.85, changeFrequency: 'weekly' },
    { path: '/tour', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/my-progress', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/signup', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const staticPages = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const blogPages = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}
