const axios = require('axios');
const cheerio = require('cheerio');

// 计算puzzle number
function calculatePuzzleNumber(dateStr) {
  const targetDate = new Date(dateStr);
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

// 测试 July 30 的数据源
async function testJuly30Sources() {
  const dateStr = '2025-07-30';
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  const targetDate = new Date(dateStr);
  
  console.log(`Testing scraping for ${dateStr}, Puzzle #${puzzleNumber}`);
  console.log('=' .repeat(60));
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/'
  };

  // 1. NYT Review URL (前一天发布)
  const reviewDate = new Date(targetDate);
  reviewDate.setDate(reviewDate.getDate() - 1);
  const nytReviewUrl = `https://www.nytimes.com/${reviewDate.getFullYear()}/${String(reviewDate.getMonth() + 1).padStart(2, '0')}/${String(reviewDate.getDate()).padStart(2, '0')}/crosswords/wordle-review-${puzzleNumber}.html`;
  
  console.log(`\n1. Testing NYT Review: ${nytReviewUrl}`);
  console.log(`   Review date: ${reviewDate.toDateString()}`);
  try {
    const response = await axios.get(nytReviewUrl, { headers, timeout: 15000 });
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    
    const $ = cheerio.load(response.data);
    const bodyText = $.text();
    
    // 检查页面是否包含相关内容
    if (bodyText.includes('Wordle') || bodyText.includes('wordle')) {
      console.log(`   ✅ Page contains Wordle content`);
      
      // 查找特定的 JSON 数据
      let jsonMatch = bodyText.match(/ExperimentalBlock_Reveal.*?Today's word is ([A-Z]{5})/i);
      if (jsonMatch && jsonMatch[1]) {
        console.log(`   ✅ Found answer in JSON format: ${jsonMatch[1].toUpperCase()}`);
      } else {
        // 常规模式匹配
        const patterns = [
          /Today'?s word is ([A-Z]{5})/i,
          /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
          /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
          /word is ([A-Z]{5})/i,
        ];
        
        let found = false;
        for (const pattern of patterns) {
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            console.log(`   ✅ Found answer with pattern: ${match[1].toUpperCase()}`);
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`   ❌ No answer pattern matched`);
          // 检查是否有5个大写字母的单词
          const allCapsWords = bodyText.match(/\b[A-Z]{5}\b/g);
          if (allCapsWords) {
            console.log(`   🔍 Found 5-letter caps words: ${allCapsWords.slice(0, 10).join(', ')}`);
          }
        }
      }
    } else {
      console.log(`   ❌ Page does not contain Wordle content`);
    }
  } catch (error) {
    console.log(`   ❌ NYT Review failed: ${error.message}`);
    if (error.response) {
      console.log(`   Response status: ${error.response.status}`);
    }
  }

  // 2. AppGamer URL
  const month = targetDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const appGamerUrl = `https://www.appgamer.com/wordle-${puzzleNumber}-hints-answer-${month}-${day}-${year}`;
  
  console.log(`\n2. Testing AppGamer: ${appGamerUrl}`);
  try {
    const response = await axios.get(appGamerUrl, { headers, timeout: 15000 });
    console.log(`   Status: ${response.status}`);
    
    const $ = cheerio.load(response.data);
    const title = $('title').text();
    console.log(`   Page title: ${title.substring(0, 100)}...`);
    
    // 检查页面是否存在且包含相关内容
    if (title.toLowerCase().includes('wordle') || title.toLowerCase().includes('404') === false) {
      const answerElements = $('h2:contains("Answer"), .answer, strong');
      let found = false;
      for (const element of answerElements.toArray()) {
        const text = $(element).text().trim();
        const match = text.match(/([A-Z]{5})/i);
        if (match && match[1] && match[1].length === 5) {
          console.log(`   ✅ Found answer in element: ${match[1].toUpperCase()}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        const bodyText = $.text();
        const patterns = [
          /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
          /today['']?s\s+wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
          /wordle\s+\d+\s+answer\s+is\s+["']?([A-Z]{5})["']?/i
        ];
        
        for (const pattern of patterns) {
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            console.log(`   ✅ Found answer in text: ${match[1].toUpperCase()}`);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        console.log(`   ❌ No answer found in AppGamer`);
      }
    } else {
      console.log(`   ❌ Page not found or invalid`);
    }
  } catch (error) {
    console.log(`   ❌ AppGamer failed: ${error.message}`);
    if (error.response) {
      console.log(`   Response status: ${error.response.status}`);
    }
  }

  // 3. 测试本地API
  console.log(`\n3. Testing local API`);
  try {
    const localResponse = await axios.get(`http://localhost:3000/api/wordle-scrape?date=${dateStr}`, {
      timeout: 30000
    });
    console.log(`   ✅ Local API response:`, localResponse.data);
  } catch (error) {
    console.log(`   ❌ Local API failed: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('Debug completed!');
}

testJuly30Sources().catch(console.error);