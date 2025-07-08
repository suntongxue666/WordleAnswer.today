import { getTodaysWordle, getRecentWordles } from './src/lib/wordle-data';
import { format } from 'date-fns';

async function testDataFetching() {
    console.log('🔍 Testing data fetching...\n');
    
    // 设置环境变量
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';
    
    const today = new Date();
    const formattedTodaysDate = format(today, 'yyyy-MM-dd');
    
    console.log(`📅 Today's date: ${formattedTodaysDate}\n`);
    
    // 测试获取今天的数据
    console.log('1️⃣ Testing getTodaysWordle...');
    const todaysWordle = await getTodaysWordle(formattedTodaysDate);
    
    if (todaysWordle) {
        console.log('✅ Found today\'s Wordle:');
        console.log(`   Date: ${todaysWordle.date}`);
        console.log(`   Answer: ${todaysWordle.answer}`);
        console.log(`   Puzzle Number: ${todaysWordle.puzzle_number}`);
        console.log(`   Hints count: ${todaysWordle.hints ? todaysWordle.hints.length : 0}`);
        console.log(`   Difficulty: ${todaysWordle.difficulty}`);
        console.log(`   Definition: ${todaysWordle.definition}`);
        if (todaysWordle.hints && todaysWordle.hints.length > 0) {
            console.log('   First 3 hints:');
            todaysWordle.hints.slice(0, 3).forEach((hint, index) => {
                console.log(`     ${index + 1}. ${hint.value || hint}`);
            });
        }
    } else {
        console.log('❌ No data found for today');
    }
    
    console.log('\n2️⃣ Testing getRecentWordles...');
    const recentWordles = await getRecentWordles(15);
    
    console.log(`✅ Found ${recentWordles.length} recent Wordles:`);
    recentWordles.forEach((wordle, index) => {
        console.log(`   ${index + 1}. ${wordle.date}: ${wordle.answer} (${wordle.hints ? wordle.hints.length : 0} hints)`);
    });
    
    // 检查是否包含今天的数据
    const todayInRecent = recentWordles.find(w => w.date === formattedTodaysDate);
    console.log(`\n📊 Today's data in recent list: ${todayInRecent ? '✅ Yes' : '❌ No'}`);
    
    if (todayInRecent) {
        console.log(`   Answer: ${todayInRecent.answer}`);
        console.log(`   Hints: ${todayInRecent.hints ? todayInRecent.hints.length : 0}`);
    }
    
    // 测试过滤逻辑（模拟页面逻辑）
    const filteredRecent = recentWordles.filter(wordle => wordle.date !== todaysWordle?.date);
    console.log(`\n🔄 After filtering (excluding today's data): ${filteredRecent.length} items`);
    filteredRecent.slice(0, 5).forEach((wordle, index) => {
        console.log(`   ${index + 1}. ${wordle.date}: ${wordle.answer}`);
    });
}

testDataFetching().catch(console.error);