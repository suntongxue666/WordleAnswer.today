import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 计算 puzzle number 的函数
const calculatePuzzleNumber = (dateString: string): number => {
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
};

async function resetDatabaseWithCorrectData() {
    console.log('🔄 重置生产数据库...');
    
    try {
        // 1. 先获取现有数据
        const { data: existingData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取现有数据失败:', fetchError);
            return;
        }
        
        console.log(`📊 找到 ${existingData.length} 条现有记录`);
        
        // 2. 删除所有现有数据
        const { error: deleteError } = await supabase
            .from('wordle-answers')
            .delete()
            .gte('date', '2025-06-01'); // 删除6月以后的所有数据
            
        if (deleteError) {
            console.error('❌ 删除现有数据失败:', deleteError);
            return;
        }
        
        console.log('🗑️  已清空现有数据');
        
        // 3. 准备正确的数据（使用现有的答案但添加正确的 puzzle_number）
        const correctedData = existingData.map(record => ({
            date: record.date,
            puzzle_number: calculatePuzzleNumber(record.date),
            answer: record.answer.toUpperCase(), // 确保大写
            hints: record.hints || [],
            difficulty: record.difficulty || 'Medium',
            definition: record.definition || null
        }));
        
        console.log('📝 准备插入修正后的数据...');
        correctedData.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        // 4. 重新插入数据
        const { data: insertedData, error: insertError } = await supabase
            .from('wordle-answers')
            .insert(correctedData)
            .select();
            
        if (insertError) {
            console.error('❌ 插入数据失败:', insertError);
            return;
        }
        
        console.log(`✅ 成功插入 ${insertedData.length} 条修正后的数据!`);
        
        // 5. 验证结果
        const { data: verifyData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false })
            .limit(5);
            
        console.log('📅 最新5条数据验证:');
        verifyData?.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        console.log('🎉 数据库重置完成！');
        console.log('🌐 请访问: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 重置过程出错:', error);
    }
}

resetDatabaseWithCorrectData().catch(console.error);