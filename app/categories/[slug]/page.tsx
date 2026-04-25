import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

type Props = {
  params: {
    slug: string;
  };
};

async function getCategoryData(slug: string) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) return null;

  const { data: games } = await supabase
    .from('game_categories')
    .select(`
      games (
        id,
        title,
        slug,
        thumbnail,
        short_description
      )
    `)
    .eq('category_id', category.id);

  return {
    category,
    games: games?.map((g: any) => g.games).filter(Boolean) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCategoryData(params.slug);

  if (!data) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${data.category.name} Games - Browse & Discover | Arcade Atlas`,
    description: `Browse the best ${data.category.name} games. Discover new and trending titles on Arcade Atlas.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const data = await getCategoryData(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <h1 className="text-4xl font-bold mb-4">
          {data.category.name} Games
        </h1>

        <p className="text-zinc-400 mb-8">
          Discover the best {data.category.name} games available right now.
        </p>

        {data.games.length === 0 ? (
          <p>No games found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.games.map((game: any) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group"
              >
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">

                  <div className="relative aspect-[3/4]">
                    {game.thumbnail && (
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-1">
                      {game.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {game.short_description}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}