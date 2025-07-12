const { PlaywrightCrawler } = require('crawlee');

async function testJuly12() {
  console.log('🕐 测试July 12数据...');
  const url = 'https://www.wordlehint.top/todays-wordle-answer-Sat-Jul-12-2025';
  console.log('URL:', url);
  
  let result = { answer: '', hints: [], error: null };
  
  const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request }) => {
      try {
        await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' });
        
        const htmlContent = await page.content();
        console.log('页面内容长度:', htmlContent.length);
        
        // 检查是否有错误信息
        if (htmlContent.includes('404') || htmlContent.includes('not found') || htmlContent.length < 1000) {
          result.error = 'Page appears to be missing or incomplete';
          return;
        }
        
        const scriptContents = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script'));
          return scripts.map(script => script.textContent);
        });
        
        console.log('脚本标签数量:', scriptContents.length);
        
        for (const scriptText of scriptContents) {
          if (scriptText) {
            // 查找TodayHints
            let match = scriptText.match(/const TodayHints = ({.*?});/s);
            if (match && match[1]) {
              try {
                const hintsObj = JSON.parse(match[1]);
                if (hintsObj.answer) result.answer = hintsObj.answer;
                if (hintsObj.hints) result.hints = hintsObj.hints;
                console.log('✅ 找到TodayHints!');
                break;
              } catch (e) {
                console.error('解析TodayHints错误:', e.message);
              }
            }
            
            // 查找YesterdayHints
            if (!result.answer) {
              match = scriptText.match(/const YesterdayHints = ({.*?});/s);
              if (match && match[1]) {
                try {
                  const hintsObj = JSON.parse(match[1]);
                  if (hintsObj.answer) result.answer = hintsObj.answer;
                  if (hintsObj.hints) result.hints = hintsObj.hints;
                  console.log('✅ 找到YesterdayHints!');
                  break;
                } catch (e) {
                  console.error('解析YesterdayHints错误:', e.message);
                }
              }
            }
          }
        }
      } catch (error) {
        result.error = error.message;
        console.error('爬取错误:', error.message);
      }
    },
    maxRequestsPerCrawl: 1,
  });
  
  await crawler.run([{ url }]);
  return result;
}

async function main() {
  const result = await testJuly12();
  console.log('\n📊 July 12测试结果:');
  console.log('答案:', result.answer || '未找到');
  console.log('提示数量:', result.hints.length);
  console.log('错误:', result.error || '无');
  
  if (result.answer) {
    console.log('\n✅ July 12数据可用，需要插入数据库');
    console.log('答案:', result.answer);
    console.log('提示预览:', result.hints.slice(0, 3));
  } else {
    console.log('\n❌ July 12数据不可用，可能页面还未发布');
  }
}

main().catch(console.error);