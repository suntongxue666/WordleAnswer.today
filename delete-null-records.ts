import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteNullRecords() {
    console.log('🗑️  删除 puzzle_number 为 null 的记录...');
    
    try {
        // 1. 查看要删除的记录
        const { data: nullRecords, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('id, date, answer, puzzle_number')
            .is('puzzle_number', null);
            
        if (fetchError) {
            console.error('❌ 查询 null 记录失败:', fetchError);
            return;
        }
        
        console.log(`📊 找到 ${nullRecords.length} 条 puzzle_number 为 null 的记录:`);
        nullRecords.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} (ID: ${record.id})`);
        });
        
        // 2. 逐条删除这些记录
        let deletedCount = 0;
        for (const record of nullRecords) {
            const { error: deleteError } = await supabase
                .from('wordle-answers')
                .delete()
                .eq('id', record.id);
                
            if (deleteError) {
                console.error(`❌ 删除记录失败 ${record.date}:`, deleteError);
            } else {
                console.log(`✅ 已删除: ${record.date} (ID: ${record.id})`);
                deletedCount++;
            }
        }
        
        console.log(`🎉 总共删除了 ${deletedCount} 条记录!`);
        
        // 3. 验证剩余数据
        const { data: remainingData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        console.log(`📊 剩余 ${remainingData.length} 条记录:`);
        remainingData.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        // 4. 检查日期连续性
        const dates = remainingData.map(r => r.date).sort();
        console.log(`📅 日期范围: ${dates[dates.length - 1]} 到 ${dates[0]}`);
        
        console.log('✅ 清理完成！现在网站应该可以正常显示了');
        console.log('🌐 请访问: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 删除过程出错:', error);
    }
}

deleteNullRecords().catch(console.error);