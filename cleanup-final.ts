import { supabase } from './src/lib/supabase';

async function cleanupDuplicateAndTestData() {
    console.log('🧹 Cleaning up duplicate and test data...');
    
    // 获取所有数据，按日期分组
    const { data: allData, error: fetchError } = await supabase
        .from('wordle-answers')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (fetchError) {
        console.error('Error fetching data:', fetchError);
        return;
    }
    
    console.log(`Total records: ${allData.length}`);
    
    // 删除7月9日的测试数据（这不是真实日期）
    console.log('\n🗑️ Deleting test data (2025-07-09)...');
    const { error: deleteTestError } = await supabase
        .from('wordle-answers')
        .delete()
        .eq('date', '2025-07-09');
    
    if (deleteTestError) {
        console.error('Error deleting test data:', deleteTestError);
    } else {
        console.log('✅ Deleted test data');
    }
    
    // 处理重复的7月8日数据
    console.log('\n📊 Finding duplicate July 8th records...');
    const july8Records = allData.filter(record => record.date === '2025-07-08');
    console.log(`Found ${july8Records.length} July 8th records`);
    
    if (july8Records.length > 1) {
        // 找出正确的记录（hints是字符串数组的）
        const correctRecord = july8Records.find(record => 
            Array.isArray(record.hints) && 
            record.hints.length > 0 && 
            typeof record.hints[0] === 'string'
        );
        
        if (correctRecord) {
            console.log(`✅ Found correct record: ID ${correctRecord.id.slice(0, 8)}...`);
            
            // 删除其他的July 8th记录
            const recordsToDelete = july8Records.filter(record => record.id !== correctRecord.id);
            
            for (const record of recordsToDelete) {
                console.log(`🗑️ Deleting duplicate record: ID ${record.id.slice(0, 8)}...`);
                const { error: deleteError } = await supabase
                    .from('wordle-answers')
                    .delete()
                    .eq('id', record.id);
                
                if (deleteError) {
                    console.error(`❌ Error deleting ${record.id}:`, deleteError);
                } else {
                    console.log(`✅ Deleted ${record.id.slice(0, 8)}...`);
                }
            }
        }
    }
    
    // 验证最终结果
    console.log('\n📊 Final verification...');
    const { data: finalData, error: finalError } = await supabase
        .from('wordle-answers')
        .select('date, answer, hints')
        .order('date', { ascending: false })
        .limit(5);
    
    if (finalError) {
        console.error('Error in final verification:', finalError);
    } else {
        console.log(`\n✅ Final result: ${finalData.length} recent records`);
        finalData.forEach(record => {
            const hintsInfo = Array.isArray(record.hints) && record.hints.length > 0
                ? `${record.hints.length} hints (${typeof record.hints[0]})`
                : 'No hints';
            console.log(`  ${record.date}: ${record.answer} - ${hintsInfo}`);
        });
    }
}

// 设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

cleanupDuplicateAndTestData().catch(console.error);