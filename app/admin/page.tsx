import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { AdminSuccessToast } from '@/components/admin-success-toast';

async function createGame(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const short_description = String(formData.get('short_description') ?? '').trim();
  const long_description = String(formData.get('long_description') ?? '').trim();
  const developer = String(formData.get('developer') ?? '').trim();
  const publisher = String(formData.get('publisher') ?? '').trim();
  const release_date = String(formData.get('release_date') ?? '').trim();
  const price_type = String(formData.get('price_type') ?? 'Free').trim();
  const release_type = String(formData.get('release_type') ?? 'Official Link').trim();
  const thumbnail = String(formData.get('thumbnail') ?? '').trim();
  const banner_image = String(formData.get('banner_image') ?? '').trim();

  const featured = formData.get('featured') === 'on';
  const trending = formData.get('trending') === 'on';
  const new_arrival = formData.get('new_arrival') === 'on';
  const official_badge = formData.get('official_badge') === 'on';

  const selectedCategoryIds = formData.getAll('category_ids').map(String);
  const selectedPlatformIds = formData.getAll('platform_ids').map(String);
  const selectedTagIds = formData.getAll('tag_ids').map(String);

  if (!title || !slug) {
    throw new Error('Title and slug are required.');
  }

  const { data: insertedGame, error: gameError } = await supabase
    .from('games')
    .insert({
      title,
      slug,
      short_description,
      long_description,
      developer,
      publisher,
      release_date: release_date || null,
      price_type,
      release_type,
      thumbnail: thumbnail || null,
      banner_image: banner_image || null,
      featured,
      trending,
      new_arrival,
      official_badge
    })
    .select('id, slug')
    .single();

  if (gameError || !insertedGame) {
    throw new Error(gameError?.message || 'Failed to create game.');
  }

  const gameId = insertedGame.id;

  if (selectedCategoryIds.length > 0) {
    const { error } = await supabase.from('game_categories').insert(
      selectedCategoryIds.map((category_id) => ({
        game_id: gameId,
        category_id
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (selectedPlatformIds.length > 0) {
    const { error } = await supabase.from('game_platforms').insert(
      selectedPlatformIds.map((platform_id) => ({
        game_id: gameId,
        platform_id
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (selectedTagIds.length > 0) {
    const { error } = await supabase.from('game_tags').insert(
      selectedTagIds.map((tag_id) => ({
        game_id: gameId,
        tag_id
      }))
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/admin');
  revalidatePath(`/games/${slug}`);
  revalidatePath('/sitemap.xml');
}

async function deleteGame(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();

  if (!id) {
    throw new Error('Game id is required.');
  }

  await supabase.from('game_categories').delete().eq('game_id', id);
  await supabase.from('game_platforms').delete().eq('game_id', id);
  await supabase.from('game_tags').delete().eq('game_id', id);

  const { error } = await supabase.from('games').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/admin');
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath('/sitemap.xml');
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { data: games, error: gamesError },
    { data: categories, error: categoriesError },
    { data: platforms, error: platformsError },
    { data: tags, error: tagsError }
  ] = await Promise.all([
    supabase
      .from('games')
      .select('id, title, slug, price_type, featured, trending, new_arrival, official_badge, release_date')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('platforms').select('id, name, slug').order('name'),
    supabase.from('tags').select('id, name, slug').order('name')
  ]);

  if (gamesError) throw new Error(gamesError.message);
  if (categoriesError) throw new Error(categoriesError.message);
  if (platformsError) throw new Error(platformsError.message);
  if (tagsError) throw new Error(tagsError.message);

  return (
    <main className="container-shell py-16">
      <AdminSuccessToast updated={params.updated} />

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Admin Dashboard</h1>
          <p className="mt-3 text-slate-600">Add and manage games in Arcade Atlas.</p>
        </div>

        <Link
          href="/admin/analytics"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-950 hover:text-slate-950"
        >
          View Analytics
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Create new game
          </p>
          <p className="mt-3 text-slate-600">Add a new game to your live directory.</p>

          <form action={createGame} className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                name="title"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
              <input
                name="slug"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                placeholder="my-new-game"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
              <textarea
                name="short_description"
                className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Long description</label>
              <textarea
                name="long_description"
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Developer</label>
                <input
                  name="developer"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Publisher</label>
                <input
                  name="publisher"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Release date</label>
                <input
                  type="date"
                  name="release_date"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price type</label>
                <select
                  name="price_type"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                  defaultValue="Free"
                >
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Release type</label>
              <input
                name="release_type"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                placeholder="Steam Page / Browser Play / Official Website"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Thumbnail URL</label>
              <input
                name="thumbnail"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Banner image URL</label>
              <input
                name="banner_image"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Categories</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(categories ?? []).map((category: any) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  >
                    <input type="checkbox" name="category_ids" value={category.id} />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Platforms</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(platforms ?? []).map((platform: any) => (
                  <label
                    key={platform.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  >
                    <input type="checkbox" name="platform_ids" value={platform.id} />
                    {platform.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Tags</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(tags ?? []).map((tag: any) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                  >
                    <input type="checkbox" name="tag_ids" value={tag.id} />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="featured" />
                Featured
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="trending" />
                Trending
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="new_arrival" />
                New arrival
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="official_badge" />
                Official badge
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white"
            >
              Create game
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Existing games</h2>
              <p className="mt-2 text-sm text-slate-600">Live rows currently in your database.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(games ?? []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 px-4 py-6 text-sm text-slate-500">
                No games found yet.
              </div>
            ) : (
              games!.map((game: any) => (
                <div key={game.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">{game.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">/{game.slug}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                          {game.price_type ?? 'Unknown'}
                        </span>
                        {game.featured ? (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">Featured</span>
                        ) : null}
                        {game.trending ? (
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">Trending</span>
                        ) : null}
                        {game.new_arrival ? (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">New</span>
                        ) : null}
                        {game.official_badge ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Official</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/games/${game.slug}`}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-950 hover:text-slate-950"
                      >
                        View
                      </Link>

                      <Link
                        href={`/admin/games/${game.id}/edit`}
                        className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Link>

                      <form action={deleteGame}>
                        <input type="hidden" name="id" value={game.id} />
                        <input type="hidden" name="slug" value={game.slug} />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}