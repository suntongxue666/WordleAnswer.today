import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  // 验证是否来自 Vercel cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`Starting Wordle scraping for ${today}`);
    
    // 获取基础URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3001';
    
    // 调用爬虫 API
    const response = await fetch(`${baseUrl}/api/wordle-scrape?date=${today}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-Job'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Scraping successful:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wordle data scraped successfully',
      data: {
        date: data.date,
        answer: data.answer,
        puzzle_number: data.puzzle_number
      }
    });
    
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

// 修改cron表达式，每天只运行一次
export const GET = async () => {
  // 检查cron secret（安全验证）
  const authHeader = headers().get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 获取明天的日期
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`Cron job: 开始抓取 ${tomorrowStr} 的Wordle答案...`);
    
    // 调用NYT API抓取
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/nyt-api-scrape?date=${tomorrowStr}`);
    const result = await response.json();
    
    if (result.saved) {
      console.log(`✅ Cron job: ${tomorrowStr} 答案已成功保存`);
      return NextResponse.json({ 
        success: true, 
        message: `${tomorrowStr} 答案已更新`,
        date: tomorrowStr 
      });
    } else {
      console.error(`❌ Cron job: ${tomorrowStr} 答案保存失败:`, result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
};