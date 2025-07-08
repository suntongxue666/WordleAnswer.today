import { supabase } from './src/lib/supabase';

async function cleanupDuplicateData() {
    try {
        console.log('开始清理重复数据...');
        
        // 1. 获取所有数据并按日期分组
        const { data: allData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (fetchError) {
            console.error('获取数据时出错:', fetchError);
            return;
        }
        
        console.log(`总共找到 ${allData.length} 条记录`);
        
        // 2. 找出重复的日期
        const dateGroups: { [key: string]: any[] } = {};
        allData.forEach(record => {
            if (!dateGroups[record.date]) {
                dateGroups[record.date] = [];
            }
            dateGroups[record.date].push(record);
        });
        
        // 3. 找出有重复的日期
        const duplicateDates = Object.keys(dateGroups).filter(date => dateGroups[date].length > 1);
        console.log('发现重复的日期:', duplicateDates);
        
        // 4. 对每个重复的日期，保留最新的记录，删除旧的
        for (const date of duplicateDates) {
            const records = dateGroups[date];
            console.log(`\n处理日期 ${date}, 有 ${records.length} 条记录:`);
            
            // 按created_at排序，保留最新的
            records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            const keepRecord = records[0]; // 保留最新的
            const deleteRecords = records.slice(1); // 删除其他的
            
            console.log(`保留记录 ID: ${keepRecord.id} (创建时间: ${keepRecord.created_at})`);
            
            for (const deleteRecord of deleteRecords) {
                console.log(`删除记录 ID: ${deleteRecord.id} (创建时间: ${deleteRecord.created_at})`);
                
                const { error: deleteError } = await supabase
                    .from('wordle-answers')
                    .delete()
                    .eq('id', deleteRecord.id);
                
                if (deleteError) {
                    console.error(`删除记录 ${deleteRecord.id} 时出错:`, deleteError);
                } else {
                    console.log(`✅ 成功删除记录 ${deleteRecord.id}`);
                }
            }
        }
        
        // 5. 显示清理后的数据统计
        const { data: finalData, error: finalError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: false });
        
        if (finalError) {
            console.error('获取最终数据时出错:', finalError);
            return;
        }
        
        console.log('\n🎉 清理完成!');
        console.log(`清理后总共有 ${finalData.length} 条记录`);
        console.log('日期范围:', finalData.map(r => r.date).sort());
        
    } catch (error) {
        console.error('清理过程中出错:', error);
    }
}

// 设置环境变量并运行
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

cleanupDuplicateData().catch(console.error);