import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 计算 puzzle number 的函数（与网站代码一致）
const calculatePuzzleNumber = (dateString: string): number => {
  const baseDate = new Date('2025-07-07'); // 基准日期：7月7日
  const basePuzzleNumber = 1479; // 基准期数
  
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return basePuzzleNumber + diffDays;
};

async function fixPuzzleNumbers() {
    console.log('🔧 修复生产数据库中的 puzzle_number...');
    
    try {
        // 获取所有数据
        const { data: allData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('id, date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取数据失败:', fetchError);
            return;
        }
        
        console.log(`📊 找到 ${allData.length} 条记录需要检查`);
        
        let updatedCount = 0;
        
        for (const record of allData) {
            const correctPuzzleNumber = calculatePuzzleNumber(record.date);
            
            if (record.puzzle_number !== correctPuzzleNumber) {
                console.log(`🔄 更新 ${record.date}: ${record.answer} -> Puzzle #${correctPuzzleNumber}`);
                
                const { error: updateError } = await supabase
                    .from('wordle-answers')
                    .update({ puzzle_number: correctPuzzleNumber })
                    .eq('id', record.id);
                    
                if (updateError) {
                    console.error(`❌ 更新失败 ${record.date}:`, updateError);
                } else {
                    updatedCount++;
                }
            } else {
                console.log(`✅ ${record.date}: ${record.answer} - Puzzle #${correctPuzzleNumber} (已正确)`);
            }
        }
        
        console.log(`🎉 成功更新了 ${updatedCount} 条记录!`);
        
        // 验证更新结果
        const { data: verifyData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false })
            .limit(5);
            
        console.log('📅 最新5条数据验证:');
        verifyData?.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        console.log('✅ 修复完成！网站应该可以正常显示内容了');
        console.log('🌐 请访问: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 修复过程出错:', error);
    }
}

fixPuzzleNumbers().catch(console.error);