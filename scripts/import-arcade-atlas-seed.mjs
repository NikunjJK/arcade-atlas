#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const csvPath = process.argv[2] || './arcade_atlas_seed_games.csv';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const tableColumnsCache = new Map();

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0];

  return rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (values[index] || '').trim();
    });
    return obj;
  });
}

function parseList(value) {
  return String(value || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBool(value) {
  return String(value || '').toLowerCase() === 'true';
}

function normalizePriceType(value) {
  const v = String(value || '').trim().toLowerCase();

  if (v === 'free') return 'Free';
  if (v === 'paid') return 'Paid';

  return null;
}

function normalizeReleaseType(value) {
  const v = String(value || '').trim();
  return v || null;
}

async function getTableColumns(table) {
  if (tableColumnsCache.has(table)) {
    return tableColumnsCache.get(table);
  }

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = '${table}'
      order by ordinal_position;
    `,
  });

  if (!error && Array.isArray(data)) {
    const cols = new Set(
      data
        .map((row) => row.column_name)
        .filter(Boolean)
    );
    tableColumnsCache.set(table, cols);
    return cols;
  }

  const fallbackQuery = await supabase
    .from(table)
    .select('*')
    .limit(1);

  if (fallbackQuery.error && fallbackQuery.error.code !== 'PGRST116') {
    throw fallbackQuery.error;
  }

  const sampleRow = fallbackQuery.data?.[0] || {};
  const cols = new Set(Object.keys(sampleRow));
  tableColumnsCache.set(table, cols);
  return cols;
}

async function buildLookupInsertPayload(table, name) {
  const slug = slugify(name);
  const columns = await getTableColumns(table);

  const payload = {
    name,
    slug,
  };

  if (columns.has('description')) {
    payload.description = name;
  }

  if (columns.has('created_at')) {
    // let database default handle it if present
  }

  return payload;
}

async function upsertLookup(table, name) {
  const slug = slugify(name);

  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const payload = await buildLookupInsertPayload(table, name);

  const { data: inserted, error: insertError } = await supabase
    .from(table)
    .insert(payload)
    .select('id, name, slug')
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function syncJoinTable({
  table,
  leftColumn,
  rightColumn,
  leftId,
  values,
  rightTable,
}) {
  const ids = [];

  for (const value of values) {
    const record = await upsertLookup(rightTable, value);
    ids.push(record.id);
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq(leftColumn, leftId);

  if (deleteError) throw deleteError;

  if (ids.length === 0) return;

  const rows = ids.map((id) => ({
    [leftColumn]: leftId,
    [rightColumn]: id,
  }));

  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw insertError;
}

function getLinkTypeCandidates(kind) {
  if (kind === 'trailer') {
    return [
      'Trailer',
      'trailer',
      'Video',
      'video',
      'Media',
      'media',
      'Official',
      'official',
      'External',
      'external',
      'Link',
      'link',
    ];
  }

  return [
    'Store',
    'store',
    'Official',
    'official',
    'Website',
    'website',
    'Steam',
    'steam',
    'External',
    'external',
    'Link',
    'link',
  ];
}

function isConstraintError(error) {
  const message = String(error?.message || '');
  return (
    message.includes('violates') ||
    message.includes('constraint') ||
    message.includes('invalid input value') ||
    message.includes('not-null')
  );
}

async function insertLinkWithFallback({ gameId, label, url, kind }) {
  const candidates = getLinkTypeCandidates(kind);
  let lastError = null;

  for (const linkType of candidates) {
    const { error } = await supabase.from('game_links').insert({
      game_id: gameId,
      label,
      url,
      link_type: linkType,
    });

    if (!error) return;

    lastError = error;

    if (!isConstraintError(error)) {
      throw error;
    }
  }

  throw lastError || new Error(`Failed to insert ${kind} link for game ${gameId}`);
}

async function syncLinks(gameId, row) {
  const { error: deleteError } = await supabase
    .from('game_links')
    .delete()
    .eq('game_id', gameId);

  if (deleteError) throw deleteError;

  if (row.trailer_url) {
    await insertLinkWithFallback({
      gameId,
      label: 'Trailer',
      url: row.trailer_url,
      kind: 'trailer',
    });
  }

  if (row.store_url) {
    await insertLinkWithFallback({
      gameId,
      label: 'Steam',
      url: row.store_url,
      kind: 'store',
    });
  }
}

async function syncImages(gameId, row) {
  const imageUrls = [row.screenshot_1, row.screenshot_2, row.screenshot_3].filter(
    Boolean
  );

  const { error: deleteError } = await supabase
    .from('game_images')
    .delete()
    .eq('game_id', gameId);

  if (deleteError) throw deleteError;

  if (imageUrls.length === 0) return;

  const rows = imageUrls.map((url, index) => ({
    game_id: gameId,
    image_url: url,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase.from('game_images').insert(rows);
  if (insertError) throw insertError;
}

async function upsertGame(row) {
  const payload = {
    title: row.title,
    slug: row.slug || slugify(row.title),
    short_description: row.short_description || null,
    long_description: row.long_description || null,
    developer: row.developer || null,
    publisher: row.publisher || null,
    release_date: row.release_date || null,
    release_type: normalizeReleaseType(row.release_type),
    price_type: normalizePriceType(row.price_type),
    featured: parseBool(row.featured),
    trending: parseBool(row.trending),
    new_arrival: parseBool(row.new_arrival),
    official_badge: parseBool(row.official_badge),
    thumbnail: row.thumbnail || null,
    banner_image: row.banner_image || null,
  };

  const { data, error } = await supabase
    .from('games')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, slug, title')
    .single();

  if (error) throw error;
  return data;
}

async function main() {
  const fullPath = path.resolve(csvPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`CSV file not found: ${fullPath}`);
  }

  const csvText = fs.readFileSync(fullPath, 'utf8');
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    throw new Error('CSV appears to be empty or invalid.');
  }

  console.log(`Importing ${rows.length} games from ${fullPath}`);

  for (const row of rows) {
    const game = await upsertGame(row);

    await syncJoinTable({
      table: 'game_categories',
      leftColumn: 'game_id',
      rightColumn: 'category_id',
      leftId: game.id,
      values: parseList(row.categories),
      rightTable: 'categories',
    });

    await syncJoinTable({
      table: 'game_platforms',
      leftColumn: 'game_id',
      rightColumn: 'platform_id',
      leftId: game.id,
      values: parseList(row.platforms),
      rightTable: 'platforms',
    });

    await syncJoinTable({
      table: 'game_tags',
      leftColumn: 'game_id',
      rightColumn: 'tag_id',
      leftId: game.id,
      values: parseList(row.tags),
      rightTable: 'tags',
    });

    await syncLinks(game.id, row);
    await syncImages(game.id, row);

    console.log(`✓ ${game.title}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error('Import failed:');
  console.error(error);
  process.exit(1);
});