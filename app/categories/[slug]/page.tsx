import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getCategoryData(slug: string) {
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (categoryError || !category) {
    return null;
  }

  const { data: rows } = await supabase
    .from('game_categories')
    .select(
      `
      games (
        id,
        title,
        slug,
        thumbnail,
        banner_image,
        short_description,
        price_type,
        featured,
        trending,
        new_arrival
      )
    `
    )
    .eq('category_id', category.id);

  return {
    category,
    games: rows?.map((row: any) => row.games).filter(Boolean) ?? [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    return {
      title: 'Category Not Found | Arcade Atlas',
      description: 'This game category could not be found on Arcade Atlas.',
    };
  }

  return {
    title: `${data.category.name} Games - Browse Official Game Links | Arcade Atlas`,
    description: `Browse ${data.category.name} games on Arcade Atlas. Discover curated titles, screenshots, trailers, platforms, and trusted official links.`,
    alternates: {
      canonical: `https://arcadeatlas.games/categories/${data.category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  const { category, games } = data;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <Link
          href="/categories"
          className="text-sm font-medium text-[#5b6b86] transition hover:text-[#071133]"
        >
          ← Back to Categories
        </Link>

        <div className="mt-8 rounded-[32px] border border-black/5 bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#071133] md:text-5xl">
            {category.name} Games
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#53627c]">
            Discover curated {category.name} games on Arcade Atlas. Browse
            screenshots, trailers, platforms, and trusted official links for every
            listed game.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="rounded-full bg-[#071133] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0e1b47]"
            >
              Browse all games
            </Link>

            <Link
              href="/categories"
              className="rounded-full border border-[#d7dfea] bg-white px-5 py-3 text-sm font-semibold text-[#53627c] transition hover:border-[#aab7cc] hover:text-[#071133]"
            >
              View all categories
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#071133]">
                {games.length} {category.name} Games
              </h2>
              <p className="mt-2 text-[#53627c]">
                Explore official destinations and game details.
              </p>
            </div>
          </div>

          {games.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {games.map((game: any) => {
                const imageSrc = game.thumbnail || game.banner_image || null;

                return (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#eef2f7]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={game.title}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#7c8aa5]">
                          No image
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {game.featured ? (
                          <span className="rounded-full bg-[#071133] px-3 py-1 text-xs font-semibold text-white">
                            Featured
                          </span>
                        ) : null}

                        {game.trending ? (
                          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                            Trending
                          </span>
                        ) : null}

                        {game.new_arrival ? (
                          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                            New
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="line-clamp-1 text-xl font-semibold text-[#071133]">
                            {game.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#53627c]">
                            {game.short_description || 'No description available yet.'}
                          </p>
                        </div>

                        {game.price_type ? (
                          <span className="shrink-0 rounded-full border border-[#d7dfea] px-3 py-1 text-xs font-medium text-[#53627c]">
                            {game.price_type}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 text-sm font-semibold text-[#071133]">
                        View game →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-8 text-[#6c7a96] shadow-sm ring-1 ring-black/5">
              No games found in this category yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}