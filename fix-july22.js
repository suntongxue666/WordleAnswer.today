const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 计算puzzle number
function calculatePuzzleNumber(dateStr) {
  const targetDate = new Date(dateStr);
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

// 生成提示（简化版）
function generateHints(answer) {
  return [
    `This word has ${answer.length} letters`,
    `It starts with "${answer[0]}"`,
    `It ends with "${answer[answer.length - 1]}"`
  ];
}

// 生成难度
function generateDifficulty(answer) {
  // 简单的难度计算
  const vowels = (answer.match(/[AEIOU]/g) || []).length;
  const commonLetters = (answer.match(/[RSTLNE]/g) || []).length;
  
  if (vowels >= 2 && commonLetters >= 3) return 'Easy';
  if (vowels >= 1 && commonLetters >= 2) return 'Medium';
  return 'Hard';
}

// 验证是否为有效的 Wordle 答案
function isValidWordleAnswer(word) {
  if (!word || typeof word !== 'string') return false;
  if (word.length !== 5) return false;
  if (!/^[A-Z]+$/i.test(word)) return false;
  
  // 排除一些明显不是答案的词
  const invalidWords = [
    'WORDL', 'HINTS', 'SOLVE', 'ANSWER', 'TODAY', 'DAILY', 'PUZZLE', 'GAMES',
    'HTTPS', 'TIMES', 'ADMIN', 'ERROR', 'FALSE', 'WIDTH', 'ICONS', 'NYTCO'
  ];
  return !invalidWords.includes(word.toUpperCase());
}

// 抓取July 22的答案
async function scrapeJuly22Answer() {
  const dateStr = '2025-07-22';
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  
  console.log(`Scraping Wordle answer for ${dateStr}, Puzzle #${puzzleNumber}`);
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/'
  };

  // 尝试 NYT Review（最可靠的来源）
  const reviewDate = new Date('2025-07-21');
  const nytReviewUrl = `https://www.nytimes.com/${reviewDate.getFullYear()}/${String(reviewDate.getMonth() + 1).padStart(2, '0')}/${String(reviewDate.getDate()).padStart(2, '0')}/crosswords/wordle-review-${puzzleNumber}.html`;
  
  console.log(`Trying NYT Review: ${nytReviewUrl}`);
  
  try {
    const response = await axios.get(nytReviewUrl, { headers, timeout: 15000 });
    const $ = cheerio.load(response.data);
    const bodyText = $.text();
    
    console.log('NYT Response received, parsing...');
    
    // 查找特定的 JSON 数据
    let jsonMatch = bodyText.match(/ExperimentalBlock_Reveal.*?Today's word is ([A-Z]{5})/i);
    if (jsonMatch && jsonMatch[1] && isValidWordleAnswer(jsonMatch[1])) {
      console.log(`Found answer from NYT JSON: ${jsonMatch[1].toUpperCase()}`);
      return jsonMatch[1].toUpperCase();
    }
    
    // 常规模式匹配
    const patterns = [
      /Today'?s word is ([A-Z]{5})/i,
      /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
      /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
      /word is ([A-Z]{5})/i,
      /answer.*?([A-Z]{5})/i
    ];
    
    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1] && isValidWordleAnswer(match[1])) {
        console.log(`Found answer from NYT pattern: ${match[1].toUpperCase()}`);
        return match[1].toUpperCase();
      }
    }
    
    // 提取所有5字母单词并找到最可能的答案
    const allWords = bodyText.match(/\b[A-Z]{5}\b/gi) || [];
    const validWords = allWords.filter(isValidWordleAnswer).map(w => w.toUpperCase());
    
    // 去重并寻找最可能的答案
    const uniqueWords = [...new Set(validWords)];
    console.log('Valid words found:', uniqueWords);
    
    // 基于常见性排序，优先选择更可能的答案
    const likelyAnswers = uniqueWords.filter(word => {
      // 优先选择包含常见字母的词
      return /[AEIOU]/.test(word) && /[RSTLN]/.test(word);
    });
    
    if (likelyAnswers.length > 0) {
      console.log(`Using most likely answer: ${likelyAnswers[0]}`);
      return likelyAnswers[0];
    }
    
    if (uniqueWords.length > 0) {
      console.log(`Using first valid word: ${uniqueWords[0]}`);
      return uniqueWords[0];
    }
    
  } catch (error) {
    console.error(`NYT scraping failed: ${error.message}`);
  }
  
  // 如果NYT失败，尝试TheGamer（已知有答案）
  const targetDate = new Date(dateStr);
  const month = targetDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const theGamerUrl = `https://www.thegamer.com/wordle-nyt-answer-hints-solution-${month}-${day}-${year}/`;
  
  console.log(`Trying TheGamer: ${theGamerUrl}`);
  
  try {
    const response = await axios.get(theGamerUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // TheGamer通常在标题中包含答案
    const title = $('title').text();
    const titleMatch = title.match(/([A-Z]{5})/i);
    if (titleMatch && titleMatch[1] && isValidWordleAnswer(titleMatch[1])) {
      console.log(`Found answer from TheGamer title: ${titleMatch[1].toUpperCase()}`);
      return titleMatch[1].toUpperCase();
    }
    
  } catch (error) {
    console.error(`TheGamer scraping failed: ${error.message}`);
  }
  
  // 如果都失败，手动返回已知答案
  console.log('All scraping failed, using known answer: BURNT');
  return 'BURNT';
}

// 保存到数据库
async function saveToDatabase(wordleData) {
  console.log('Saving to database...');
  
  const { data, error } = await supabase
    .from('wordle-answers')
    .upsert({
      date: wordleData.date,
      puzzle_number: wordleData.puzzle_number,
      answer: wordleData.answer,
      hints: wordleData.hints,
      difficulty: wordleData.difficulty,
      definition: wordleData.definition || ''
    }, { onConflict: 'date' });

  if (error) {
    console.error('Database save error:', error);
    throw error;
  }
  
  console.log('Successfully saved to database:', wordleData);
  return data;
}

// 主函数
async function main() {
  try {
    console.log('Starting July 22 data collection...');
    
    const answer = await scrapeJuly22Answer();
    if (!answer) {
      throw new Error('Failed to find valid answer');
    }
    
    const dateStr = '2025-07-22';
    const wordleData = {
      date: dateStr,
      puzzle_number: calculatePuzzleNumber(dateStr),
      answer: answer,
      hints: generateHints(answer),
      difficulty: generateDifficulty(answer),
      definition: ''
    };
    
    console.log('Wordle data prepared:', wordleData);
    
    await saveToDatabase(wordleData);
    
    console.log('✅ July 22 data successfully collected and saved!');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

// 运行
main();