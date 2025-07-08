import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanDuplicatesAndNulls() {
    console.log('🧹 清理重复数据和 null 值...');
    
    try {
        // 1. 删除所有 puzzle_number 为 null 的记录
        const { error: deleteNullError } = await supabase
            .from('wordle-answers')
            .delete()
            .is('puzzle_number', null);
            
        if (deleteNullError) {
            console.error('❌ 删除 null 记录失败:', deleteNullError);
        } else {
            console.log('🗑️  已删除所有 puzzle_number 为 null 的记录');
        }
        
        // 2. 查看剩余数据
        const { data: remainingData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取剩余数据失败:', fetchError);
            return;
        }
        
        console.log(`📊 剩余 ${remainingData.length} 条记录:`);
        remainingData.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        // 3. 检查是否还有重复的日期
        const dateCount: { [key: string]: number } = {};
        remainingData.forEach(record => {
            dateCount[record.date] = (dateCount[record.date] || 0) + 1;
        });
        
        const duplicates = Object.keys(dateCount).filter(date => dateCount[date] > 1);
        if (duplicates.length > 0) {
            console.log('⚠️  发现重复日期:', duplicates);
            
            // 为每个重复日期只保留一条记录（保留有 puzzle_number 的）
            for (const date of duplicates) {
                const { data: duplicateRecords } = await supabase
                    .from('wordle-answers')
                    .select('*')
                    .eq('date', date)
                    .order('puzzle_number', { ascending: false, nullsFirst: false });
                    
                if (duplicateRecords && duplicateRecords.length > 1) {
                    // 保留第一条（最好的），删除其他的
                    const toDelete = duplicateRecords.slice(1);
                    for (const record of toDelete) {
                        await supabase
                            .from('wordle-answers')
                            .delete()
                            .eq('id', record.id);
                    }
                    console.log(`🗑️  删除了 ${toDelete.length} 条重复记录 (${date})`);
                }
            }
        } else {
            console.log('✅ 没有发现重复记录');
        }
        
        // 4. 最终验证
        const { data: finalData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false })
            .limit(5);
            
        console.log('🎯 最终数据状态（最新5条）:');
        finalData?.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        console.log('✅ 清理完成！现在网站应该可以正常显示了');
        console.log('🌐 请访问: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 清理过程出错:', error);
    }
}

cleanDuplicatesAndNulls().catch(console.error);