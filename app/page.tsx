import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search } from 'lucide-react';

import {
  getCategories,
  getFeaturedGames,
  getNewArrivals,
  getPlatforms,
  getTrendingGames,
} from '@/lib/db';

function CompactGameCard({
  game,
}: {
  game: {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    thumbnail?: string | null;
    banner_image?: string | null;
  };
}) {
  const imageSrc = game.thumbnail || game.banner_image || null;

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group rounded-[24px] border border-[#d8dfeb] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[18px] bg-gradient-to-br from-[#071133] to-[#5b5bd6]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={game.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 260px"
          />
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-[1.1rem] font-semibold text-[#111827]">
            {game.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-[#74839e]">
            {game.short_description || 'No description available.'}
          </p>
        </div>

        <span className="mt-1 shrink-0 text-[#8a97af] transition group-hover:translate-x-0.5 group-hover:text-[#111827]">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight text-[#071133]">
          {title}
        </h2>
        <p className="mt-3 text-lg text-[#53627c]">{description}</p>
      </div>

      {href && cta ? (
        <Link
          href={href}
          className="text-sm font-semibold text-[#071133] transition hover:opacity-70"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const [featuredGames, trendingGames, newArrivals, categories, platforms] =
    await Promise.all([
      getFeaturedGames(4),
      getTrendingGames(6),
      getNewArrivals(6),
      getCategories(12),
      getPlatforms(8),
    ]);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top_left,_rgba(94,92,230,0.10),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(24,145,255,0.08),_transparent_28%),#f5f7fb]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 rounded-[36px] bg-white/75 p-8 shadow-sm ring-1 ring-black/5 backdrop-blur md:p-10 lg:grid-cols-[minmax(0,1fr)_520px]">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#d7dff1] bg-[#eef2ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#4f46e5]">
                Official links only
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[#071133] md:text-6xl">
                Discover great games faster, without sketchy links.
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-9 text-[#53627c]">
                Browse curated categories, compare trusted destinations, and jump
                straight to official store pages, browser-play pages, mobile app
                listings, or licensed downloads.
              </p>

              <form
                action="/browse"
                className="mt-8 flex max-w-3xl items-center gap-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f4f9] text-[#7c8aa5]">
                  <Search className="h-5 w-5" />
                </div>

                <input
                  name="q"
                  placeholder="Search action, indie horror, browser, Steam, iPhone, low-spec..."
                  className="h-12 flex-1 bg-transparent text-base text-[#071133] outline-none placeholder:text-[#94a0b8]"
                />

                <button
                  type="submit"
                  className="rounded-full bg-[#071133] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#0e1b47]"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-sm text-[#74839e]">Trending now:</span>
                {['Browser Games', 'Low Spec', 'Indie Horror', 'Free to Play'].map(
                  (item) => (
                    <Link
                      key={item}
                      href={`/browse?q=${encodeURIComponent(item)}`}
                      className="rounded-full border border-[#d7dfea] bg-white px-4 py-2 text-sm text-[#53627c] transition hover:border-[#aab7cc] hover:text-[#071133]"
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featuredGames.slice(0, 4).map((game) => (
                <CompactGameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
        <SectionHeader
          title="Browse by category"
          description="Explore curated game categories with dedicated SEO-friendly pages and official links."
          href="/categories"
          cta="View all categories"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-[24px] border border-[#d8dfeb] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-xl font-semibold text-[#071133]">
                {category.name}
              </div>

              <p className="mt-3 text-sm leading-6 text-[#53627c]">
                Discover curated {category.name} games with screenshots, trailers,
                platforms, and trusted official links.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#5b6b86]">
                Explore {category.name}
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-[#d8dfeb] bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold tracking-tight text-[#071133]">
            Find games by genre, platform, and play style
          </h3>

          <p className="mt-3 max-w-4xl text-base leading-7 text-[#53627c]">
            Arcade Atlas organizes games into clean discovery paths so players can
            quickly find action games, indie titles, browser games, horror games,
            roguelikes, cozy games, free-to-play games, and more without relying on
            unsafe download links.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="rounded-full bg-[#071133] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0e1b47]"
            >
              Browse full catalog
            </Link>

            <Link
              href="/categories"
              className="rounded-full border border-[#d7dfea] bg-white px-5 py-3 text-sm font-semibold text-[#53627c] transition hover:border-[#aab7cc] hover:text-[#071133]"
            >
              All categories
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6 lg:px-8">
        <SectionHeader
          title="Trending games"
          description="High-interest entries surfaced with strong visual hierarchy and trust-forward outbound actions."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trendingGames.map((game) => (
            <CompactGameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6 lg:px-8">
        <SectionHeader
          title="New arrivals"
          description="Fresh additions ready for SEO, collection placement, and future sponsorship slots."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {newArrivals.map((game) => (
            <CompactGameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
        <SectionHeader
          title="Popular platforms"
          description="Designed for filter-first browsing and easy future ad or featured placement modules."
        />

        <div className="flex flex-wrap gap-3">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={`/browse?platform=${platform.slug}`}
              className="rounded-full border border-[#d7dfea] bg-white px-5 py-3 text-sm font-medium text-[#53627c] transition hover:border-[#aab7cc] hover:text-[#071133]"
            >
              {platform.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}