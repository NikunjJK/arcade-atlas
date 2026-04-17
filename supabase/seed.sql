-- Minimal illustrative seed. Extend with the included sample-data.ts or script-based seeding.
insert into categories (name, slug, description) values
('Action', 'action', 'Fast combat, movement, and high-intensity picks.'),
('Adventure', 'adventure', 'Explore worlds, stories, and memorable journeys.'),
('Puzzle', 'puzzle', 'Sharp mechanics, calm design, clever loops.'),
('Horror', 'horror', 'Tension-heavy, eerie, and atmospheric games.'),
('Racing', 'racing', 'Arcade speed, realistic lines, and drift culture.'),
('Indie', 'indie', 'Curated independent titles worth discovering.'),
('Multiplayer', 'multiplayer', 'Competitive, co-op, and party-friendly games.'),
('Browser Games', 'browser-games', 'Instant-play games with zero install friction.'),
('Strategy', 'strategy', 'Plan smarter, optimize systems, outthink opponents.'),
('Simulation', 'simulation', 'Builders, sandboxes, and management loops.'),
('Story Rich', 'story-rich', 'Narrative-first games with a strong emotional pull.'),
('Low Spec', 'low-spec', 'Great games that run well on modest hardware.'),
('Free to Play', 'free-to-play', 'Zero-cost starts and free official destinations.'),
('Co-op', 'co-op', 'Shared progression, teamwork, and couch vibes.'),
('Roguelike', 'roguelike', 'Repeatable runs, procedural variation, tight risk-reward.'),
('Survival', 'survival', 'Resource pressure, crafting, and danger management.')
on conflict (slug) do nothing;

insert into platforms (name, slug) values
('PC', 'pc'),
('Mac', 'mac'),
('Browser', 'browser'),
('Android', 'android'),
('iPhone / iPad', 'ios'),
('Steam', 'steam'),
('itch.io', 'itchio'),
('GitHub', 'github')
on conflict (slug) do nothing;

insert into tags (name, slug) values
('Arcade', 'arcade'), ('Narrative', 'narrative'), ('Pixel Art', 'pixel-art'), ('Mobile', 'mobile'),
('Cozy', 'cozy'), ('Open Source', 'open-source'), ('Browser', 'browser'), ('Daily Challenge', 'daily-challenge')
on conflict (slug) do nothing;

insert into games (
  title, slug, short_description, long_description, developer, publisher, release_date, release_type, price_type,
  featured, trending, new_arrival, official_badge, popularity, thumbnail_url, banner_url, seo_title, seo_description
) values
(
  'Neon Drift Reboot', 'neon-drift-reboot',
  'Stylish arcade racing with synthwave tracks.',
  'A premium-feeling arcade racer built for quick sessions, clean UI, and high-speed mastery.',
  'Pulse Arcade', 'Pulse Arcade', '2025-11-14', 'Store Page', 'Paid',
  true, true, false, true, 98,
  'https://placehold.co/800x1000/0f172a/e2e8f0?text=Neon+Drift+Reboot+Cover',
  'https://placehold.co/1600x900/0f172a/e2e8f0?text=Neon+Drift+Reboot+Banner',
  'Neon Drift Reboot Official Links & Overview',
  'Discover Neon Drift Reboot with official Steam and studio links.'
),
(
  'Whisper House', 'whisper-house',
  'Indie horror set inside a looping Victorian mansion.',
  'This sample title shows how a horror game detail page can balance trust, atmosphere, and multiple official destination links.',
  'Lantern Thread', 'Lantern Thread', '2026-02-09', 'Multi-link', 'Paid',
  true, true, true, true, 96,
  'https://placehold.co/800x1000/0f172a/e2e8f0?text=Whisper+House+Cover',
  'https://placehold.co/1600x900/0f172a/e2e8f0?text=Whisper+House+Banner',
  'Whisper House Official Store Pages',
  'Browse Whisper House with official Steam and itch.io destinations.'
)
on conflict (slug) do nothing;

insert into game_links (game_id, label, link_type, url, sort_order)
select id, 'Steam Page', 'steam', 'https://example.com/steam/neon-drift-reboot', 1 from games where slug = 'neon-drift-reboot'
union all
select id, 'Official Website', 'official', 'https://example.com/neon-drift-reboot', 2 from games where slug = 'neon-drift-reboot'
union all
select id, 'Steam Page', 'steam', 'https://example.com/steam/whisper-house', 1 from games where slug = 'whisper-house'
union all
select id, 'itch.io Page', 'itch', 'https://example.com/itch/whisper-house', 2 from games where slug = 'whisper-house';
