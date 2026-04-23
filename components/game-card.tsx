import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import TrackedLink from '@/components/tracked-link';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Platform = {
  id: string;
  name: string;
  slug: string;
};

type GameLink = {
  id: string;
  label?: string | null;
  link_type?: string | null;
  url: string;
};

type GameCardProps = {
  game: {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    thumbnail?: string | null;
    banner_image?: string | null;
    featured?: boolean | null;
    trending?: boolean | null;
    new_arrival?: boolean | null;
    official_badge?: boolean | null;
    price_type?: string | null;
    categories?: Category[];
    platforms?: Platform[];
    links?: GameLink[];
  };
};

function normalizeText(value: unknown) {
  if (typeof value === 'string') return value.toLowerCase().trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase().trim();
  }
  return '';
}

function getOfficialStoreLink(links?: GameLink[]) {
  if (!links || links.length === 0) return null;

  const scoredLinks = links
    .filter((link) => !!link.url)
    .map((link) => {
      const label = normalizeText(link.label);
      const type = normalizeText(link.link_type);
      const url = normalizeText(link.url);

      let score = 0;

      if (
        label.includes('steam') ||
        type.includes('steam') ||
        url.includes('store.steampowered.com')
      ) {
        score += 100;
      }

      if (
        label.includes('official') ||
        type.includes('official') ||
        label.includes('store') ||
        type.includes('store') ||
        label.includes('download') ||
        type.includes('download')
      ) {
        score += 60;
      }

      if (
        url.includes('play.google.com') ||
        url.includes('apps.apple.com') ||
        url.includes('itch.io') ||
        url.includes('epicgames.com') ||
        url.includes('gog.com') ||
        url.includes('microsoft.com') ||
        url.includes('nintendo.com') ||
        url.includes('playstation.com') ||
        url.includes('xbox.com')
      ) {
        score += 50;
      }

      if (
        label.includes('trailer') ||
        type.includes('trailer') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com')
      ) {
        score -= 100;
      }

      return { link, score };
    })
    .sort((a, b) => b.score - a.score);

  return scoredLinks[0]?.score > 0 ? scoredLinks[0].link : null;
}

function getOfficialButtonLabel(link: GameLink | null) {
  if (!link) return 'Official link soon';

  const url = normalizeText(link.url);

  if (url.includes('store.steampowered.com')) return 'Steam';
  if (url.includes('itch.io')) return 'itch.io';
  if (url.includes('play.google.com')) return 'Google Play';
  if (url.includes('apps.apple.com')) return 'App Store';
  if (url.includes('epicgames.com')) return 'Epic Games';
  if (url.includes('gog.com')) return 'GOG';
  if (url.includes('nintendo.com')) return 'Nintendo';
  if (url.includes('playstation.com')) return 'PlayStation';
  if (url.includes('xbox.com')) return 'Xbox';
  if (normalizeText(link.label)) return link.label as string;

  return 'Official Link';
}

export default function GameCard({ game }: GameCardProps) {
  const imageSrc = game.thumbnail || game.banner_image || null;
  const officialLink = getOfficialStoreLink(game.links);
  const officialLabel = getOfficialButtonLabel(officialLink);

  return (
    <article className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/games/${game.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={game.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No image
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3">
            {game.official_badge ? (
              <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">
                Official
              </span>
            ) : null}
            {game.featured ? (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white">
                Featured
              </span>
            ) : null}
            {game.trending ? (
              <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-medium text-white">
                Trending
              </span>
            ) : null}
            {game.new_arrival ? (
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white">
                New
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Link href={`/games/${game.slug}`} className="block">
            <h3 className="line-clamp-1 text-2xl font-semibold tracking-tight text-zinc-950">
              {game.title}
            </h3>
          </Link>

          {game.short_description ? (
            <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
              {game.short_description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {(game.platforms ?? []).slice(0, 3).map((platform) => (
            <span
              key={platform.id}
              className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600"
            >
              {platform.name}
            </span>
          ))}

          {game.price_type ? (
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600">
              {game.price_type}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href={`/games/${game.slug}`}
            className="inline-flex items-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            View Game
          </Link>

          {officialLink ? (
            <TrackedLink
              href={officialLink.url}
              gameId={game.id}
              linkId={officialLink.id}
              eventType="card_outbound_click"
              pathname={`/games/${game.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
            >
              <>
                {officialLabel}
                <ExternalLink className="h-4 w-4" />
              </>
            </TrackedLink>
          ) : (
            <span className="text-sm text-zinc-400">Official link soon</span>
          )}
        </div>
      </div>
    </article>
  );
}