import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const href =
      typeof body.href === 'string' && body.href.trim() ? body.href.trim() : null;
    const gameId =
      typeof body.gameId === 'string' && body.gameId.trim()
        ? body.gameId.trim()
        : null;
    const linkId =
      typeof body.linkId === 'string' && body.linkId.trim()
        ? body.linkId.trim()
        : null;
    const eventType =
      typeof body.eventType === 'string' && body.eventType.trim()
        ? body.eventType.trim()
        : 'outbound_click';
    const pathname =
      typeof body.pathname === 'string' && body.pathname.trim()
        ? body.pathname.trim()
        : null;

    if (!href) {
      return NextResponse.json({ error: 'Missing href' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing server environment variables' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from('link_clicks').insert({
      event_type: eventType,
      game_id: gameId,
      link_id: linkId,
      pathname,
      metadata: {
        href,
      },
    });

    if (error) {
      console.error('Error tracking click:', error);
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track click API error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}