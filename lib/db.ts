import { createClient } from '@/lib/supabase/server';

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Platform = {
  id: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type GameImage = {
  id: string;
  image_url: string;
  sort_order?: number | null;
  created_at?: string | null;
};

export type GameLink = {
  id: string;
  label?: string | null;
  link_type?: string | null;
  url: string;
  created_at?: string | null;
};

export type Game = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  developer?: string | null;
  publisher?: string | null;
  release_date?: string | null;
  release_type?: string | null;
  price_type?: string | null;
  thumbnail?: string | null;
  banner_image?: string | null;
  featured?: boolean | null;
  trending?: boolean | null;
  new_arrival?: boolean | null;
  official_badge?: boolean | null;
  created_at?: string | null;
  categories?: Category[];
  platforms?: Platform[];
  tags?: Tag[];
  screenshots?: GameImage[];
  links?: GameLink[];
};

function flattenCategories(rows: any[] | null | undefined): Category[] {
  return (rows ?? [])
    .map((item) => item?.categories)
    .filter(Boolean)
    .map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
}

function flattenPlatforms(rows: any[] | null | undefined): Platform[] {
  return (rows ?? [])
    .map((item) => item?.platforms)
    .filter(Boolean)
    .map((platform: any) => ({
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
    }));
}

function flattenTags(rows: any[] | null | undefined): Tag[] {
  return (rows ?? [])
    .map((item) => item?.tags)
    .filter(Boolean)
    .map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }));
}

function flattenLinks(rows: any[] | null | undefined): GameLink[] {
  return (rows ?? [])
    .filter(Boolean)
    .map((link: any) => ({
      id: link.id,
      label: link.label ?? null,
      link_type: link.link_type ?? null,
      url: link.url,
      created_at: link.created_at ?? null,
    }));
}

function normalizeGame(row: any): Game {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    short_description: row.short_description ?? null,
    long_description: row.long_description ?? null,
    developer: row.developer ?? null,
    publisher: row.publisher ?? null,
    release_date: row.release_date ?? null,
    release_type: row.release_type ?? null,
    price_type: row.price_type ?? null,
    thumbnail: row.thumbnail ?? null,
    banner_image: row.banner_image ?? null,
    featured: row.featured ?? false,
    trending: row.trending ?? false,
    new_arrival: row.new_arrival ?? false,
    official_badge: row.official_badge ?? false,
    created_at: row.created_at ?? null,
    categories: flattenCategories(row.game_categories),
    platforms: flattenPlatforms(row.game_platforms),
    tags: flattenTags(row.game_tags),
    links: flattenLinks(row.game_links),
  };
}

const GAME_SELECT = `
  id,
  title,
  slug,
  short_description,
  long_description,
  developer,
  publisher,
  release_date,
  release_type,
  price_type,
  thumbnail,
  banner_image,
  featured,
  trending,
  new_arrival,
  official_badge,
  created_at,
  game_categories (
    categories (
      id,
      name,
      slug
    )
  ),
  game_platforms (
    platforms (
      id,
      name,
      slug
    )
  ),
  game_tags (
    tags (
      id,
      name,
      slug
    )
  ),
  game_links (
    id,
    label,
    link_type,
    url,
    created_at
  )
`;

export async function getGames(limit?: number): Promise<Game[]> {
  const supabase = await createClient();

  let query = supabase
    .from('games')
    .select(GAME_SELECT)
    .order('created_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return (data ?? []).map(normalizeGame);
}

export async function getFeaturedGames(limit = 8): Promise<Game[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('games')
    .select(GAME_SELECT)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured games:', error);
    return [];
  }

  return (data ?? []).map(normalizeGame);
}

export async function getTrendingGames(limit = 8): Promise<Game[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('games')
    .select(GAME_SELECT)
    .eq('trending', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending games:', error);
    return [];
  }

  return (data ?? []).map(normalizeGame);
}

export async function getNewArrivals(limit = 8): Promise<Game[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('games')
    .select(GAME_SELECT)
    .eq('new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }

  return (data ?? []).map(normalizeGame);
}

export async function getCategories(limit?: number): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));
}

export async function getPlatforms(limit?: number): Promise<Platform[]> {
  const supabase = await createClient();

  let query = supabase
    .from('platforms')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));
}

export async function getTags(limit?: number): Promise<Tag[]> {
  const supabase = await createClient();

  let query = supabase
    .from('tags')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('games')
    .select(GAME_SELECT)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching game by slug:', error);
    return null;
  }

  const game = normalizeGame(data);

  const { data: screenshots } = await supabase
    .from('game_images')
    .select('id, image_url, sort_order, created_at')
    .eq('game_id', game.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  game.screenshots = screenshots ?? [];

  return game;
}