import { NextResponse } from 'next/server';

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

// 也支持GET请求用于手动测试
export async function GET() {
  return NextResponse.json({ 
    message: 'Cron endpoint is active. Use POST with authorization header to trigger scraping.',
    schedule: ['3 4 * * *', '30 4 * * *', '0 5 * * *', '0 7 * * *'],
    timezone: 'UTC (corresponds to NYC: 00:03, 00:30, 01:00, 03:00 EDT)'
  });
}