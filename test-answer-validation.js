// 验证是否为有效的 Wordle 答案
function isValidWordleAnswer(word) {
  if (!word || typeof word !== 'string') return false;
  if (word.length !== 5) return false;
  if (!/^[A-Z]+$/i.test(word)) return false;
  
  // 排除一些明显不是答案的词
  const invalidWords = [
    'WORDL', 'HINTS', 'SOLVE', 'ANSWER', 'TODAY', 'DAILY', 'PUZZLE', 'GAMES'
  ];
  return !invalidWords.includes(word.toUpperCase());
}

// 从文本中提取可能的答案
function extractPossibleAnswers(text) {
  const words = text.match(/\b[A-Z]{5}\b/gi) || [];
  return words.filter(isValidWordleAnswer).map(w => w.toUpperCase());
}

console.log('Testing answer validation...');
console.log('SOLVE is valid:', isValidWordleAnswer('SOLVE'));
console.log('HINTS is valid:', isValidWordleAnswer('HINTS'));
console.log('IMAGE is valid:', isValidWordleAnswer('IMAGE'));
console.log('WORDL is valid:', isValidWordleAnswer('WORDL'));

// 测试从 NYT 手动获取 July 22 答案
const axios = require('axios');
const cheerio = require('cheerio');

async function testNYTDirect() {
  console.log('\nTesting NYT direct access...');
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/'
  };
  
  const nytReviewUrl = 'https://www.nytimes.com/2025/07/21/crosswords/wordle-review-1494.html';
  
  try {
    const response = await axios.get(nytReviewUrl, { headers, timeout: 15000 });
    const $ = cheerio.load(response.data);
    const bodyText = $.text();
    
    console.log('Response status:', response.status);
    console.log('Page title:', $('title').text());
    
    // 提取所有可能的 5 字母单词
    const possibleAnswers = extractPossibleAnswers(bodyText);
    console.log('Possible answers found:', possibleAnswers);
    
    // 查找特定模式
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
        console.log(`Found valid answer with pattern: ${match[1].toUpperCase()}`);
        return match[1].toUpperCase();
      }
    }
    
    // 如果模式匹配失败，返回最可能的答案
    if (possibleAnswers.length > 0) {
      console.log(`Using first valid answer: ${possibleAnswers[0]}`);
      return possibleAnswers[0];
    }
    
  } catch (error) {
    console.log(`NYT access failed: ${error.message}`);
  }
  
  return null;
}

testNYTDirect().then(answer => {
  console.log(`\nFinal answer for July 22: ${answer || 'NOT FOUND'}`);
}).catch(console.error);