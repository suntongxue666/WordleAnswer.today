const { PlaywrightCrawler } = require('crawlee');

async function testScrape(targetDate) {
  console.log(`\n🕐 Testing scrape for ${targetDate}...`);
  
  // Format date for URL
  const dateObj = new Date(targetDate);
  const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = dateObj.toLocaleDateString('en-US', options);
  const formattedUrlDate = formatted.replace(/, /g, '-').replace(/ /g, '-').replace(/\.$/, '');
  
  const url = `https://www.wordlehint.top/todays-wordle-answer-${formattedUrlDate}`;
  console.log(`URL: ${url}`);
  
  let extractedAnswer = '';
  let extractedHints = [];
  
  const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request }) => {
      console.log(`Visiting: ${request.url}`);
      
      try {
        await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' });
        
        const htmlContent = await page.content();
        console.log(`Page loaded, content length: ${htmlContent.length}`);
        
        const scriptContents = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script'));
          return scripts.map(script => script.textContent);
        });
        
        console.log(`Found ${scriptContents.length} script tags`);
        
        for (const scriptText of scriptContents) {
          if (scriptText) {
            let match = scriptText.match(/const TodayHints = ({.*?});/s);
            if (match && match[1]) {
              try {
                const hintsObj = JSON.parse(match[1]);
                if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                if (hintsObj.hints) extractedHints = hintsObj.hints;
                console.log("✅ Found TodayHints!");
                break;
              } catch (e) {
                console.error("Error parsing TodayHints:", e);
              }
            }
            
            if (!extractedAnswer) {
              match = scriptText.match(/const YesterdayHints = ({.*?});/s);
              if (match && match[1]) {
                try {
                  const hintsObj = JSON.parse(match[1]);
                  if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                  if (hintsObj.hints) extractedHints = hintsObj.hints;
                  console.log("✅ Found YesterdayHints!");
                  break;
                } catch (e) {
                  console.error("Error parsing YesterdayHints:", e);
                }
              }
            }
          }
        }
        
        console.log(`Answer: ${extractedAnswer}`);
        console.log(`Hints: ${extractedHints.length} found`);
        
      } catch (error) {
        console.error('Scraping error:', error.message);
      }
    },
    maxRequestsPerCrawl: 1,
  });
  
  await crawler.run([{ url }]);
  
  return { answer: extractedAnswer, hints: extractedHints };
}

async function main() {
  console.log('🚀 Starting scrape test...');
  
  // Test July 11
  const result11 = await testScrape('2025-07-11');
  console.log(`\n📊 July 11 Result: Answer="${result11.answer}", Hints=${result11.hints.length}`);
  
  // Test July 12  
  const result12 = await testScrape('2025-07-12');
  console.log(`\n📊 July 12 Result: Answer="${result12.answer}", Hints=${result12.hints.length}`);
}

main().catch(console.error);