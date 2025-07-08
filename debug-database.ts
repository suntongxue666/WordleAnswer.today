import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
    console.log('🔍 调试数据库问题...');
    
    try {
        // 1. 检查今天的数据
        const today = '2025-07-08';
        const { data: todayData, error: todayError } = await supabase
            .from('wordle-answers')
            .select('*')
            .eq('date', today);
            
        if (todayError) {
            console.error('❌ 获取今天数据失败:', todayError);
        } else {
            console.log(`📅 今天 (${today}) 的数据: ${todayData.length} 条`);
            todayData.forEach(record => {
                console.log(`  ID: ${record.id}, Answer: ${record.answer}, Puzzle: ${record.puzzle_number}`);
                console.log(`  Hints: ${record.hints?.length || 0} 条`);
            });
        }
        
        // 2. 检查最近的数据
        const { data: recentData, error: recentError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false })
            .limit(5);
            
        if (recentError) {
            console.error('❌ 获取最近数据失败:', recentError);
        } else {
            console.log(`\n📊 最近5条数据:`);
            recentData.forEach(record => {
                console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
                console.log(`    Hints: ${record.hints?.length || 0} 条, Difficulty: ${record.difficulty || 'N/A'}`);
            });
        }
        
        // 3. 检查是否有完整的记录（有答案、提示、puzzle_number）
        const { data: completeData, error: completeError } = await supabase
            .from('wordle-answers')
            .select('*')
            .not('puzzle_number', 'is', null)
            .not('answer', 'is', null)
            .order('date', { ascending: false });
            
        if (completeError) {
            console.error('❌ 获取完整数据失败:', completeError);
        } else {
            console.log(`\n✅ 完整记录（有puzzle_number和answer）: ${completeData.length} 条`);
            completeData.slice(0, 3).forEach(record => {
                console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
                console.log(`    Hints: ${record.hints?.length || 0} 条, Difficulty: ${record.difficulty || 'N/A'}`);
            });
        }
        
        // 4. 测试网站的获取逻辑
        console.log('\n🧪 测试网站获取逻辑...');
        
        // 模拟 getTodaysWordle 函数
        const { data: websiteData, error: websiteError } = await supabase
            .from('wordle-answers')
            .select('*')
            .eq('date', today)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (websiteError) {
            console.error('❌ 网站查询失败:', websiteError);
        } else {
            console.log(`🌐 网站会获取到的数据: ${websiteData.length} 条`);
            if (websiteData.length > 0) {
                const record = websiteData[0];
                console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
                console.log(`  Hints: ${record.hints?.length || 0} 条`);
                console.log(`  完整性: ${record.puzzle_number ? '✅' : '❌'} puzzle_number, ${record.answer ? '✅' : '❌'} answer`);
            }
        }
        
    } catch (error) {
        console.error('❌ 调试过程出错:', error);
    }
}

debugDatabase().catch(console.error);