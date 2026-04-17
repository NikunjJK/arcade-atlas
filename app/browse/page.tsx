import Link from 'next/link';
import { Search } from 'lucide-react';

import GameCard from '@/components/game-card';
import { getCategories, getGames, getPlatforms } from '@/lib/db';

type BrowsePageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    platform?: string;
    price?: string;
    sort?: string;
  }>;
};

function normalizeText(value: unknown): string {
  if (typeof value === 'string') return value.toLowerCase().trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase().trim();
  }
  return '';
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildBrowseHref(
  currentParams: URLSearchParams,
  updates: Record<string, string | null>
) {
  const params = new URLSearchParams(currentParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `/browse?${queryString}` : '/browse';
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const q = resolvedSearchParams.q ?? '';
  const selectedCategory = resolvedSearchParams.category ?? '';
  const selectedPlatform = resolvedSearchParams.platform ?? '';
  const selectedPrice = resolvedSearchParams.price ?? '';
  const selectedSort = resolvedSearchParams.sort ?? 'featured';

  const [games, categories, platforms] = await Promise.all([
    getGames(),
    getCategories(),
    getPlatforms(),
  ]);

  const allCategories = uniqueById(categories);
  const allPlatforms = uniqueById(platforms);

  const query = normalizeText(q);

  let filteredGames = games.filter((game) => {
    const matchesQuery =
      !query ||
      normalizeText(game.title).includes(query) ||
      normalizeText(game.short_description).includes(query) ||
      normalizeText(game.long_description).includes(query) ||
      (game.categories ?? []).some((category) =>
        normalizeText(category.name).includes(query)
      ) ||
      (game.platforms ?? []).some((platform) =>
        normalizeText(platform.name).includes(query)
      ) ||
      (game.tags ?? []).some((tag) => normalizeText(tag.name).includes(query));

    const matchesCategory =
      !selectedCategory ||
      (game.categories ?? []).some(
        (category) => normalizeText(category.slug) === normalizeText(selectedCategory)
      );

    const matchesPlatform =
      !selectedPlatform ||
      (game.platforms ?? []).some(
        (platform) => normalizeText(platform.slug) === normalizeText(selectedPlatform)
      );

    const matchesPrice =
      !selectedPrice ||
      normalizeText(game.price_type) === normalizeText(selectedPrice);

    return matchesQuery && matchesCategory && matchesPlatform && matchesPrice;
  });

  filteredGames = [...filteredGames].sort((a, b) => {
    if (selectedSort === 'newest') {
      return (
        new Date(b.created_at ?? b.release_date ?? 0).getTime() -
        new Date(a.created_at ?? a.release_date ?? 0).getTime()
      );
    }

    if (selectedSort === 'popularity') {
      const aScore = (a.trending ? 2 : 0) + (a.featured ? 1 : 0) + (a.official_badge ? 1 : 0);
      const bScore = (b.trending ? 2 : 0) + (b.featured ? 1 : 0) + (b.official_badge ? 1 : 0);
      return bScore - aScore || a.title.localeCompare(b.title);
    }

    const aScore = (a.featured ? 3 : 0) + (a.trending ? 2 : 0) + (a.new_arrival ? 1 : 0);
    const bScore = (b.featured ? 3 : 0) + (b.trending ? 2 : 0) + (b.new_arrival ? 1 : 0);
    return bScore - aScore || a.title.localeCompare(b.title);
  });

  const currentParams = new URLSearchParams();
  if (q) currentParams.set('q', q);
  if (selectedCategory) currentParams.set('category', selectedCategory);
  if (selectedPlatform) currentParams.set('platform', selectedPlatform);
  if (selectedPrice) currentParams.set('price', selectedPrice);
  if (selectedSort) currentParams.set('sort', selectedSort);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-[#071133] md:text-5xl">
            All categories, one clean discovery flow.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-[#53627c]">
            Search by title, filter by platform, and surface only official or
            authorized destinations.
          </p>
        </div>

        <form
          action="/browse"
          className="mb-6 flex w-full max-w-4xl items-center gap-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"
        >
          <input type="hidden" name="category" value={selectedCategory} />
          <input type="hidden" name="platform" value={selectedPlatform} />
          <input type="hidden" name="price" value={selectedPrice} />
          <input type="hidden" name="sort" value={selectedSort} />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f4f9] text-[#7c8aa5]">
            <Search className="h-5 w-5" />
          </div>

          <input
            name="q"
            defaultValue={q}
            placeholder="Search games, tags, platforms..."
            className="h-12 flex-1 bg-transparent text-base text-[#071133] outline-none placeholder:text-[#94a0b8]"
          />

          <button
            type="submit"
            className="rounded-full bg-[#071133] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#0e1b47]"
          >
            Search
          </button>
        </form>

        <div className="mb-10 flex flex-wrap gap-3">
          {allCategories.map((category) => {
            const isActive =
              normalizeText(selectedCategory) === normalizeText(category.slug);

            return (
              <Link
                key={category.id}
                href={buildBrowseHref(currentParams, {
                  category: isActive ? null : category.slug,
                })}
                className={`rounded-full border px-5 py-3 text-sm transition ${
                  isActive
                    ? 'border-[#071133] bg-[#071133] text-white'
                    : 'border-[#d7dfea] bg-white text-[#53627c] hover:border-[#aab7cc] hover:text-[#071133]'
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="mb-8 flex items-center justify-between">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6c7a96]">
                Filters
              </div>
              <Link
                href="/browse"
                className="text-sm font-medium text-[#6c7a96] hover:text-[#071133]"
              >
                Reset
              </Link>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-[#1a2440]">Platforms</h3>
                <div className="flex flex-wrap gap-3">
                  {allPlatforms.map((platform) => {
                    const isActive =
                      normalizeText(selectedPlatform) === normalizeText(platform.slug);

                    return (
                      <Link
                        key={platform.id}
                        href={buildBrowseHref(currentParams, {
                          platform: isActive ? null : platform.slug,
                        })}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          isActive
                            ? 'border-[#071133] bg-[#071133] text-white'
                            : 'border-[#d7dfea] bg-[#f8faff] text-[#53627c] hover:border-[#aab7cc] hover:text-[#071133]'
                        }`}
                      >
                        {platform.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-[#1a2440]">Pricing</h3>
                <div className="flex flex-wrap gap-3">
                  {['Free', 'Paid'].map((price) => {
                    const isActive =
                      normalizeText(selectedPrice) === normalizeText(price);

                    return (
                      <Link
                        key={price}
                        href={buildBrowseHref(currentParams, {
                          price: isActive ? null : price,
                        })}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          isActive
                            ? 'border-[#071133] bg-[#071133] text-white'
                            : 'border-[#d7dfea] bg-[#f8faff] text-[#53627c] hover:border-[#aab7cc] hover:text-[#071133]'
                        }`}
                      >
                        {price}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-[#1a2440]">Sort</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Newest', value: 'newest' },
                    { label: 'Popularity', value: 'popularity' },
                    { label: 'Featured', value: 'featured' },
                  ].map((option) => {
                    const isActive = selectedSort === option.value;

                    return (
                      <Link
                        key={option.value}
                        href={buildBrowseHref(currentParams, {
                          sort: option.value,
                        })}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          isActive
                            ? 'border-[#071133] bg-[#071133] text-white'
                            : 'border-[#d7dfea] bg-[#f8faff] text-[#53627c] hover:border-[#aab7cc] hover:text-[#071133]'
                        }`}
                      >
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-lg text-[#53627c]">
                Showing <span className="font-semibold text-[#071133]">{filteredGames.length}</span>{' '}
                live catalog entries
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Featured', value: 'featured' },
                  { label: 'Popularity', value: 'popularity' },
                  { label: 'Newest', value: 'newest' },
                ].map((option) => {
                  const isActive = selectedSort === option.value;

                  return (
                    <Link
                      key={option.value}
                      href={buildBrowseHref(currentParams, { sort: option.value })}
                      className={`rounded-full border px-6 py-3 text-sm transition ${
                        isActive
                          ? 'border-[#071133] bg-[#071133] text-white'
                          : 'border-[#d7dfea] bg-white text-[#53627c] hover:border-[#aab7cc] hover:text-[#071133]'
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {filteredGames.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredGames.map((game) => (
                  <GameCard key={game.slug} game={game} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white p-8 text-[#6c7a96] shadow-sm ring-1 ring-black/5">
                No games matched your current search or filters.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}