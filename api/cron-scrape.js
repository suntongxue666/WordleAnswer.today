// 从July 9开始，纽约时间 00:03, 00:30, 01:00, 03:00 抓取
// 纽约时间 = EST (UTC-5) 或 EDT (UTC-4)，7月使用EDT
// 对应 UTC 时间：04:03, 04:30, 05:00, 07:00

export const config = {
  schedule: [
    // 00:03 NYC (04:03 UTC)
    '3 4 * * *',
    // 00:30 NYC (04:30 UTC)  
    '30 4 * * *',
    // 01:00 NYC (05:00 UTC)
    '0 5 * * *',
    // 03:00 NYC (07:00 UTC)
    '0 7 * * *'
  ]
}

export default async function handler(req, res) {
  // 只允许 POST 请求和 cron 触发
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // 验证是否来自 Vercel cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`Starting Wordle scraping for ${today}`);
    
    // 调用爬虫 API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/wordle-scrape?date=${today}`, {
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
    
    return res.status(200).json({ 
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
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}