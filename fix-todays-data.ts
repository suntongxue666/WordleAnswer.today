import { supabase } from './src/lib/supabase';

async function deleteAndReinsertTodaysData() {
    console.log('🗑️ Deleting today\'s old data...');
    
    // 删除今天的数据
    const { error: deleteError } = await supabase
        .from('wordle-answers')
        .delete()
        .eq('date', '2025-07-08');
    
    if (deleteError) {
        console.error('Error deleting:', deleteError);
        return;
    }
    
    console.log('✅ Deleted old data');
    
    // 插入新数据
    console.log('📝 Inserting corrected data...');
    
    const newData = {
        date: '2025-07-08',
        puzzle_number: null,
        answer: 'DREAD',
        hints: [
            {
                type: 'clue',
                value: 'This word often describes a strong feeling of fear or apprehension.'
            },
            {
                type: 'clue',
                value: 'It contains two vowels and three consonants.'
            },
            {
                type: 'clue',
                value: 'The first letter is the fourth letter of the alphabet.'
            },
            {
                type: 'clue',
                value: 'The word ends with a sound that is typically associated with the past tense in English.'
            },
            {
                type: 'clue',
                value: 'It is commonly used in the phrase "_____ful anticipation."'
            },
            {
                type: 'clue',
                value: 'The word functions as both a noun and a verb.'
            },
            {
                type: 'clue',
                value: 'The letters \'R\' and \'E\' are found consecutively within this word.'
            },
            {
                type: 'clue',
                value: 'Originating in the Old English language, this word is related to \'drēogan,\' meaning to endure.'
            }
        ],
        difficulty: null,
        definition: null
    };
    
    const { data, error: insertError } = await supabase
        .from('wordle-answers')
        .insert([newData]);
    
    if (insertError) {
        console.error('Error inserting:', insertError);
        return;
    }
    
    console.log('✅ Inserted new data');
    
    // 验证数据
    const { data: verifyData, error: verifyError } = await supabase
        .from('wordle-answers')
        .select('*')
        .eq('date', '2025-07-08')
        .limit(1);
    
    if (verifyError) {
        console.error('Error verifying:', verifyError);
        return;
    }
    
    if (verifyData && verifyData.length > 0) {
        const record = verifyData[0];
        console.log('\n📊 Verified data:');
        console.log('Answer:', record.answer);
        console.log('Hints count:', record.hints ? record.hints.length : 0);
        if (record.hints && record.hints.length > 0) {
            console.log('First hint:', JSON.stringify(record.hints[0], null, 2));
        }
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

deleteAndReinsertTodaysData().catch(console.error);