import { NextResponse } from 'next/server';
import { WordleAnswer } from '@/lib/wordle-data';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';
import { getEmergencyWordleData } from '@/lib/emergency-fallback';
import { getAdvancedFallbackAnswer } from '@/lib/advanced-fallback';
import axios from 'axios';
import * as cheerio from 'cheerio';

// 计算puzzle number
function calculatePuzzleNumber(dateStr: string): number {
  const targetDate = new Date(dateStr);
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

// 新的API抓取函数 - 作为首选方法
async function apiScrape(dateStr: string): Promise<{ answer: string; source: string } | null> {
  try {
    const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.status === 200 && response.data.solution) {
      return {
        answer: response.data.solution.toUpperCase(),
        source: 'nyt_api'
      };
    }
  } catch (error) {
    console.log(`API抓取失败 ${dateStr}:`, error);
  }
  return null;
}

// 高效抓取函数 - 并行请求多个源（作为备用）
async function efficientScrape(dateStr: string): Promise<{ answer: string; source: string } | null> {
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  const targetDate = new Date(dateStr);

  // 构建所有可能的URL
  // 1. NYT Review URL (前一天发布的) - 保持最高优先级，官方来源
  const reviewDate = new Date(targetDate);
  reviewDate.setDate(reviewDate.getDate() - 1);
  const nytReviewUrl = `https://www.nytimes.com/${reviewDate.getFullYear()}/${String(reviewDate.getMonth() + 1).padStart(2, '0')}/${String(reviewDate.getDate()).padStart(2, '0')}/crosswords/wordle-review-${puzzleNumber}.html`;

  // 2. AppGamer URL - 新增高优先级来源
  const month = targetDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const day = targetDate.getDate();
  const year = targetDate.getFullYear();
  const appGamerUrl = `https://www.appgamer.com/wordle-${puzzleNumber}-hints-answer-${month}-${day}-${year}`;

  // 3. TheGamer URL (原2) - 降低一个位置
  const theGamerUrl = `https://www.thegamer.com/wordle-nyt-answer-hints-solution-${month}-${day}-${year}/`;

  // 3. Beebom URL (原7) - 提升优先级
  const beebomUrl = `https://beebom.com/todays-wordle-hints-answer-${month}-${day}-${year}/`;

  // 4. TryHardGuides URL (原8) - 提升优先级
  const tryHardGuidesUrl = `https://tryhardguides.com/wordle-${puzzleNumber}-answer/`;

  // 5. WordleGame URL (原5) - 保持原位置
  const wordleGameUrl = `https://wordlegame.org/wordle-answer-${targetDate.toISOString().split('T')[0]}`;

  // 6. WordleHint URL (原2) - 降低优先级，因为更新较晚
  const fallbackDate = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '-').replace(/,/g, '-');
  const wordleHintUrl = `https://www.wordlehint.top/todays-wordle-answer-${fallbackDate}`;

  // 随机化 User-Agent 以避免被检测为爬虫
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  const headers = {
    'User-Agent': randomUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/'
  };

  // 并行请求所有源 - 按照优先级排序
  const requests = [
    // 1. NYT Review - 官方来源，最高优先级
    axios.get(nytReviewUrl, { headers: {...headers}, timeout: 10000 }).catch(() => null),
    // 2. AppGamer - 新增高优先级来源
    axios.get(appGamerUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null),
    // 3. TheGamer - 降低一个位置
    axios.get(theGamerUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null),
    // 4. Beebom - 提升优先级
    axios.get(beebomUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null),
    // 5. TryHardGuides - 提升优先级
    axios.get(tryHardGuidesUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null),
    // 6. WordleGame - 保持原位置
    axios.get(wordleGameUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null),
    // 7. WordleHint - 降低优先级
    axios.get(wordleHintUrl, { headers: {...headers, 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]}, timeout: 10000 }).catch(() => null)
  ];

  const responses = await Promise.allSettled(requests);

  // 处理NYT review响应
  if (responses[0].status === 'fulfilled' && responses[0].value) {
    const $ = cheerio.load(responses[0].value.data);
    const bodyText = $.text();

    // 查找特定的 JSON 数据
    const jsonMatch = bodyText.match(/ExperimentalBlock_Reveal.*?Today's word is ([A-Z]{5})/i);
    if (jsonMatch && jsonMatch[1]) {
      return { answer: jsonMatch[1].toUpperCase(), source: 'nyt_review_json' };
    }

    // 常规模式匹配
    const patterns = [
      /Today'?s word is ([A-Z]{5})/i,
      /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
      /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
      /["'"]([A-Z]{5})["'"]/i,
      /word is ([A-Z]{5})/i,
      /answer.*?([A-Z]{5})/i
    ];

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'nyt_review' };
      }
    }
  }

  // 处理AppGamer响应
  if (responses[1].status === 'fulfilled' && responses[1].value) {
    const $ = cheerio.load(responses[1].value.data);

    // AppGamer通常在特定元素中包含答案
    const answerElements = $('h2:contains("Answer"), .answer strong');
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        return { answer: match[1].toUpperCase(), source: 'appgamer_element' };
      }
    }

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
        return { answer: match[1].toUpperCase(), source: 'appgamer_text' };
      }
    }
  }

  // 处理wordlehint响应 (现在是第7位)
  if (responses[6].status === 'fulfilled' && responses[6].value) {
    const $ = cheerio.load(responses[6].value.data);
    const scripts = $('script').toArray();

    for (const script of scripts) {
      const scriptContent = $(script).html();
      if (scriptContent) {
        const match = scriptContent.match(/const (?:Today|Yesterday)Hints = ({.*?});/s);
        if (match && match[1]) {
          try {
            const hintsObj = JSON.parse(match[1]);
            if (hintsObj.answer) {
              return { answer: hintsObj.answer.toUpperCase(), source: 'wordlehint' };
            }
          } catch (e) {
            // 继续尝试其他方法
          }
        }
      }
    }

    // 尝试从页面内容中提取
    const bodyText = $.text();
    const answerMatch = bodyText.match(/answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i);
    if (answerMatch && answerMatch[1]) {
      return { answer: answerMatch[1].toUpperCase(), source: 'wordlehint_text' };
    }
  }

  // 处理TheGamer响应 (现在是第3位)
  if (responses[2].status === 'fulfilled' && responses[2].value) {
    const $ = cheerio.load(responses[2].value.data);

    // TheGamer通常在标题或特定元素中包含答案
    const title = $('title').text();
    const titleMatch = title.match(/([A-Z]{5})/i);
    if (titleMatch && titleMatch[1]) {
      return { answer: titleMatch[1].toUpperCase(), source: 'thegamer_title' };
    }

    // 尝试从特定元素中提取
    const answerElements = $('h2:contains("Answer"), h3:contains("Answer"), strong, b');
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        return { answer: match[1].toUpperCase(), source: 'thegamer_element' };
      }
    }

    // 尝试从页面内容中提取
    const bodyText = $.text();
    const patterns = [
      /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
      /today['']?s\s+wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
      /wordle\s+answer\s+for.*?is\s+["']?([A-Z]{5})["']?/i
    ];

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'thegamer_text' };
      }
    }
  }

  // 处理Beebom响应 (现在是第4位)
  if (responses[3].status === 'fulfilled' && responses[3].value) {
    const $ = cheerio.load(responses[3].value.data);

    // Beebom通常在特定元素中包含答案
    const answerElements = $('h2:contains("Answer"), h3:contains("Answer"), .answer, .wordle-answer');
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        return { answer: match[1].toUpperCase(), source: 'beebom_element' };
      }
    }

    // 尝试从页面内容中提取
    const bodyText = $.text();
    const patterns = [
      /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
      /today['']?s\s+wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
      /wordle\s+answer\s+for.*?is\s+["']?([A-Z]{5})["']?/i,
      /solution\s+is\s+["']?([A-Z]{5})["']?/i
    ];

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'beebom_text' };
      }
    }
  }

  // 处理TryHardGuides响应 (现在是第5位)
  if (responses[4].status === 'fulfilled' && responses[4].value) {
    const $ = cheerio.load(responses[4].value.data);

    // TryHardGuides通常在特定元素中包含答案
    // 首先检查标题
    const title = $('title').text();
    const titleMatch = title.match(/([A-Z]{5})/i);
    if (titleMatch && titleMatch[1] && titleMatch[1].length === 5) {
      return { answer: titleMatch[1].toUpperCase(), source: 'tryhardguides_title' };
    }

    // 检查特定元素
    const answerElements = $('.answer, h2:contains("Answer"), .wordle-answer, strong');
    for (const element of answerElements.toArray()) {
      const text = $(element).text().trim();
      const match = text.match(/([A-Z]{5})/i);
      if (match && match[1] && match[1].length === 5) {
        return { answer: match[1].toUpperCase(), source: 'tryhardguides_element' };
      }
    }

    // TryHardGuides通常会在页面中明确显示答案
    const paragraphs = $('p').toArray();
    for (const p of paragraphs) {
      const text = $(p).text().trim();
      if (text.includes('answer') || text.includes('solution')) {
        const match = text.match(/([A-Z]{5})/i);
        if (match && match[1] && match[1].length === 5) {
          return { answer: match[1].toUpperCase(), source: 'tryhardguides_paragraph' };
        }
      }
    }

    // 尝试从页面内容中提取
    const bodyText = $.text();
    const patterns = [
      /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
      /today['']?s\s+wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
      /wordle\s+\d+\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
      /solution(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i
    ];

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'tryhardguides_text' };
      }
    }
  }

  // 处理WordleGame响应 (现在是第6位)
  if (responses[5].status === 'fulfilled' && responses[5].value) {
    const $ = cheerio.load(responses[5].value.data);

    // 尝试从特定元素中提取
    const answerElement = $('.wordle-answer, .answer-box, .solution');
    if (answerElement.length > 0) {
      const answerText = answerElement.text().trim();
      const answerMatch = answerText.match(/([A-Z]{5})/i);
      if (answerMatch && answerMatch[1]) {
        return { answer: answerMatch[1].toUpperCase(), source: 'wordlegame_element' };
      }
    }

    // 尝试从页面内容中提取
    const bodyText = $.text();
    const patterns = [
      /answer(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i,
      /wordle\s+answer\s+is\s+["']?([A-Z]{5})["']?/i,
      /solution(?:\s+is|:)?\s+["']?([A-Z]{5})["']?/i
    ];

    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'wordlegame_text' };
      }
    }
  }

  // 所有数据源处理完毕

  // 如果所有源都失败，返回null
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let targetDateParam = searchParams.get('date');

  // 处理TODAY参数
  if (targetDateParam === 'TODAY' || !targetDateParam) {
    const today = new Date();
    targetDateParam = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
  }

  try {
    console.log(`Starting scrape for ${targetDateParam}`);

    // 首先尝试新的API抓取方法（首选）
    let result = await apiScrape(targetDateParam);

    // 如果API抓取失败，使用原有的网页抓取方法（备用）
    if (!result) {
      console.log('API抓取失败，尝试使用网页抓取方法...');
      result = await efficientScrape(targetDateParam);
    }

    let wordleData: Partial<WordleAnswer>;

    if (result) {
      console.log(`Found answer: ${result.answer} from ${result.source}`);
      wordleData = {
        date: targetDateParam,
        puzzle_number: calculatePuzzleNumber(targetDateParam),
        answer: result.answer,
        hints: generateHints(result.answer),
        difficulty: generateDifficulty(result.answer),
        definition: ''
      };
    } else {
      // 尝试使用高级应急方案
      console.log('Primary sources failed, trying advanced fallback methods...');
      const advancedAnswer = await getAdvancedFallbackAnswer(targetDateParam);

      if (advancedAnswer) {
        console.log(`Found answer from advanced fallback: ${advancedAnswer}`);
        wordleData = {
          date: targetDateParam,
          puzzle_number: calculatePuzzleNumber(targetDateParam),
          answer: advancedAnswer,
          hints: generateHints(advancedAnswer),
          difficulty: generateDifficulty(advancedAnswer),
          definition: ''
        };
      } else {
        // 如果高级应急方案也失败，记录错误并返回错误响应
        console.error(`All scraping methods failed for ${targetDateParam}. Cannot generate reliable answer.`);
        return NextResponse.json({
          error: `Failed to retrieve Wordle answer for ${targetDateParam}. Please try again later or contact administrator.`,
          date: targetDateParam,
          puzzle_number: calculatePuzzleNumber(targetDateParam)
        }, { status: 500 });
      }
    }

    // 保存到数据库
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      const { error } = await supabaseClient
        .from('wordle-answers')
        .upsert({
          date: wordleData.date,
          puzzle_number: wordleData.puzzle_number,
          answer: wordleData.answer,
          hints: wordleData.hints,
          difficulty: wordleData.difficulty,
          definition: wordleData.definition
        }, { onConflict: 'date' });

      if (error) {
        console.error('Database save error:', error);
        return NextResponse.json({
          error: 'Failed to save to database',
          scrapedData: wordleData
        }, { status: 500 });
      }

      // 尝试通知 Google 索引新内容
      try {
        // 动态导入，避免在服务器启动时加载
        const { notifyNewWordleAnswer } = await import('@/lib/google-indexing');
        if (wordleData.date) {
          await notifyNewWordleAnswer(wordleData.date);
          console.log(`已通知 Google 索引 ${wordleData.date} 的新答案`);
        }
      } catch (indexError) {
        // 不阻止主流程，只记录错误
        console.warn('Google 索引通知失败:', indexError);
      }
    }

    return NextResponse.json({
      ...wordleData,
      saved: true,
      message: 'Data scraped and saved successfully'
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({
      error: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}