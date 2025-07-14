// Script to generate hints for existing Wordle data
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';

async function updateHintsForExistingData() {
  console.log('Starting hints generation for existing data...');
  
  const supabaseClient = getSupabase();
  if (!supabaseClient) {
    console.error('Supabase client not available');
    return;
  }

  // Get all records that don't have hints or have empty hints
  const { data: records, error: fetchError } = await supabaseClient
    .from('wordle-answers')
    .select('*')
    .or('hints.is.null,hints.eq.{}');

  if (fetchError) {
    console.error('Error fetching records:', fetchError);
    return;
  }

  console.log(`Found ${records.length} records that need hints generation`);

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
    } else {
      console.log(`✅ Updated ${record.date} with ${hints.length} hints and difficulty: ${difficulty}`);
    }
  }

  console.log('Hints generation completed!');
}

// Run the update
updateHintsForExistingData().catch(console.error);