import { supabase } from './src/lib/supabase';

async function testDirectHintsInsert() {
    console.log('🧪 Testing direct hints insert...');
    
    // 首先删除测试数据
    await supabase
        .from('wordle-answers')
        .delete()
        .eq('date', '2025-07-08');
    
    // 测试不同的hints格式
    const testFormats = [
        {
            name: 'String array format',
            hints: [
                'This word often describes a strong feeling of fear or apprehension.',
                'It contains two vowels and three consonants.',
                'The first letter is the fourth letter of the alphabet.'
            ]
        },
        {
            name: 'Object array with type and value',
            hints: [
                { type: 'clue', value: 'This word often describes a strong feeling of fear or apprehension.' },
                { type: 'clue', value: 'It contains two vowels and three consonants.' },
                { type: 'clue', value: 'The first letter is the fourth letter of the alphabet.' }
            ]
        }
    ];
    
    for (let i = 0; i < testFormats.length; i++) {
        const format = testFormats[i];
        console.log(`\n📝 Testing ${format.name}...`);
        
        const testData = {
            date: `2025-07-0${8 + i}`, // 使用不同日期避免冲突
            puzzle_number: null,
            answer: 'DREAD',
            hints: format.hints,
            difficulty: null,
            definition: null
        };
        
        console.log('Inserting:', JSON.stringify(testData.hints, null, 2));
        
        const { data, error } = await supabase
            .from('wordle-answers')
            .insert([testData])
            .select();
        
        if (error) {
            console.error(`❌ Error with ${format.name}:`, error);
        } else {
            console.log(`✅ Success with ${format.name}`);
            if (data && data.length > 0) {
                console.log('Stored hints:', JSON.stringify(data[0].hints, null, 2));
            }
        }
    }
    
    // 检查数据库中所有记录的hints格式
    console.log('\n📊 Checking all hints formats in database:');
    const { data: allData, error: fetchError } = await supabase
        .from('wordle-answers')
        .select('date, answer, hints')
        .order('date', { ascending: false })
        .limit(5);
    
    if (fetchError) {
        console.error('Error fetching:', fetchError);
    } else {
        allData?.forEach(record => {
            console.log(`\n${record.date} (${record.answer}):`);
            if (Array.isArray(record.hints) && record.hints.length > 0) {
                console.log('  First hint type:', typeof record.hints[0]);
                console.log('  First hint:', JSON.stringify(record.hints[0], null, 2));
            }
        });
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

testDirectHintsInsert().catch(console.error);