import { supabase } from './src/lib/supabase';

async function forceCleanJuly8() {
    console.log('🔥 Force cleaning July 8th and 9th data...');
    
    // 删除所有7月8日和9日的数据
    const { error: deleteError1 } = await supabase
        .from('wordle-answers')
        .delete()
        .in('date', ['2025-07-08', '2025-07-09']);
    
    if (deleteError1) {
        console.error('Error deleting:', deleteError1);
        return;
    }
    
    console.log('✅ Deleted all July 8th and 9th data');
    
    // 等待一秒确保删除完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 插入唯一正确的7月8日数据
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
    
    console.log('✅ Inserted clean July 8th data');
    
    // 最终验证 - 检查所有数据
    const { data: allData, error: fetchError } = await supabase
        .from('wordle-answers')
        .select('date, answer, hints')
        .order('date', { ascending: false });
    
    if (fetchError) {
        console.error('Error fetching:', fetchError);
        return;
    }
    
    console.log(`\n📊 Final database state - Total: ${allData.length} records`);
    allData.forEach(record => {
        const hintsInfo = Array.isArray(record.hints) && record.hints.length > 0
            ? `${record.hints.length} hints (${typeof record.hints[0]})`
            : 'No hints';
        console.log(`  ${record.date}: ${record.answer} - ${hintsInfo}`);
    });
    
    // 检查日期范围
    const dates = allData.map(r => r.date).sort();
    console.log(`\n📅 Date range: ${dates[dates.length - 1]} to ${dates[0]}`);
    
    // 检查是否有重复日期
    const dateCount: { [key: string]: number } = {};
    dates.forEach(date => {
        dateCount[date] = (dateCount[date] || 0) + 1;
    });
    
    const duplicates = Object.keys(dateCount).filter(date => dateCount[date] > 1);
    if (duplicates.length > 0) {
        console.log('⚠️ Still have duplicates:', duplicates);
    } else {
        console.log('✅ No duplicates found');
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

forceCleanJuly8().catch(console.error);