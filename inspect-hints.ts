import { supabase } from './src/lib/supabase';

async function inspectHintsStructure() {
    console.log('🔍 Inspecting hints data structure...\n');
    
    const { data, error } = await supabase
        .from('wordle-answers')
        .select('*')
        .eq('date', '2025-07-08')
        .limit(1);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    if (data && data.length > 0) {
        const record = data[0];
        console.log('📊 Raw data structure:');
        console.log('Date:', record.date);
        console.log('Answer:', record.answer);
        console.log('Hints type:', typeof record.hints);
        console.log('Hints array check:', Array.isArray(record.hints));
        console.log('Hints raw:', JSON.stringify(record.hints, null, 2));
        
        if (Array.isArray(record.hints)) {
            console.log('\n📝 Hints analysis:');
            record.hints.forEach((hint, index) => {
                console.log(`Hint ${index + 1}:`, typeof hint, ':', JSON.stringify(hint));
            });
        }
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

inspectHintsStructure().catch(console.error);