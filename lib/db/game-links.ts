import { createClient } from '@/lib/supabase/server';

export type GameLink = {
  id: string;
  game_id: string;
  label: string;
  link_type: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export async function getGameLinks(gameId: string): Promise<GameLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('game_links')
    .select('*')
    .eq('game_id', gameId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch game links: ${error.message}`);
  }

  return data ?? [];
}