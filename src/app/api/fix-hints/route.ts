import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';

export async function POST(request: Request) {
  try {
    console.log('Starting hints generation for specific dates...');
    
    const supabaseClient = getSupabase();
    if (!supabaseClient) {
      return NextResponse.json({ error: 'Supabase client not available' }, { status: 500 });
    }

    // Specifically target July 13 and 14 with known answers
    const knownData = [
      { date: '2025-07-13', answer: 'GNOME' },
      { date: '2025-07-14', answer: 'UNDID' },
      { date: '2025-07-15', answer: 'FOIST' }
    ];

    const updates = [];

    for (const item of knownData) {
      console.log(`Processing ${item.date} (${item.answer})`);
      
      // Generate hints and difficulty
      const hints = generateHints(item.answer);
      const difficulty = generateDifficulty(item.answer);
      
      // Update the record
      const { error: updateError } = await supabaseClient
        .from('wordle-answers')
        .update({
          hints: hints,
          difficulty: difficulty
        })
        .eq('date', item.date);

      if (updateError) {
        console.error(`Error updating ${item.date}:`, updateError);
        updates.push({ date: item.date, status: 'error', error: updateError.message });
      } else {
        console.log(`✅ Updated ${item.date} with ${hints.length} hints and difficulty: ${difficulty}`);
        updates.push({ 
          date: item.date, 
          status: 'success', 
          answer: item.answer,
          hintsCount: hints.length,
          difficulty: difficulty
        });
      }
    }

    console.log('Hints generation completed!');
    
    return NextResponse.json({
      success: true,
      message: `Processed ${knownData.length} records`,
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
    message: 'Hints generation endpoint for July 13-15. Use POST to trigger hints generation.',
    usage: 'POST /api/fix-hints',
    targets: ['2025-07-13 (GNOME)', '2025-07-14 (UNDID)', '2025-07-15 (FOIST)']
  });
}