import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
    console.log('🔍 验证生产数据库状态...');
    
    try {
        const { data, error } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false })
            .limit(3);
            
        if (error) {
            console.error('❌ 查询失败:', error);
            return;
        }
        
        console.log('📊 数据库最新3条记录:');
        data?.forEach(record => {
            console.log(`📅 ${record.date}: ${record.answer}`);
            console.log(`🔢 Puzzle Number: ${record.puzzle_number}`);
            console.log(`💡 Hints: ${record.hints?.length || 0} 条`);
            console.log(`📚 Difficulty: ${record.difficulty || 'N/A'}`);
            console.log('---');
        });
        
        // 检查是否有空的 puzzle_number
        const { data: nullData, error: nullError } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .is('puzzle_number', null);
            
        if (nullError) {
            console.error('❌ 查询 null 数据失败:', nullError);
        } else {
            if (nullData && nullData.length > 0) {
                console.log(`⚠️  还有 ${nullData.length} 条记录的 puzzle_number 为 null:`);
                nullData.forEach(record => {
                    console.log(`  ${record.date}: ${record.answer}`);
                });
            } else {
                console.log('✅ 所有记录的 puzzle_number 都已正确设置!');
            }
        }
        
    } catch (error) {
        console.error('❌ 验证过程出错:', error);
    }
}

verifyDatabase().catch(console.error);