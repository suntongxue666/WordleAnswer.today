// 修复 July 21 答案的脚本
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 缺少 Supabase 配置。请确保 .env.local 文件中包含必要的环境变量。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixJuly21Answer() {
  const targetDate = '2025-07-21';
  const correctAnswer = 'TIZZY';
  const puzzleNumber = 1493; // 根据纽约时报的编号

  console.log(`开始修复 ${targetDate} 的 Wordle 答案...`);

  try {
    // 首先检查是否存在记录
    const { data: existingData, error: fetchError } = await supabase
      .from('wordle-answers')
      .select('*')
      .eq('date', targetDate)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // 生成提示
    const hints = [
      { type: 'structure', value: 'This word contains 1 vowel and 4 consonants.' },
      { type: 'position', value: 'It starts with the letter T and ends with Y.' },
      { type: 'definition', value: 'A state of frenzied excitement, especially over some trivial matter.' },
      { type: 'difficulty', value: 'This is a challenging word that might not be in everyone\'s everyday vocabulary.' }
    ];

    if (existingData) {
      console.log(`找到现有记录，答案为: ${existingData.answer}`);
      console.log(`更新为正确答案: ${correctAnswer}`);

      // 更新现有记录
      const { data, error } = await supabase
        .from('wordle-answers')
        .update({
          answer: correctAnswer,
          hints: hints,
          difficulty: 'Hard',
          puzzle_number: puzzleNumber
        })
        .eq('date', targetDate);

      if (error) throw error;
      console.log('✅ 成功更新记录!');
    } else {
      console.log(`未找到 ${targetDate} 的记录，创建新记录...`);

      // 创建新记录
      const { data, error } = await supabase
        .from('wordle-answers')
        .insert({
          date: targetDate,
          answer: correctAnswer,
          hints: hints,
          difficulty: 'Hard',
          puzzle_number: puzzleNumber
        });

      if (error) throw error;
      console.log('✅ 成功创建记录!');
    }

    // 验证更新
    const { data: verifyData, error: verifyError } = await supabase
      .from('wordle-answers')
      .select('*')
      .eq('date', targetDate)
      .single();

    if (verifyError) throw verifyError;

    console.log('📊 更新后的数据:');
    console.log(`- 日期: ${verifyData.date}`);
    console.log(`- 答案: ${verifyData.answer}`);
    console.log(`- 难度: ${verifyData.difficulty}`);
    console.log(`- Puzzle 编号: ${verifyData.puzzle_number}`);
    console.log(`- 提示数量: ${verifyData.hints ? verifyData.hints.length : 0}`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 执行修复
fixJuly21Answer();