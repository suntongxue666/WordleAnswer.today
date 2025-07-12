const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc2NDk4MCwiZXhwIjoyMDY3MzQwOTgwfQ.3gVftPZCSmwrus1RVkrEIzcZerp5mOaSVLdaS_tLbwc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 计算Wordle期数
function calculatePuzzleNumber(dateString) {
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

async function insertWordleData() {
  console.log('🔄 手动插入July 11数据...');
  
  const july11Data = {
    date: '2025-07-11',
    puzzle_number: calculatePuzzleNumber('2025-07-11'),
    answer: 'BRAND',
    hints: [
      { type: 'clue', value: 'A trademark or distinctive name identifying a product or manufacturer' },
      { type: 'clue', value: 'To mark permanently, as with a hot iron' },
      { type: 'clue', value: 'A particular variety or type of something' },
      { type: 'clue', value: 'To impress or fix indelibly in the mind' },
      { type: 'clue', value: 'Nike, Apple, and Coca-Cola are examples of this' },
      { type: 'clue', value: 'What cattle ranchers do to mark their livestock' },
      { type: 'clue', value: 'A company\'s identity and reputation in the market' },
      { type: 'clue', value: 'To label or categorize someone or something' }
    ],
    difficulty: 'Medium',
    definition: 'A trademark or distinctive name identifying a product or manufacturer'
  };
  
  console.log(`期数: ${july11Data.puzzle_number}`);
  console.log(`答案: ${july11Data.answer}`);
  console.log(`提示数: ${july11Data.hints.length}`);
  
  try {
    // 先检查是否已存在
    const { data: existing } = await supabase
      .from('wordle-answers')
      .select('*')
      .eq('date', '2025-07-11');
    
    if (existing && existing.length > 0) {
      console.log('⚠️ July 11数据已存在，跳过插入');
      return;
    }
    
    const { data, error } = await supabase
      .from('wordle-answers')
      .insert(july11Data)
      .select();
    
    if (error) {
      console.error('❌ 插入失败:', error);
    } else {
      console.log('✅ July 11数据插入成功!', data);
    }
  } catch (err) {
    console.error('❌ 操作失败:', err);
  }
}

insertWordleData();