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

async function insertJuly12Data() {
  console.log('🔄 手动插入July 12数据...');
  
  const july12Data = {
    date: '2025-07-12',
    puzzle_number: calculatePuzzleNumber('2025-07-12'),
    answer: 'EXILE',
    hints: [
      { type: 'clue', value: 'This word describes a situation where someone is banished from their homeland.' },
      { type: 'clue', value: 'The word contains three vowels and two consonants.' },
      { type: 'clue', value: 'It begins with the fifth letter of the alphabet.' },
      { type: 'clue', value: 'A person who is forced to live away from their native country.' },
      { type: 'clue', value: 'To expel someone from their homeland as punishment.' },
      { type: 'clue', value: 'A form of punishment that involves banishment.' },
      { type: 'clue', value: 'The state of being barred from one\'s native country.' },
      { type: 'clue', value: 'Napoleon was sent to this fate on the island of Elba.' }
    ],
    difficulty: 'Medium',
    definition: 'The state of being barred from one\'s native country, typically for political or punitive reasons'
  };
  
  console.log(`日期: ${july12Data.date}`);
  console.log(`期数: ${july12Data.puzzle_number}`);
  console.log(`答案: ${july12Data.answer}`);
  console.log(`提示数: ${july12Data.hints.length}`);
  
  try {
    // 先检查是否已存在
    const { data: existing } = await supabase
      .from('wordle-answers')
      .select('*')
      .eq('date', '2025-07-12');
    
    if (existing && existing.length > 0) {
      console.log('⚠️ July 12数据已存在，跳过插入');
      return;
    }
    
    const { data, error } = await supabase
      .from('wordle-answers')
      .insert(july12Data)
      .select();
    
    if (error) {
      console.error('❌ 插入失败:', error);
    } else {
      console.log('✅ July 12数据插入成功!', data);
    }
  } catch (err) {
    console.error('❌ 操作失败:', err);
  }
}

insertJuly12Data();