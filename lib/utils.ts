import { categories, collections, games, platforms } from '@/lib/sample-data';

export const getGameBySlug = (slug: string) => games.find((game) => game.slug === slug);
export const getCategoryBySlug = (slug: string) => categories.find((category) => category.slug === slug);
export const getCollectionGames = (slug: string) => {
  const collection = collections.find((item) => item.slug === slug);
  return games.filter((game) => collection?.gameSlugs.includes(game.slug));
};

export const getGamesByCategory = (slug: string) => games.filter((game) => game.categories.includes(slug));

export const getRelatedGames = (slug: string, count = 3) => {
  const current = getGameBySlug(slug);
  if (!current) return [];

  return games
    .filter((game) => game.slug !== slug)
    .map((game) => ({
      game,
      score: game.categories.filter((category) => current.categories.includes(category)).length + game.tags.filter((tag) => current.tags.includes(tag)).length
    }))
    .sort((a, b) => b.score - a.score || b.game.popularity - a.game.popularity)
    .slice(0, count)
    .map((entry) => entry.game);
};

export const getPlatformName = (slug: string) => platforms.find((platform) => platform.slug === slug)?.name ?? slug;
export const getCategoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
