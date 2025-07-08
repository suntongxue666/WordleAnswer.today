import { supabase } from './src/lib/supabase';

async function forceCleanupDuplicates() {
    try {
        console.log('开始强制清理重复数据...');
        
        // 1. 获取所有数据
        const { data: allData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: true });
        
        if (fetchError) {
            console.error('获取数据时出错:', fetchError);
            return;
        }
        
        console.log(`总共找到 ${allData.length} 条记录`);
        
        // 2. 按日期分组并显示详细信息
        const dateGroups: { [key: string]: any[] } = {};
        allData.forEach(record => {
            if (!dateGroups[record.date]) {
                dateGroups[record.date] = [];
            }
            dateGroups[record.date].push(record);
        });
        
        console.log('\n所有日期和记录数:');
        Object.keys(dateGroups).sort().forEach(date => {
            console.log(`${date}: ${dateGroups[date].length} 条记录`);
            if (dateGroups[date].length > 1) {
                dateGroups[date].forEach((record, index) => {
                    console.log(`  - 记录 ${index + 1}: ID=${record.id.slice(0, 8)}..., 答案=${record.answer}, 创建时间=${record.created_at}`);
                });
            }
        });
        
        // 3. 对于重复的日期，只保留一条最新的记录
        for (const date of Object.keys(dateGroups)) {
            const records = dateGroups[date];
            if (records.length > 1) {
                console.log(`\n🔧 清理日期 ${date} 的重复数据...`);
                
                // 按created_at排序，保留最新的
                records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                
                const keepRecord = records[0];
                const deleteRecords = records.slice(1);
                
                console.log(`保留: ID=${keepRecord.id.slice(0, 8)}..., 答案=${keepRecord.answer}`);
                
                // 删除重复的记录
                for (const deleteRecord of deleteRecords) {
                    console.log(`删除: ID=${deleteRecord.id.slice(0, 8)}..., 答案=${deleteRecord.answer}`);
                    
                    const { error: deleteError } = await supabase
                        .from('wordle-answers')
                        .delete()
                        .eq('id', deleteRecord.id);
                    
                    if (deleteError) {
                        console.error(`❌ 删除失败:`, deleteError);
                    } else {
                        console.log(`✅ 删除成功`);
                    }
                    
                    // 等待一小段时间确保操作完成
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        
        // 4. 验证清理结果
        console.log('\n📊 验证清理结果...');
        const { data: finalData, error: finalError } = await supabase
            .from('wordle-answers')
            .select('*')
            .order('date', { ascending: true });
        
        if (finalError) {
            console.error('获取最终数据时出错:', finalError);
            return;
        }
        
        console.log(`\n🎉 清理完成! 现在总共有 ${finalData.length} 条记录`);
        
        // 检查是否还有重复
        const finalDateGroups: { [key: string]: any[] } = {};
        finalData.forEach(record => {
            if (!finalDateGroups[record.date]) {
                finalDateGroups[record.date] = [];
            }
            finalDateGroups[record.date].push(record);
        });
        
        const remainingDuplicates = Object.keys(finalDateGroups).filter(date => finalDateGroups[date].length > 1);
        if (remainingDuplicates.length > 0) {
            console.log('⚠️ 仍有重复的日期:', remainingDuplicates);
        } else {
            console.log('✅ 没有重复数据了!');
        }
        
        // 显示最终的日期列表
        console.log('\n📅 最终的日期列表:');
        Object.keys(finalDateGroups).sort().forEach(date => {
            const record = finalDateGroups[date][0];
            console.log(`${date}: ${record.answer}`);
        });
        
    } catch (error) {
        console.error('清理过程中出错:', error);
    }
}

// 设置环境变量并运行
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

forceCleanupDuplicates().catch(console.error);