import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  ExternalLink,
  MousePointerClick,
  TrendingUp,
  Activity,
  ArrowLeft,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';

type ClickRow = {
  event_type: string | null;
  created_at: string | null;
  game_id: string | null;
  link_id: string | null;
  pathname: string | null;
  metadata: Record<string, unknown> | null;
  games:
    | {
        id: string;
        title: string;
        slug: string;
      }
    | null;
  game_links:
    | {
        id: string;
        label: string | null;
        link_type: string | null;
        url: string | null;
      }
    | null;
};

function formatDateTime(value: string | null) {
  if (!value) return 'Unknown';

  try {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function formatRelativeDate(value: string | null) {
  if (!value) return 'Unknown';

  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      const mins = Math.max(1, Math.floor(diffMs / minute));
      return `${mins}m ago`;
    }

    if (diffMs < day) {
      const hours = Math.max(1, Math.floor(diffMs / hour));
      return `${hours}h ago`;
    }

    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days}d ago`;
  } catch {
    return value;
  }
}

function toClickRow(raw: any): ClickRow {
  const game =
    raw?.games && !Array.isArray(raw.games)
      ? {
          id: String(raw.games.id ?? ''),
          title: String(raw.games.title ?? ''),
          slug: String(raw.games.slug ?? ''),
        }
      : null;

  const gameLink =
    raw?.game_links && !Array.isArray(raw.game_links)
      ? {
          id: String(raw.game_links.id ?? ''),
          label:
            raw.game_links.label === null || raw.game_links.label === undefined
              ? null
              : String(raw.game_links.label),
          link_type:
            raw.game_links.link_type === null ||
            raw.game_links.link_type === undefined
              ? null
              : String(raw.game_links.link_type),
          url:
            raw.game_links.url === null || raw.game_links.url === undefined
              ? null
              : String(raw.game_links.url),
        }
      : null;

  return {
    event_type:
      raw?.event_type === null || raw?.event_type === undefined
        ? null
        : String(raw.event_type),
    created_at:
      raw?.created_at === null || raw?.created_at === undefined
        ? null
        : String(raw.created_at),
    game_id:
      raw?.game_id === null || raw?.game_id === undefined
        ? null
        : String(raw.game_id),
    link_id:
      raw?.link_id === null || raw?.link_id === undefined
        ? null
        : String(raw.link_id),
    pathname:
      raw?.pathname === null || raw?.pathname === undefined
        ? null
        : String(raw.pathname),
    metadata:
      raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : null,
    games: game,
    game_links: gameLink,
  };
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: recentClicksRaw, error } = await supabase
    .from('link_clicks')
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
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching analytics:', error);
  }

  const clicks: ClickRow[] = (recentClicksRaw ?? []).map(toClickRow);

  const totalClicks = clicks.length;

  const clicksByGameMap = new Map<
    string,
    { title: string; slug: string; count: number }
  >();

  const clicksByLinkTypeMap = new Map<string, number>();
  const clicksByDayMap = new Map<string, number>();

  for (const click of clicks) {
    if (click.games?.id) {
      const existing = clicksByGameMap.get(click.games.id);
      if (existing) {
        existing.count += 1;
      } else {
        clicksByGameMap.set(click.games.id, {
          title: click.games.title || 'Untitled Game',
          slug: click.games.slug || '',
          count: 1,
        });
      }
    }

    const linkType =
      click.game_links?.label ||
      click.game_links?.link_type ||
      click.event_type ||
      'Unknown';

    clicksByLinkTypeMap.set(linkType, (clicksByLinkTypeMap.get(linkType) ?? 0) + 1);

    const dayKey = click.created_at
      ? new Date(click.created_at).toISOString().slice(0, 10)
      : 'Unknown';

    clicksByDayMap.set(dayKey, (clicksByDayMap.get(dayKey) ?? 0) + 1);
  }

  const topGames = [...clicksByGameMap.entries()]
    .map(([id, value]) => ({
      id,
      ...value,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const linkTypeStats = [...clicksByLinkTypeMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const dailyStats = [...clicksByDayMap.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14);

  const lastClickAt = clicks[0]?.created_at ?? null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 text-zinc-400">
              Track outbound clicks, top games, and link performance across Arcade
              Atlas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Last activity
            </div>
            <div className="mt-1 text-sm font-medium text-white">
              {lastClickAt ? formatRelativeDate(lastClickAt) : 'No data yet'}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Total Clicks</div>
                <div className="text-2xl font-semibold text-white">
                  {totalClicks}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Tracked Games</div>
                <div className="text-2xl font-semibold text-white">
                  {clicksByGameMap.size}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Link Types Used</div>
                <div className="text-2xl font-semibold text-white">
                  {linkTypeStats.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold">Top Games by Clicks</h2>
            </div>

            {topGames.length > 0 ? (
              <div className="space-y-3">
                {topGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-zinc-300">
                        {index + 1}
                      </div>

                      <div>
                        <div className="font-medium text-white">{game.title}</div>
                        {game.slug ? (
                          <Link
                            href={`/games/${game.slug}`}
                            className="text-sm text-cyan-300 transition hover:text-cyan-200"
                          >
                            /games/{game.slug}
                          </Link>
                        ) : (
                          <div className="text-sm text-zinc-500">No slug</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {game.count}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        clicks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
                No click data yet.
              </div>
            )}
          </section>

          <section className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-emerald-300" />
                <h2 className="text-xl font-semibold">Link Type Performance</h2>
              </div>

              {linkTypeStats.length > 0 ? (
                <div className="space-y-3">
                  {linkTypeStats.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="text-sm font-medium text-white">
                        {item.label}
                      </div>
                      <div className="text-sm text-zinc-300">{item.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
                  No link click data yet.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-orange-300" />
                <h2 className="text-xl font-semibold">Last 14 Days</h2>
              </div>

              {dailyStats.length > 0 ? (
                <div className="space-y-3">
                  {dailyStats.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="text-sm text-white">{item.day}</div>
                      <div className="text-sm text-zinc-300">{item.count} clicks</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
                  No daily analytics available yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
          <h2 className="mb-5 text-xl font-semibold">Recent Click Activity</h2>

          {clicks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-zinc-500">
                    <th className="px-4">Time</th>
                    <th className="px-4">Game</th>
                    <th className="px-4">Link</th>
                    <th className="px-4">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.slice(0, 25).map((click, index) => (
                    <tr
                      key={`${click.created_at ?? 'unknown'}-${click.link_id ?? 'link'}-${index}`}
                      className="rounded-xl bg-white/5 text-sm text-zinc-200"
                    >
                      <td className="rounded-l-xl px-4 py-3 text-zinc-300">
                        {formatDateTime(click.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {click.games?.slug ? (
                          <Link
                            href={`/games/${click.games.slug}`}
                            className="font-medium text-cyan-300 transition hover:text-cyan-200"
                          >
                            {click.games.title}
                          </Link>
                        ) : (
                          <span>{click.games?.title || 'Unknown Game'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {click.game_links?.url ? (
                          <a
                            href={click.game_links.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-zinc-200 transition hover:text-white"
                          >
                            {click.game_links.label ||
                              click.game_links.link_type ||
                              'Open Link'}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">
                            {click.event_type || 'Unknown'}
                          </span>
                        )}
                      </td>
                      <td className="rounded-r-xl px-4 py-3 text-zinc-400">
                        {click.pathname || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-zinc-400">
              No recent click activity yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}