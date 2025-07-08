import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalCleanup() {
    console.log('🧹 最终清理数据库...');
    
    try {
        // 1. 获取所有数据，按日期分组
        const { data: allData, error } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false });
            
        if (error) {
            console.error('❌ 获取数据失败:', error);
            return;
        }
        
        // 2. 按日期分组
        const dateGroups: { [key: string]: any[] } = {};
        allData.forEach(record => {
            if (!dateGroups[record.date]) {
                dateGroups[record.date] = [];
            }
            dateGroups[record.date].push(record);
        });
        
        // 3. 对每个日期，只保留最好的记录
        for (const [date, records] of Object.entries(dateGroups)) {
            if (records.length > 1) {
                console.log(`📅 ${date}: 发现 ${records.length} 条记录`);
                
                // 优先级：有puzzle_number的 > 没有puzzle_number的
                const validRecords = records.filter(r => r.puzzle_number !== null);
                const invalidRecords = records.filter(r => r.puzzle_number === null);
                
                let toKeep: any = null;
                let toDelete: any[] = [];
                
                if (validRecords.length > 0) {
                    // 如果有有效记录，保留第一个有效记录
                    toKeep = validRecords[0];
                    toDelete = [...validRecords.slice(1), ...invalidRecords];
                } else {
                    // 如果都是无效记录，保留第一个
                    toKeep = invalidRecords[0];
                    toDelete = invalidRecords.slice(1);
                }
                
                console.log(`  保留: ${toKeep.answer} (Puzzle #${toKeep.puzzle_number})`);
                console.log(`  删除: ${toDelete.length} 条记录`);
                
                // 删除多余的记录
                for (const record of toDelete) {
                    const { error: deleteError } = await supabase
                        .from('wordle-answers')
                        .delete()
                        .eq('id', record.id);
                        
                    if (deleteError) {
                        console.error(`❌ 删除失败 ${record.id}:`, deleteError);
                    } else {
                        console.log(`  ✅ 删除了 ${record.id}`);
                    }
                }
            } else {
                console.log(`📅 ${date}: 1 条记录，无需处理`);
            }
        }
        
        // 4. 验证最终结果
        const { data: finalData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        console.log(`\n🎯 最终结果: ${finalData.length} 条记录`);
        finalData.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        // 5. 检查今天的数据
        const today = '2025-07-08';
        const todayRecord = finalData.find(r => r.date === today);
        
        if (todayRecord && todayRecord.puzzle_number) {
            console.log(`\n✅ 今天的数据完整: ${todayRecord.answer} - Puzzle #${todayRecord.puzzle_number}`);
            console.log('🌐 网站应该可以正常显示了!');
        } else {
            console.log('\n❌ 今天的数据还不完整');
        }
        
        console.log('\n📋 下一步：');
        console.log('1. 检查 Vercel 环境变量设置');
        console.log('2. 在 Vercel 控制台重新部署');
        console.log('3. 访问 https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 清理过程出错:', error);
    }
}

finalCleanup().catch(console.error);