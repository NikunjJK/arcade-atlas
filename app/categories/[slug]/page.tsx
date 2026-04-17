import Link from 'next/link';
import { notFound } from 'next/navigation';

import GameCard from '@/components/game-card';
import { getCategories, getGames } from '@/lib/db';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const [categories, games] = await Promise.all([getCategories(), getGames()]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryGames = games.filter((game) =>
    (game.categories ?? []).some((item) => item.slug === slug)
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/browse"
            className="text-sm font-medium text-[#5b6b86] transition hover:text-[#071133]"
          >
            ← Back to Browse
          </Link>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071133] md:text-5xl">
            {category.name}
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-[#53627c]">
            Explore all games currently listed in the <strong>{category.name}</strong>{' '}
            category on Arcade Atlas.
          </p>
        </div>

        {categoryGames.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white p-8 text-[#6c7a96] shadow-sm ring-1 ring-black/5">
            No games found in this category yet.
          </div>
        )}
      </section>
    </main>
  );
}