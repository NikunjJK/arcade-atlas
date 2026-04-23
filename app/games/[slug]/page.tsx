import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarDays,
  ExternalLink,
  Layers3,
  Monitor,
  PlayCircle,
  Tag,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import ScreenshotGallery from '@/components/screenshot-gallery';
import TrackedLink from '@/components/tracked-link';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type LinkRow = {
  id: string;
  label?: string | null;
  url: string;
  link_type?: string | null;
  created_at?: string | null;
};

function formatReleaseDate(date: string | null) {
  if (!date) return 'TBA';

  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
    }

    return null;
  } catch {
    return null;
  }
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes('vimeo.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];

    if (!id || !/^\d+$/.test(id)) return null;

    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1`;
  } catch {
    return null;
  }
}

function getTrailerLink(links: LinkRow[]) {
  return (
    links.find((link) => {
      const type = (link.link_type || '').toLowerCase();
      const label = (link.label || '').toLowerCase();
      const url = (link.url || '').toLowerCase();

      return (
        type.includes('trailer') ||
        type.includes('video') ||
        label.includes('trailer') ||
        label.includes('video') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com')
      );
    }) || null
  );
}

function getTrailerEmbedUrl(links: LinkRow[]) {
  const trailerLikeLink = getTrailerLink(links);

  if (!trailerLikeLink) return null;

  const youtube = getYoutubeEmbedUrl(trailerLikeLink.url);
  if (youtube) {
    return {
      embedUrl: youtube,
      sourceUrl: trailerLikeLink.url,
      label: trailerLikeLink.label || 'Watch Trailer',
      linkId: trailerLikeLink.id,
    };
  }

  const vimeo = getVimeoEmbedUrl(trailerLikeLink.url);
  if (vimeo) {
    return {
      embedUrl: vimeo,
      sourceUrl: trailerLikeLink.url,
      label: trailerLikeLink.label || 'Watch Trailer',
      linkId: trailerLikeLink.id,
    };
  }

  return null;
}

async function getGameData(slug: string) {
  const supabase = await createClient();

  const { data: game, error } = await supabase
    .from('games')
    .select(
      `
      *,
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
      )
    `
    )
    .eq('slug', slug)
    .single();

  if (error || !game) {
    return null;
  }

  const { data: screenshots } = await supabase
    .from('game_images')
    .select('id, image_url, sort_order, created_at')
    .eq('game_id', game.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  const { data: gameLinks } = await supabase
    .from('game_links')
    .select('*')
    .eq('game_id', game.id)
    .order('created_at', { ascending: true });

  return {
    game,
    screenshots: screenshots ?? [],
    gameLinks: (gameLinks as LinkRow[]) ?? [],
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGameData(slug);

  if (!result) {
    return {
      title: 'Game Not Found | Arcade Atlas',
      description: 'The requested game page could not be found on Arcade Atlas.',
    };
  }

  const { game, screenshots } = result;

  const description =
    game.short_description ||
    game.long_description ||
    `Explore screenshots, platforms, links, and release details for ${game.title} on Arcade Atlas.`;

  const image =
    game.banner_image || game.thumbnail || screenshots[0]?.image_url || null;

  return {
    title: `${game.title} | Arcade Atlas`,
    description,
    alternates: {
      canonical: `/games/${game.slug}`,
    },
    openGraph: {
      title: `${game.title} | Arcade Atlas`,
      description,
      url: `/games/${game.slug}`,
      siteName: 'Arcade Atlas',
      type: 'website',
      images: image
        ? [
            {
              url: image,
              alt: game.title,
            },
          ]
        : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${game.title} | Arcade Atlas`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getGameData(slug);

  if (!result) {
    notFound();
  }

  const { game, screenshots, gameLinks } = result;

  const categories =
    game.game_categories
      ?.map((item: any) => item.categories)
      .filter(Boolean) ?? [];

  const platforms =
    game.game_platforms
      ?.map((item: any) => item.platforms)
      .filter(Boolean) ?? [];

  const tags =
    game.game_tags
      ?.map((item: any) => item.tags)
      .filter(Boolean) ?? [];

  const badgeList = [
    game.featured ? 'Featured' : null,
    game.trending ? 'Trending' : null,
    game.new_arrival ? 'New Arrival' : null,
    game.official_badge ? 'Official' : null,
  ].filter(Boolean);

  const trailer = getTrailerEmbedUrl(gameLinks);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-2xl">
          {game.banner_image ? (
            <div className="relative h-56 w-full md:h-80 lg:h-[26rem]">
              <Image
                src={game.banner_image}
                alt={game.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            </div>
          ) : (
            <div className="h-56 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 md:h-80 lg:h-[26rem]" />
          )}

          <div className="relative -mt-16 px-4 pb-8 md:px-8">
            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl">
                  <div className="relative aspect-[3/4] w-full bg-zinc-800">
                    {game.thumbnail ? (
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 280px, 320px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                        No cover image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 lg:pt-12">
                <div className="mb-4 flex flex-wrap gap-2">
                  {badgeList.map((badge) => (
                    <span
                      key={badge as string}
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                  {game.title}
                </h1>

                {game.short_description && (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 md:text-lg">
                    {game.short_description}
                  </p>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                      <CalendarDays className="h-4 w-4" />
                      Release Date
                    </div>
                    <div className="text-sm font-medium text-white">
                      {formatReleaseDate(game.release_date)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                      <Layers3 className="h-4 w-4" />
                      Release Type
                    </div>
                    <div className="text-sm font-medium capitalize text-white">
                      {game.release_type || 'N/A'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                      <Tag className="h-4 w-4" />
                      Price Type
                    </div>
                    <div className="text-sm font-medium capitalize text-white">
                      {game.price_type || 'N/A'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                      <Monitor className="h-4 w-4" />
                      Developer
                    </div>
                    <div className="text-sm font-medium text-white">
                      {game.developer || 'Unknown'}
                    </div>
                  </div>
                </div>

                {gameLinks && gameLinks.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {gameLinks.map((link: any) => (
                      <TrackedLink
                        key={link.id}
                        href={link.url}
                        gameId={game.id}
                        linkId={link.id}
                        eventType="detail_outbound_click"
                        pathname={`/games/${game.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        <>
                          {link.label || link.link_type || 'Visit Link'}
                          <ExternalLink className="h-4 w-4" />
                        </>
                      </TrackedLink>
                    ))}
                  </div>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {platforms.length > 0 ? (
                        platforms.map((platform: any) => (
                          <Link
                            key={platform.id}
                            href={`/browse?platform=${platform.slug}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white/10"
                          >
                            {platform.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">No platforms</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.length > 0 ? (
                        categories.map((category: any) => (
                          <Link
                            key={category.id}
                            href={`/browse?category=${category.slug}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white/10"
                          >
                            {category.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">No categories</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.map((tag: any) => (
                          <Link
                            key={tag.id}
                            href={`/browse?tag=${tag.slug}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200 transition hover:bg-white/10"
                          >
                            {tag.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {trailer && (
              <section className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Trailer</h2>
                  <TrackedLink
                    href={trailer.sourceUrl}
                    gameId={game.id}
                    linkId={trailer.linkId}
                    eventType="trailer_click"
                    pathname={`/games/${game.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    <>
                      {trailer.label}
                      <ExternalLink className="h-4 w-4" />
                    </>
                  </TrackedLink>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-3 shadow-xl">
                  <div className="relative overflow-hidden rounded-xl bg-black">
                    <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      <PlayCircle className="h-4 w-4" />
                      Video Preview
                    </div>

                    <div className="relative aspect-video w-full">
                      <iframe
                        src={trailer.embedUrl}
                        title={`${game.title} trailer`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {screenshots && screenshots.length > 0 && (
              <ScreenshotGallery screenshots={screenshots} gameTitle={game.title} />
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
                <h2 className="mb-4 text-2xl font-semibold text-white">About This Game</h2>
                {game.long_description ? (
                  <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-li:text-zinc-300">
                    <p className="whitespace-pre-line leading-8 text-zinc-300">
                      {game.long_description}
                    </p>
                  </div>
                ) : (
                  <p className="text-zinc-400">No detailed description available yet.</p>
                )}
              </div>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold text-white">Game Info</h3>

                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-zinc-500">Title</div>
                      <div className="mt-1 text-zinc-200">{game.title}</div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Developer</div>
                      <div className="mt-1 text-zinc-200">{game.developer || 'Unknown'}</div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Publisher</div>
                      <div className="mt-1 text-zinc-200">{game.publisher || 'Unknown'}</div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Release Date</div>
                      <div className="mt-1 text-zinc-200">
                        {formatReleaseDate(game.release_date)}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Price Type</div>
                      <div className="mt-1 capitalize text-zinc-200">
                        {game.price_type || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Release Type</div>
                      <div className="mt-1 capitalize text-zinc-200">
                        {game.release_type || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {gameLinks && gameLinks.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
                    <h3 className="mb-4 text-lg font-semibold text-white">Official Links</h3>

                    <div className="space-y-3">
                      {gameLinks.map((link: any) => (
                        <TrackedLink
                          key={link.id}
                          href={link.url}
                          gameId={game.id}
                          linkId={link.id}
                          eventType="sidebar_outbound_click"
                          pathname={`/games/${game.slug}`}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/10"
                        >
                          <>
                            <span>{link.label || link.link_type || 'Visit Link'}</span>
                            <ExternalLink className="h-4 w-4 text-zinc-400" />
                          </>
                        </TrackedLink>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}