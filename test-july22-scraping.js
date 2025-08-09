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

// 测试各个数据源对 July 22 的响应
async function testSources() {
  const dateStr = '2025-07-22';
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  const targetDate = new Date(dateStr);
  
  console.log(`Testing scraping for ${dateStr}, Puzzle #${puzzleNumber}`);
  console.log('=' .repeat(60));
  
  // User-Agent
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/'
  };

  // 1. NYT Review URL
  const reviewDate = new Date(targetDate);
  reviewDate.setDate(reviewDate.getDate() - 1);
  const nytReviewUrl = `https://www.nytimes.com/${reviewDate.getFullYear()}/${String(reviewDate.getMonth() + 1).padStart(2, '0')}/${String(reviewDate.getDate()).padStart(2, '0')}/crosswords/wordle-review-${puzzleNumber}.html`;
  
  console.log(`\n1. Testing NYT Review: ${nytReviewUrl}`);
  try {
    const response = await axios.get(nytReviewUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    const bodyText = $.text();
    
    // 查找特定的 JSON 数据
    let jsonMatch = bodyText.match(/ExperimentalBlock_Reveal.*?Today's word is ([A-Z]{5})/i);
    if (jsonMatch && jsonMatch[1]) {
      console.log(`✅ NYT Review found answer: ${jsonMatch[1].toUpperCase()}`);
    } else {
      // 常规模式匹配
      const patterns = [
        /Today'?s word is ([A-Z]{5})/i,
        /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
        /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
        /["'"]([A-Z]{5})["'"]/i,
        /word is ([A-Z]{5})/i,
        /answer.*?([A-Z]{5})/i
      ];
      
      let found = false;
      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match && match[1]) {
          console.log(`✅ NYT Review found answer with pattern: ${match[1].toUpperCase()}`);
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(`❌ NYT Review: No answer found`);
      }
    }
  } catch (error) {
    console.log(`❌ NYT Review failed: ${error.message}`);
  }

  // 2. AppGamer URL
  const month = targetDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const appGamerUrl = `https://www.appgamer.com/wordle-${puzzleNumber}-hints-answer-${month}-${day}-${year}`;
  
  console.log(`\n2. Testing AppGamer: ${appGamerUrl}`);
  try {
    const response = await axios.get(appGamerUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // AppGamer通常在特定元素中包含答案
    const answerElements = $('h2:contains("Answer"), .answer, strong');
    let found = false;
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        console.log(`✅ AppGamer found answer in element: ${match[1].toUpperCase()}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      // 尝试从页面内容中提取
      const bodyText = $.text();
      const patterns = [
        /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
        /today['']?s\s+wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
        /wordle\s+\d+\s+answer\s+is\s+["']?([A-Z]{5})["']?/i
      ];
      
      for (const pattern of patterns) {
        const match = bodyText.match(pattern);
        if (match && match[1]) {
          console.log(`✅ AppGamer found answer in text: ${match[1].toUpperCase()}`);
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      console.log(`❌ AppGamer: No answer found`);
    }
  } catch (error) {
    console.log(`❌ AppGamer failed: ${error.message}`);
  }

  // 3. TheGamer URL
  const theGamerUrl = `https://www.thegamer.com/wordle-nyt-answer-hints-solution-${month}-${day}-${year}/`;
  
  console.log(`\n3. Testing TheGamer: ${theGamerUrl}`);
  try {
    const response = await axios.get(theGamerUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // TheGamer通常在标题或特定元素中包含答案
    const title = $('title').text();
    const titleMatch = title.match(/([A-Z]{5})/i);
    if (titleMatch && titleMatch[1]) {
      console.log(`✅ TheGamer found answer in title: ${titleMatch[1].toUpperCase()}`);
    } else {
      // 尝试从特定元素中提取
      const answerElements = $('h2:contains("Answer"), h3:contains("Answer"), strong, b');
      let found = false;
      for (const element of answerElements.toArray()) {
        const text = $(element).text().trim();
        const match = text.match(/([A-Z]{5})/i);
        if (match && match[1] && match[1].length === 5) {
          console.log(`✅ TheGamer found answer in element: ${match[1].toUpperCase()}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`❌ TheGamer: No answer found`);
      }
    }
  } catch (error) {
    console.log(`❌ TheGamer failed: ${error.message}`);
  }

  // 4. Beebom URL
  const beebomUrl = `https://beebom.com/todays-wordle-hints-answer-${month}-${day}-${year}/`;
  
  console.log(`\n4. Testing Beebom: ${beebomUrl}`);
  try {
    const response = await axios.get(beebomUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // Beebom通常在特定元素中包含答案
    const answerElements = $('h2:contains("Answer"), h3:contains("Answer"), .answer, .wordle-answer');
    let found = false;
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        console.log(`✅ Beebom found answer in element: ${match[1].toUpperCase()}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log(`❌ Beebom: No answer found`);
    }
  } catch (error) {
    console.log(`❌ Beebom failed: ${error.message}`);
  }

  // 5. TryHardGuides URL
  const tryHardGuidesUrl = `https://tryhardguides.com/wordle-${puzzleNumber}-answer/`;
  
  console.log(`\n5. Testing TryHardGuides: ${tryHardGuidesUrl}`);
  try {
    const response = await axios.get(tryHardGuidesUrl, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // 首先检查标题
    const title = $('title').text();
    const titleMatch = title.match(/([A-Z]{5})/i);
    if (titleMatch && titleMatch[1] && titleMatch[1].length === 5) {
      console.log(`✅ TryHardGuides found answer in title: ${titleMatch[1].toUpperCase()}`);
    } else {
      let found = false;
      // 检查特定元素
      const answerElements = $('.answer, h2:contains("Answer"), .wordle-answer, strong');
      for (const element of answerElements.toArray()) {
        const text = $(element).text().trim();
        const match = text.match(/([A-Z]{5})/i);
        if (match && match[1] && match[1].length === 5) {
          console.log(`✅ TryHardGuides found answer in element: ${match[1].toUpperCase()}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`❌ TryHardGuides: No answer found`);
      }
    }
  } catch (error) {
    console.log(`❌ TryHardGuides failed: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('Testing completed!');
}

testSources().catch(console.error);