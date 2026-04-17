import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;
  const supabase = await createClient();

  console.log('OUTBOUND DEBUG: route hit with linkId =', linkId);

  const { data: link, error: linkError } = await supabase
    .from('game_links')
    .select('id, url, game_id')
    .eq('id', linkId)
    .single();

  console.log('OUTBOUND DEBUG: link query result =', { link, linkError });

  if (linkError || !link?.url) {
    console.error('OUTBOUND DEBUG: failed to load game link:', linkError);
    return NextResponse.redirect(new URL('/', request.url));
  }

  const insertPayload = {
    event_type: 'outbound_click',
    game_id: link.game_id,
    link_id: link.id,
    pathname: `/out/${link.id}`,
    metadata: {
      destination_url: link.url
    }
  };

  console.log('OUTBOUND DEBUG: inserting event =', insertPayload);

  const { data: insertedEvent, error: insertError } = await supabase
    .from('events')
    .insert(insertPayload)
    .select()
    .single();

  console.log('OUTBOUND DEBUG: insert result =', { insertedEvent, insertError });

  if (insertError) {
    console.error('OUTBOUND DEBUG: failed to insert outbound click event:', insertError);
  }

  return NextResponse.redirect(link.url);
}