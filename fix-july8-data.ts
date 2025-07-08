import { supabase } from './src/lib/supabase';

async function fixJuly8Data() {
    console.log('🔧 Fixing July 8th data...');
    
    // 删除所有7月8日的数据（包括重复的）
    const { error: deleteError } = await supabase
        .from('wordle-answers')
        .delete()
        .eq('date', '2025-07-08');
    
    if (deleteError) {
        console.error('Error deleting:', deleteError);
        return;
    }
    
    console.log('✅ Deleted all July 8th data');
    
    // 插入正确格式的数据
    const correctData = {
        date: '2025-07-08',
        puzzle_number: null,
        answer: 'DREAD',
        hints: [
            'This word often describes a strong feeling of fear or apprehension.',
            'It contains two vowels and three consonants.',
            'The first letter is the fourth letter of the alphabet.',
            'The word ends with a sound that is typically associated with the past tense in English.',
            'It is commonly used in the phrase "_____ful anticipation."',
            'The word functions as both a noun and a verb.',
            'The letters \'R\' and \'E\' are found consecutively within this word.',
            'Originating in the Old English language, this word is related to \'drēogan,\' meaning to endure.'
        ],
        difficulty: null,
        definition: null
    };
    
    const { data, error: insertError } = await supabase
        .from('wordle-answers')
        .insert([correctData])
        .select();
    
    if (insertError) {
        console.error('Error inserting:', insertError);
        return;
    }
    
    console.log('✅ Inserted correct July 8th data');
    
    // 验证
    if (data && data.length > 0) {
        console.log('\n📊 Verified data:');
        console.log('Answer:', data[0].answer);
        console.log('Hints count:', data[0].hints.length);
        console.log('First hint:', data[0].hints[0]);
        console.log('Last hint:', data[0].hints[data[0].hints.length - 1]);
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

fixJuly8Data().catch(console.error);