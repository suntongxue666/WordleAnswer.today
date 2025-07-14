import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';

export async function POST(request: Request) {
  try {
    console.log('Starting hints generation for existing data...');
    
    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // Get all records that don't have hints or have empty hints
    const { data: records, error: fetchError } = await supabaseClient
      .from('wordle-answers')
      .select('*')
      .or('hints.is.null,hints.eq.{}');

    if (fetchError) {
      console.error('Error fetching records:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch records', details: fetchError }, { status: 500 });
    }

    console.log(`Found ${records.length} records that need hints generation`);
    const updates = [];

    for (const record of records) {
      console.log(`Generating hints for ${record.date} (${record.answer})`);
      
      // Generate hints and difficulty
      const hints = generateHints(record.answer);
      const difficulty = generateDifficulty(record.answer);
      
      // Update the record
      const { error: updateError } = await supabaseClient
        .from('wordle-answers')
        .update({
          hints: hints,
          difficulty: difficulty
        })
        .eq('date', record.date);

      if (updateError) {
        console.error(`Error updating ${record.date}:`, updateError);
        updates.push({ date: record.date, status: 'error', error: updateError.message });
      } else {
        console.log(`✅ Updated ${record.date} with ${hints.length} hints and difficulty: ${difficulty}`);
        updates.push({ 
          date: record.date, 
          status: 'success', 
          answer: record.answer,
          hintsCount: hints.length,
          difficulty: difficulty
        });
      }
    }

    console.log('Hints generation completed!');
    
    return NextResponse.json({
      success: true,
      message: `Processed ${records.length} records`,
      updates: updates
    });

  } catch (error) {
    console.error('Error in hints generation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Hints generation endpoint. Use POST to trigger hints generation for existing data.',
    usage: 'POST /api/generate-hints'
  });
}