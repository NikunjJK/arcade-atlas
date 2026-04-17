import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import GameLinkManager from '@/components/admin/game-link-manager';
import ScreenshotUploader from '@/components/admin/screenshot-uploader';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

async function updateGame(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '');
  const slug = String(formData.get('slug') ?? '').trim();

  if (!id) throw new Error('Game ID is required.');

  const title = String(formData.get('title') ?? '').trim();
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

  const { error: updateError } = await supabase
    .from('games')
    .update({
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
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);

  await supabase.from('game_categories').delete().eq('game_id', id);
  if (selectedCategoryIds.length > 0) {
    const { error } = await supabase.from('game_categories').insert(
      selectedCategoryIds.map((category_id) => ({
        game_id: id,
        category_id
      }))
    );
    if (error) throw new Error(error.message);
  }

  await supabase.from('game_platforms').delete().eq('game_id', id);
  if (selectedPlatformIds.length > 0) {
    const { error } = await supabase.from('game_platforms').insert(
      selectedPlatformIds.map((platform_id) => ({
        game_id: id,
        platform_id
      }))
    );
    if (error) throw new Error(error.message);
  }

  await supabase.from('game_tags').delete().eq('game_id', id);
  if (selectedTagIds.length > 0) {
    const { error } = await supabase.from('game_tags').insert(
      selectedTagIds.map((tag_id) => ({
        game_id: id,
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

  redirect('/admin?updated=1');
}

async function createGameLink(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const gameId = String(formData.get('game_id') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const link_type = String(formData.get('link_type') ?? 'other').trim();
  const url = normalizeUrl(String(formData.get('url') ?? ''));
  const is_primary = formData.get('is_primary') === 'true';

  if (!gameId) throw new Error('Game ID is required.');
  if (!label) throw new Error('Link label is required.');
  if (!url) throw new Error('Link URL is required.');

  if (is_primary) {
    const { error: resetPrimaryError } = await supabase
      .from('game_links')
      .update({ is_primary: false })
      .eq('game_id', gameId);

    if (resetPrimaryError) throw new Error(resetPrimaryError.message);
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('game_links')
    .select('id')
    .eq('game_id', gameId);

  if (existingLinksError) throw new Error(existingLinksError.message);

  const sort_order = existingLinks?.length ?? 0;

  const { error: insertError } = await supabase.from('game_links').insert({
    game_id: gameId,
    label,
    link_type,
    url,
    is_primary,
    sort_order
  });

  if (insertError) throw new Error(insertError.message);

  const { data: game } = await supabase
    .from('games')
    .select('id, slug')
    .eq('id', gameId)
    .single();

  revalidatePath('/admin');
  revalidatePath(`/admin/games/${gameId}/edit`);
  if (game?.slug) revalidatePath(`/games/${game.slug}`);
}

async function updateGameLink(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '').trim();
  const gameId = String(formData.get('game_id') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const link_type = String(formData.get('link_type') ?? 'other').trim();
  const url = normalizeUrl(String(formData.get('url') ?? ''));
  const is_primary = formData.get('is_primary') === 'true';

  if (!id) throw new Error('Link ID is required.');
  if (!gameId) throw new Error('Game ID is required.');
  if (!label) throw new Error('Link label is required.');
  if (!url) throw new Error('Link URL is required.');

  if (is_primary) {
    const { error: resetPrimaryError } = await supabase
      .from('game_links')
      .update({ is_primary: false })
      .eq('game_id', gameId)
      .neq('id', id);

    if (resetPrimaryError) throw new Error(resetPrimaryError.message);
  }

  const { error: updateError } = await supabase
    .from('game_links')
    .update({
      label,
      link_type,
      url,
      is_primary
    })
    .eq('id', id)
    .eq('game_id', gameId);

  if (updateError) throw new Error(updateError.message);

  const { data: game } = await supabase
    .from('games')
    .select('id, slug')
    .eq('id', gameId)
    .single();

  revalidatePath('/admin');
  revalidatePath(`/admin/games/${gameId}/edit`);
  if (game?.slug) revalidatePath(`/games/${game.slug}`);
}

async function deleteGameLink(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const id = String(formData.get('id') ?? '').trim();
  const gameId = String(formData.get('game_id') ?? '').trim();

  if (!id) throw new Error('Link ID is required.');
  if (!gameId) throw new Error('Game ID is required.');

  const { error: deleteError } = await supabase
    .from('game_links')
    .delete()
    .eq('id', id)
    .eq('game_id', gameId);

  if (deleteError) throw new Error(deleteError.message);

  const { data: game } = await supabase
    .from('games')
    .select('id, slug')
    .eq('id', gameId)
    .single();

  revalidatePath('/admin');
  revalidatePath(`/admin/games/${gameId}/edit`);
  if (game?.slug) revalidatePath(`/games/${game.slug}`);
}

async function uploadGameScreenshots(formData: FormData) {
  'use server';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const gameId = String(formData.get('game_id') ?? '').trim();

  if (!gameId) {
    throw new Error('Game ID is required.');
  }

  const files = formData
    .getAll('screenshots')
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    throw new Error('Please choose at least one image.');
  }

  const { data: currentImages, error: currentImagesError } = await supabase
    .from('game_images')
    .select('id')
    .eq('game_id', gameId);

  if (currentImagesError) {
    throw new Error(currentImagesError.message);
  }

  let nextSortOrder = currentImages?.length ?? 0;

  for (const file of files) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      throw new Error('Only PNG, JPG, JPEG, and WEBP files are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Each image must be 5MB or smaller.');
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `games/${gameId}/screenshots/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('game-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('game-media').getPublicUrl(filePath);

    const { error: insertImageError } = await supabase.from('game_images').insert({
      game_id: gameId,
      image_url: publicUrl,
      sort_order: nextSortOrder
    });

    if (insertImageError) {
      throw new Error(insertImageError.message);
    }

    nextSortOrder += 1;
  }

  const { data: game } = await supabase
    .from('games')
    .select('slug')
    .eq('id', gameId)
    .single();

  revalidatePath('/admin');
  revalidatePath(`/admin/games/${gameId}/edit`);
  if (game?.slug) revalidatePath(`/games/${game.slug}`);
}

export default async function EditGamePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { id: gameId } = await params;

  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    redirect('/admin');
  }

  const [
    { data: categories },
    { data: platforms },
    { data: tags },
    { data: gameCategories },
    { data: gamePlatforms },
    { data: gameTags },
    { data: gameLinks },
    { data: gameImages }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('platforms').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('game_categories').select('category_id').eq('game_id', gameId),
    supabase.from('game_platforms').select('platform_id').eq('game_id', gameId),
    supabase.from('game_tags').select('tag_id').eq('game_id', gameId),
    supabase.from('game_links').select('*').eq('game_id', gameId).order('sort_order', { ascending: true }),
    supabase.from('game_images').select('*').eq('game_id', gameId).order('sort_order', { ascending: true })
  ]);

  const selectedCategoryIds = new Set((gameCategories ?? []).map((c: any) => c.category_id));
  const selectedPlatformIds = new Set((gamePlatforms ?? []).map((p: any) => p.platform_id));
  const selectedTagIds = new Set((gameTags ?? []).map((t: any) => t.tag_id));

  return (
    <main className="container-shell py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">Edit Game</h1>
        <p className="mt-3 text-slate-600">Update the game details below.</p>

        <form action={updateGame} className="mt-8 grid gap-5">
          <input type="hidden" name="id" value={game.id} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              name="title"
              defaultValue={game.title ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
            <input
              name="slug"
              defaultValue={game.slug ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
            <textarea
              name="short_description"
              defaultValue={game.short_description ?? ''}
              className="min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Long description</label>
            <textarea
              name="long_description"
              defaultValue={game.long_description ?? ''}
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Developer</label>
              <input
                name="developer"
                defaultValue={game.developer ?? ''}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Publisher</label>
              <input
                name="publisher"
                defaultValue={game.publisher ?? ''}
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
                defaultValue={game.release_date ? String(game.release_date).split('T')[0] : ''}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price type</label>
              <select
                name="price_type"
                defaultValue={game.price_type ?? 'Free'}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
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
              defaultValue={game.release_type ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Thumbnail URL</label>
            <input
              name="thumbnail"
              defaultValue={game.thumbnail ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Banner image URL</label>
            <input
              name="banner_image"
              defaultValue={game.banner_image ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Categories</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories?.map((category: any) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Platforms</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {platforms?.map((platform: any) => (
                <label
                  key={platform.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    name="platform_ids"
                    value={platform.id}
                    defaultChecked={selectedPlatformIds.has(platform.id)}
                  />
                  {platform.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Tags</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {tags?.map((tag: any) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="featured" defaultChecked={!!game.featured} />
              Featured
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="trending" defaultChecked={!!game.trending} />
              Trending
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="new_arrival" defaultChecked={!!game.new_arrival} />
              New arrival
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="official_badge" defaultChecked={!!game.official_badge} />
              Official badge
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white"
          >
            Save changes
          </button>

          <Link
            href="/admin"
            className="mt-3 inline-block text-sm text-slate-700 hover:text-slate-950"
          >
            Cancel
          </Link>
        </form>
      </div>

      <GameLinkManager
        gameId={gameId}
        links={gameLinks ?? []}
        createGameLinkAction={createGameLink}
        updateGameLinkAction={updateGameLink}
        deleteGameLinkAction={deleteGameLink}
      />

      <ScreenshotUploader
        gameId={gameId}
        existingImages={gameImages ?? []}
        uploadAction={uploadGameScreenshots}
      />
    </main>
  );
}