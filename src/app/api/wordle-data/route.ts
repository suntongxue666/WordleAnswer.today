import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  const supabaseClient = getSupabase();
  if (!supabaseClient) {
    return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
  }

  try {
    if (date) {
      // Get specific date
      const { data, error } = await supabaseClient
        .from('wordle-answers')
        .select('*')
        .eq('date', date)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get recent 5 records
      const { data, error } = await supabaseClient
        .from('wordle-answers')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}