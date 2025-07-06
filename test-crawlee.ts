import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import * as cheerio from 'cheerio';
import { supabase } from './src/lib/supabase'; // 引入 Supabase 客户端

// Helper function to format date (simplified for this test)
const formatUrlDateForWordleHintTop = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options); 
  return formatted.replace(/, /g, '-').replace(/ /g, '-').replace(/\.$/, ''); 
};

type WordleData = {
    date: string;
    puzzle_number: number | null;
    answer: string;
    hints: { type: string; value: string }[];
    difficulty?: string | null;
    definition?: string | null;
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

  let wordleData: WordleData | null = null;

  const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    // launchContext: { headless: false }, // uncomment to see the browser for debugging
    requestHandler: async ({ page, request }) => {
      await page.setExtraHTTPHeaders({ 'User-Agent': 'curl/8.7.1' }); // 保持这个 User-Agent

      console.log(`Visited: ${request.url}`);
      
      const htmlContent = await page.content();
      const $ = cheerio.load(htmlContent);
      console.log("Fetched HTML snippet (first 2000 chars from Playwright):", htmlContent.slice(0, 2000)); 

      let extractedDate: string | undefined;
      let extractedPuzzleNumber: number | undefined;
      let extractedAnswer: string | undefined;
      let extractedHints: { type: string; value: string }[] = [];
      let extractedDifficulty: string | undefined;
      let extractedDefinition: string | undefined;

      // 获取今天的日期（YYYY-MM-DD 格式），作为默认值
      extractedDate = new Date().toISOString().split('T')[0];

      // 尝试从 TodayHints 变量中提取数据
      const todayHintsScript = $('script:contains("const TodayHints")').html();
      if (todayHintsScript) {
          const todayHintsMatch = todayHintsScript.match(/const TodayHints\s*=\s*({[^;]+});/);
          if (todayHintsMatch && todayHintsMatch[1]) {
              try {
                  const hintsJson = JSON.parse(todayHintsMatch[1]);
                  extractedPuzzleNumber = hintsJson.puzzleNumber;
                  extractedAnswer = hintsJson.answer;
                  extractedDifficulty = hintsJson.difficulty;
                  extractedDefinition = hintsJson.definition;

                  if (hintsJson && Array.isArray(hintsJson.hints)) {
                      extractedHints = hintsJson.hints.map((hintText: string, index: number) => ({
                          type: `hint${index + 1}`,
                          value: hintText,
                      }));
                  } else {
                      extractedHints = [];
                  }
              } catch (e) {
                  console.error('Failed to parse TodayHints JSON:', e);
              }
          }
      }

      // 如果 TodayHints 没有，尝试从 YesterdayHints 变量中提取数据 (并调整日期)
      if (!extractedAnswer) {
          const yesterdayHintsScript = $('script:contains("const YesterdayHints")').html();
          if (yesterdayHintsScript) {
              const yesterdayHintsMatch = yesterdayHintsScript.match(/const YesterdayHints\s*=\s*({[^;]+});/);
              if (yesterdayHintsMatch && yesterdayHintsMatch[1]) {
                  try {
                      const hintsJson = JSON.parse(yesterdayHintsMatch[1]);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      extractedDate = yesterday.toISOString().split('T')[0]; // 获取昨天的日期
                      extractedPuzzleNumber = hintsJson.puzzleNumber;
                      extractedAnswer = hintsJson.answer;
                      extractedDifficulty = hintsJson.difficulty;
                      extractedDefinition = hintsJson.definition;

                      if (hintsJson && Array.isArray(hintsJson.hints)) {
                          extractedHints = hintsJson.hints.map((hintText: string, index: number) => ({
                              type: `hint${index + 1}`,
                              value: hintText,
                          }));
                      } else {
                          extractedHints = [];
                      }
                  } catch (e) {
                      console.error('Failed to parse YesterdayHints JSON:', e);
                  }
              }
          }
      }

      if (extractedDate && extractedAnswer) {
          wordleData = {
              date: extractedDate,
              puzzle_number: extractedPuzzleNumber !== undefined ? extractedPuzzleNumber : null,
              answer: extractedAnswer,
              hints: extractedHints,
              difficulty: extractedDifficulty !== undefined ? extractedDifficulty : null,
              definition: extractedDefinition !== undefined ? extractedDefinition : null,
          };
          console.log('Extracted Wordle Data:', wordleData);

          // --- 添加 Supabase 插入逻辑 ---
          const { data, error } = await supabase
              .from('wordle-answers')
              .upsert(wordleData, { onConflict: 'date,puzzle_number' })
              .select();

          if (error) {
              console.error('Error inserting/updating Wordle data to Supabase:', error);
              console.error('Supabase Error Details:', JSON.stringify(error, null, 2));
          } else {
              console.log('Wordle data successfully saved to Supabase:', data);
          }
          // --- 结束 Supabase 插入逻辑 ---

      } else {
          console.warn('Could not extract sufficient Wordle data to save (missing date or answer) for:', request.url);
      }
    },
    maxRequestsPerCrawl: 1,
  });

  await crawler.run(['https://www.wordlehint.top/']);

  // 这些 console.log 语句会使用 runScraper 作用域中的 wordleData
  console.log("Extracted Puzzle Number (Final):", wordleData?.puzzle_number);
  console.log("Extracted Answer (Final):", wordleData?.answer);
  console.log("Extracted Hints (Final):", wordleData?.hints);

  console.log('Crawlee test finished.');
}

runScraper().catch(console.error); 