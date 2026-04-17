import type { MetadataRoute } from 'next';
import { getGames, getCategories } from '@/lib/db';
import { siteConfig } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getGames();
  const categories = await getCategories();

  const routes = [
    '',
    '/browse',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/dmca'
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date()
  }));

  const gameRoutes = games.map((game: any) => ({
    url: `${siteConfig.url}/games/${game.slug}`,
    lastModified: new Date(
      game.releaseDate ?? game.release_date ?? Date.now()
    )
  }));

  const categoryRoutes = categories.map((category: any) => ({
    url: `${siteConfig.url}/categories/${category.slug}`,
    lastModified: new Date()
  }));

  return [...routes, ...gameRoutes, ...categoryRoutes];
}