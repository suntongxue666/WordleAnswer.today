import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function keepOnlyGoodRecords() {
    console.log('🎯 保留有效记录，删除其他记录...');
    
    try {
        // 1. 获取所有记录
        const { data: allRecords, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取记录失败:', fetchError);
            return;
        }
        
        console.log(`📊 总共有 ${allRecords.length} 条记录`);
        
        // 2. 分离有效记录和无效记录
        const goodRecords = allRecords.filter(record => record.puzzle_number !== null);
        const badRecords = allRecords.filter(record => record.puzzle_number === null);
        
        console.log(`✅ 有效记录 (puzzle_number 不为 null): ${goodRecords.length} 条`);
        console.log(`❌ 无效记录 (puzzle_number 为 null): ${badRecords.length} 条`);
        
        // 3. 显示有效记录
        console.log('\n📋 有效记录列表:');
        goodRecords.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        // 4. 删除所有无效记录
        console.log(`\n🗑️  删除 ${badRecords.length} 条无效记录...`);
        
        const badRecordIds = badRecords.map(record => record.id);
        
        if (badRecordIds.length > 0) {
            const { error: deleteError } = await supabase
                .from('wordle-answers')
                .delete()
                .in('id', badRecordIds);
                
            if (deleteError) {
                console.error('❌ 批量删除失败:', deleteError);
                return;
            }
            
            console.log(`✅ 成功删除 ${badRecordIds.length} 条无效记录!`);
        }
        
        // 5. 验证最终结果
        const { data: finalData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        console.log(`\n🎯 最终结果: ${finalData.length} 条记录`);
        finalData.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        console.log('\n🎉 数据库清理完成！');
        console.log('🌐 网站现在应该可以正常显示了: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 清理过程出错:', error);
    }
}

keepOnlyGoodRecords().catch(console.error);