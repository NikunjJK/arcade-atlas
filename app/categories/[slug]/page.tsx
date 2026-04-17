import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FilterSidebar } from '@/components/filter-sidebar';
import { GameCard } from '@/components/game-card';
import { getCategories, getGames } from '@/lib/db';

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const categories = await getCategories();
  const category = categories.find((item: any) => item.slug === slug);

  if (!category) return {};

  return {
    title: `${category.name} Games`,
    description: category.description ?? `${category.name} games`
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categories = await getCategories();
  const games = await getGames();

  const category = categories.find((item: any) => item.slug === slug);

  if (!category) notFound();

  const categoryGames = games.filter((game: any) =>
    (game.categories ?? []).includes(slug)
  );

  return (
    <main className="container-shell py-12">
      <div className="card-surface p-8 sm:p-10">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">
          Category
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {category.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {category.description}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px,1fr]">
        <FilterSidebar />

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {categoryGames.length} games in this category
            </p>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              Sort: Popularity
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryGames.map((game: any) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}