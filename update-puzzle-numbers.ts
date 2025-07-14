import { getSupabase } from './src/lib/supabase';
require('dotenv').config({ path: '.env.local' });

async function updatePuzzleNumbers() {
  const supabase = getSupabase();

  const updates = [
    {
      date: '2025-07-13',
      puzzle_number: 1485
    },
    {
      date: '2025-07-14',
      puzzle_number: 1486
    }
  ];

  for (const update of updates) {
    console.log(`Updating puzzle number for ${update.date} to ${update.puzzle_number}...`);
    const { data, error } = await supabase
      .from('wordle-answers')
      .update({ puzzle_number: update.puzzle_number })
      .eq('date', update.date);

    if (error) {
      console.error(`Error updating ${update.date}:`, error);
    } else {
      console.log(`Successfully updated ${update.date}.`);
    }
  }
}

updatePuzzleNumbers();
