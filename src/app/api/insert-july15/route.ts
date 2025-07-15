import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';

export async function POST(request: Request) {
  try {
    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // July 15 #1487 data from NYT
    const wordleData = {
      date: '2025-07-15',
      puzzle_number: 1487,
      answer: 'FOIST',
      hints: generateHints('FOIST'),
      difficulty: generateDifficulty('FOIST'),
      definition: 'to force or impose (something unwelcome or unfamiliar) on someone'
    };

    console.log('Inserting July 15 data:', wordleData);

    // Insert the data
    const { data, error } = await supabaseClient
      .from('wordle-answers')
      .upsert(wordleData)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to insert data',
        details: error.message 
      }, { status: 500 });
    }

    console.log('Successfully inserted:', data);

    return NextResponse.json({
      success: true,
      message: 'July 15 data inserted successfully',
      data: wordleData
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to insert July 15 #1487 FOIST data',
    data: {
      date: '2025-07-15',
      puzzle_number: 1487,
      answer: 'FOIST'
    }
  });
}