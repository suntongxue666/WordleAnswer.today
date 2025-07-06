import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';

// Helper function to format date (simplified for this test)
const formatUrlDateForWordleHintTop = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options); 
  return formatted.replace(/, /g, '-').replace(/ /g, '-').replace(/\.$/, ''); 
};

async function runScraper() {
  const targetDate = new Date('2025-07-04'); // 使用你之前测试的日期
  const formattedUrlDate = formatUrlDateForWordleHintTop(targetDate);
  const url = `https://www.wordlehint.top/todays-wordle-answer-${formattedUrlDate}`;

  const proxyUrl = 'http://127.0.0.1:7890'; // 你的 ClashX 代理地址
  const proxyConfiguration = new ProxyConfiguration({
      proxyUrls: [proxyUrl]
  });

  console.log(`Starting Crawlee test for URL: ${url}`);
  console.log(`Using proxy: ${proxyUrl}`);

  let wordleData: Partial<WordleAnswer> = {
      puzzleNumber: 0, // Will be updated
      date: targetDate.toISOString().split('T')[0], // Use ISO string for consistency
      answer: '',
      hints: [],
      difficulty: 'Medium', // Default or scrape if possible
      definition: '' // Default or scrape if possible
  };

  const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    // launchContext: { headless: false }, // uncomment to see the browser for debugging
    requestHandler: async ({ page, request }) => {
      await page.setExtraHTTPHeaders({ 'User-Agent': 'curl/8.7.1' }); // 保持这个 User-Agent

      console.log(`Visited: ${request.url}`);
      
      const htmlContent = await page.content();
      console.log("Fetched HTML snippet (first 2000 chars from Playwright):", htmlContent.slice(0, 2000)); 

      let extractedAnswer: string = '';
      let extractedHints: string[] = [];
      let parsedHintsVarName: string = ''; // 追踪是 TodayHints 还是 YesterdayHints

      const scriptContents = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script'));
          return scripts.map(script => script.textContent);
      });

      for (const scriptText of scriptContents) {
          if (scriptText) {
              // 优先尝试匹配 TodayHints
              let match = scriptText.match(/const TodayHints = ({.*?});/s);
              if (match && match[1]) {
                  try {
                      const hintsObj = JSON.parse(match[1]);
                      if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                      if (hintsObj.hints) extractedHints = hintsObj.hints;
                      parsedHintsVarName = 'TodayHints';
                      console.log("Successfully parsed TodayHints variable.");
                      break; // 找到并解析成功，跳出循环
                  } catch (e) {
                      console.error("Error parsing TodayHints JSON from script:", e);
                  }
              }

              // 如果 TodayHints 未找到或解析失败，尝试匹配 YesterdayHints
              if (!extractedAnswer && !extractedHints.length) { // 仅在 TodayHints 没有找到时尝试 YesterdayHints
                 match = scriptText.match(/const YesterdayHints = ({.*?});/s);
                 if (match && match[1]) {
                    try {
                        const hintsObj = JSON.parse(match[1]);
                        if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                        if (hintsObj.hints) extractedHints = hintsObj.hints;
                        parsedHintsVarName = 'YesterdayHints';
                        console.log("Successfully parsed YesterdayHints variable.");
                        break; // 找到并解析成功，跳出循环
                    } catch (e) {
                        console.error("Error parsing YesterdayHints JSON from script:", e);
                    }
                 }
              }
          }
      }

      if (!parsedHintsVarName) {
          console.warn("Could not find 'const TodayHints =' or 'const YesterdayHints =' variable in any script.");
      } else {
          console.log(`Data found in variable: ${parsedHintsVarName}`);
      }

      wordleData.answer = extractedAnswer ? extractedAnswer.toUpperCase() : '';
      wordleData.hints = extractedHints;

      const pageTitle = await page.title();
      const titlePuzzleMatch = pageTitle.match(/#(\d+)/) || pageTitle.match(/Wordle Hint For.*#(\d+)/); 
      wordleData.puzzleNumber = titlePuzzleMatch && titlePuzzleMatch[1] ? parseInt(titlePuzzleMatch[1], 10) : (wordleData.puzzleNumber || 0);
    },
    maxRequestsPerCrawl: 1,
  });

  await crawler.run([{ url }]);

  // 这些 console.log 语句会使用 runScraper 作用域中的 wordleData
  console.log("Extracted Puzzle Number (Final):", wordleData.puzzleNumber);
  console.log("Extracted Answer (Final):", wordleData.answer);
  console.log("Extracted Hints (Final):", wordleData.hints);

  console.log('Crawlee test finished.');
}

runScraper().catch(console.error); 