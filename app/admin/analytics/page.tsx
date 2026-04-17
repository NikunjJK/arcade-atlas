import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ClickRow = {
  event_type: string;
  created_at: string;
  game_id: string | null;
  link_id: string | null;
  pathname: string | null;
  metadata: Record<string, any> | null;
  games: {
    id: string;
    title: string;
    slug: string;
  } | null;
  game_links: {
    id: string;
    label: string;
    link_type: string;
    url: string;
  } | null;
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [
    { data: recentClicks, error: recentClicksError },
    { count: totalClicks, error: totalClicksError },
    { data: last7DaysClicks, error: last7DaysError }
  ] = await Promise.all([
    supabase
      .from('events')
      .select(
        `
          event_type,
          created_at,
          game_id,
          link_id,
          pathname,
          metadata,
          games (
            id,
            title,
            slug
          ),
          game_links (
            id,
            label,
            link_type,
            url
          )
        `
      )
      .eq('event_type', 'outbound_click')
      .order('created_at', { ascending: false })
      .limit(25),

    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'outbound_click'),

    supabase
      .from('events')
      .select('id, game_id, link_id, created_at')
      .eq('event_type', 'outbound_click')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  if (recentClicksError) {
    throw new Error(recentClicksError.message);
  }

  if (totalClicksError) {
    throw new Error(totalClicksError.message);
  }

  if (last7DaysError) {
    throw new Error(last7DaysError.message);
  }

  const clicks = (recentClicks ?? []) as ClickRow[];

  const clicksByGameMap = new Map<string, { title: string; slug: string; count: number }>();
  const clicksByLinkTypeMap = new Map<string, number>();

  for (const click of clicks) {
    const gameTitle = click.games?.title ?? 'Unknown Game';
    const gameSlug = click.games?.slug ?? '';
    const gameKey = click.game_id ?? `unknown-${gameTitle}`;

    const existingGame = clicksByGameMap.get(gameKey);
    if (existingGame) {
      existingGame.count += 1;
    } else {
      clicksByGameMap.set(gameKey, {
        title: gameTitle,
        slug: gameSlug,
        count: 1
      });
    }

    const linkType = click.game_links?.link_type ?? 'unknown';
    clicksByLinkTypeMap.set(linkType, (clicksByLinkTypeMap.get(linkType) ?? 0) + 1);
  }

  const topGames = Array.from(clicksByGameMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topLinkTypes = Array.from(clicksByLinkTypeMap.entries())
    .map(([linkType, count]) => ({ linkType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <main className="container-shell py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Analytics</h1>
          <p className="mt-3 text-slate-600">
            Track outbound clicks from game cards and detail pages.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-950 hover:text-slate-950"
        >
          Back to Admin
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total outbound clicks</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{totalClicks ?? 0}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Last 7 days</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{last7DaysClicks?.length ?? 0}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Recent events loaded</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{clicks.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Recent outbound clicks</h2>
          <p className="mt-2 text-sm text-slate-600">
            Latest clicks captured through the redirect route.
          </p>

          <div className="mt-6 overflow-x-auto">
            {clicks.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 px-4 py-6 text-sm text-slate-500">
                No outbound click data yet.
              </div>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Game</th>
                    <th className="px-3 py-3 font-medium">Link</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Destination</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map((click, index) => (
                    <tr key={`${click.link_id}-${click.created_at}-${index}`} className="border-b border-slate-100">
                      <td className="px-3 py-3 text-slate-900">
                        {click.games?.slug ? (
                          <Link href={`/games/${click.games.slug}`} className="hover:underline">
                            {click.games.title}
                          </Link>
                        ) : (
                          click.games?.title ?? 'Unknown Game'
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {click.game_links?.label ?? 'Unknown Link'}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {click.game_links?.link_type ?? 'unknown'}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {String(click.metadata?.destination_url ?? '—')}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {new Date(click.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Top clicked games</h2>

            <div className="mt-6 space-y-4">
              {topGames.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 px-4 py-6 text-sm text-slate-500">
                  No game click data yet.
                </div>
              ) : (
                topGames.map((game) => (
                  <div
                    key={`${game.slug}-${game.title}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{game.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {game.slug ? `/${game.slug}` : 'No slug'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {game.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Top link types</h2>

            <div className="mt-6 space-y-4">
              {topLinkTypes.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 px-4 py-6 text-sm text-slate-500">
                  No link type data yet.
                </div>
              ) : (
                topLinkTypes.map((item) => (
                  <div
                    key={item.linkType}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <p className="font-semibold text-slate-950">{item.linkType}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {item.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}