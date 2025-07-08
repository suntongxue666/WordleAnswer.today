// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

import { supabase } from './src/lib/supabase';

async function checkProductionDB() {
    console.log('🔍 检查生产环境数据库连接...');
    
    try {
        // 检查数据库连接
        const { data: connectionTest, error: connectionError } = await supabase
            .from('wordle-answers')
            .select('count')
            .limit(1);
            
        if (connectionError) {
            console.error('❌ 数据库连接失败:', connectionError);
            return;
        }
        
        console.log('✅ 数据库连接成功');
        
        // 检查现有数据
        const { data: existingData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取数据失败:', fetchError);
            return;
        }
        
        console.log(`📊 当前数据库记录数: ${existingData.length}`);
        
        if (existingData.length > 0) {
            console.log('📅 现有数据:');
            existingData.forEach(record => {
                console.log(`  ${record.date}: ${record.answer} (Puzzle #${record.puzzle_number})`);
            });
        } else {
            console.log('📭 数据库为空，需要导入数据');
        }
        
    } catch (error) {
        console.error('❌ 检查过程出错:', error);
    }
}

checkProductionDB().catch(console.error);