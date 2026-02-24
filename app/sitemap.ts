import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://betting.example.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/app/markets`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/app/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/app/rules`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  let marketRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/markets?size=500&status=OPEN`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      marketRoutes = (data.data?.content || []).map(
        (m: { id: string; slug: string; updatedAt: string }) => ({
          url: `${baseUrl}/app/markets/${m.id}`,
          lastModified: new Date(m.updatedAt),
          changeFrequency: 'hourly' as const,
          priority: 0.8,
        })
      );
    }
  } catch {
    /* silently skip if backend unavailable */
  }

  return [...staticRoutes, ...marketRoutes];
}
