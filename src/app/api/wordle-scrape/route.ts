import { NextResponse } from 'next/server';
import { WordleAnswer } from '@/lib/wordle-data';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';
import { getEmergencyWordleData } from '@/lib/emergency-fallback';
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

// 高效抓取函数 - 并行请求多个源
async function efficientScrape(dateStr: string): Promise<{ answer: string; source: string } | null> {
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  const targetDate = new Date(dateStr);
  
  // 构建所有可能的URL
  const reviewDate = new Date(targetDate);
  reviewDate.setDate(reviewDate.getDate() - 1);
  const nytReviewUrl = `https://www.nytimes.com/${reviewDate.getFullYear()}/${String(reviewDate.getMonth() + 1).padStart(2, '0')}/${String(reviewDate.getDate()).padStart(2, '0')}/crosswords/wordle-review-${puzzleNumber}.html`;
  
  const fallbackDate = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).replace(/, /g, '-').replace(/ /g, '-');
  const wordleHintUrl = `https://www.wordlehint.top/todays-wordle-answer-${fallbackDate}`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  // 并行请求所有源
  const requests = [
    axios.get(nytReviewUrl, { headers, timeout: 8000 }).catch(() => null),
    axios.get(wordleHintUrl, { headers, timeout: 8000 }).catch(() => null)
  ];

  const responses = await Promise.allSettled(requests);
  
  // 处理NYT review响应
  if (responses[0].status === 'fulfilled' && responses[0].value) {
    const $ = cheerio.load(responses[0].value.data);
    const bodyText = $.text();
    
    const patterns = [
      /Today'?s word is ([A-Z]{5})/i,
      /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
      /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
      /["'"]([A-Z]{5})["'"]/i
    ];
    
    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        return { answer: match[1].toUpperCase(), source: 'nyt_review' };
      }
    }
  }

  // 处理wordlehint响应
  if (responses[1].status === 'fulfilled' && responses[1].value) {
    const $ = cheerio.load(responses[1].value.data);
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
  }

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
    console.log(`Starting efficient scrape for ${targetDateParam}`);
    
    // 高效抓取
    const result = await efficientScrape(targetDateParam);
    
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
      // 应急备用
      console.log('Using emergency fallback');
      const emergencyData = getEmergencyWordleData(targetDateParam);
      wordleData = {
        date: targetDateParam,
        puzzle_number: emergencyData.puzzle_number,
        answer: emergencyData.answer,
        hints: generateHints(emergencyData.answer),
        difficulty: generateDifficulty(emergencyData.answer),
        definition: ''
      };
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
        await notifyNewWordleAnswer(wordleData.date);
        console.log(`已通知 Google 索引 ${wordleData.date} 的新答案`);
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