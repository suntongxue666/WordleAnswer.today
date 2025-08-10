import { NextResponse } from 'next/server';
import { WordleAnswer } from '@/lib/wordle-data';
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';
import axios from 'axios';
import { revalidateTag } from 'next/cache'; // 导入 revalidateTag

// 计算puzzle number
function calculatePuzzleNumber(dateStr: string): number {
  const targetDate = new Date(dateStr);
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

// NYT API抓取函数
async function nytApiScrape(dateStr: string): Promise<{ answer: string; source: string } | null> {
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
    console.log(`NYT API抓取失败 ${dateStr}:`, error);
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
    console.log(`Starting NYT API scrape for ${targetDateParam}`);
    
    // 使用NYT API抓取
    const result = await nytApiScrape(targetDateParam);
    
    if (!result) {
      return NextResponse.json({
        error: `Failed to retrieve Wordle answer for ${targetDateParam} from NYT API`,
        date: targetDateParam,
        puzzle_number: calculatePuzzleNumber(targetDateParam)
      }, { status: 500 });
    }

    console.log(`Found answer: ${result.answer} from ${result.source}`);
    
    const wordleData: Partial<WordleAnswer> = {
      date: targetDateParam,
      puzzle_number: calculatePuzzleNumber(targetDateParam),
      answer: result.answer,
      hints: generateHints(result.answer),
      difficulty: generateDifficulty(result.answer),
      definition: ''
    };

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
      
      // 添加重新验证缓存的逻辑
      revalidateTag('todays-wordle'); // 重新验证 getTodaysWordle 的缓存
      revalidateTag('recent-wordles'); // 重新验证 getRecentWordles 的缓存 (用于首页)
      revalidateTag('all-recent-wordles'); // 重新验证 getRecentWordles (如果你有其他地方用到了这个标签)

      // 尝试通知 Google 索引新内容
      try {
        const { notifyNewWordleAnswer } = await import('@/lib/google-indexing');
        if (wordleData.date) {
          await notifyNewWordleAnswer(wordleData.date);
          console.log(`已通知 Google 索引 ${wordleData.date} 的新答案`);
        }
      } catch (indexError) {
        console.warn('Google 索引通知失败:', indexError);
      }
    }

    return NextResponse.json({
      ...wordleData,
      saved: true,
      message: 'Data scraped from NYT API and saved successfully'
    });

  } catch (error) {
    console.error('NYT API scraping error:', error);
    return NextResponse.json({
      error: `NYT API scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}