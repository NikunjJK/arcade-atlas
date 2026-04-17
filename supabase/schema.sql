create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  long_description text not null,
  developer text,
  publisher text,
  release_date date,
  release_type text,
  price_type text check (price_type in ('Free', 'Paid')),
  featured boolean not null default false,
  trending boolean not null default false,
  new_arrival boolean not null default false,
  official_badge boolean not null default true,
  popularity integer not null default 0,
  thumbnail_url text,
  banner_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_categories (
  game_id uuid references games(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (game_id, category_id)
);

create table if not exists game_tags (
  game_id uuid references games(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (game_id, tag_id)
);

create table if not exists game_platforms (
  game_id uuid references games(id) on delete cascade,
  platform_id uuid references platforms(id) on delete cascade,
  primary key (game_id, platform_id)
);

create table if not exists game_links (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  label text not null,
  link_type text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists game_images (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  image_url text not null,
  alt_text text,
  image_type text not null default 'gallery',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists featured_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists featured_collection_games (
  collection_id uuid references featured_collections(id) on delete cascade,
  game_id uuid references games(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, game_id)
);

create index if not exists idx_games_slug on games(slug);
create index if not exists idx_games_featured on games(featured);
create index if not exists idx_games_trending on games(trending);
create index if not exists idx_games_new_arrival on games(new_arrival);
