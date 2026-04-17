# Arcade Atlas

Premium, modern game discovery website built with Next.js, TypeScript, Tailwind CSS, and a Supabase-ready schema.

## What is included

- Startup-quality homepage with hero, search, collections, trending, new arrivals, and trust sections
- Browse page with sticky filter sidebar
- Dynamic category page
- Dynamic game detail page with gallery, FAQ, JSON-LD schema, and related games
- About, Contact, Privacy, Terms, and DMCA pages
- Supabase schema and starter seed SQL
- 24 structured sample game entries in `lib/sample-data.ts`
- Vercel-ready App Router setup
- Sitemap and robots generation

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push the codebase to GitHub.
2. Import the repo into Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## Supabase setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` for starter relational data.
4. Replace the demo `lib/sample-data.ts` layer with Supabase fetches once your real data is ready.

## How to add games quickly now

For the static demo:

1. Open `lib/sample-data.ts`.
2. Duplicate a `makeGame(...)` entry.
3. Update title, slug, summary, categories, tags, platforms, links, and SEO fields.
4. Save and redeploy.

## How to add games later with Supabase

Recommended admin-friendly flow:

- Store games in `games`
- Store categories, tags, and platforms as lookup tables
- Store external destinations in `game_links`
- Store screenshots/banners in Supabase Storage and reference them in `game_images`
- Build a simple internal admin UI or use Supabase Studio for editing

## Suggested next upgrade path

- Replace placeholder images with real, properly licensed media
- Add live search with URL query params
- Add outbound click tracking for monetization
- Add authentication for admin-only editing
- Add server-side data fetching from Supabase
- Add image optimization and editorial CMS workflows
