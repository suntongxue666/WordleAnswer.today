import { PlaywrightCrawler, Dataset } from 'crawlee';
import { supabase } from './lib/supabase';
import { format, parse } from 'date-fns';

// Function to format date for the URL, e.g., 'Sun-Jul-06-2025'
function formatDateForUrl(date: Date): string {
    return format(date, 'EEE-MMM-dd-yyyy');
}

interface WordleData {
    puzzle_number: number | null;
    date: string;
    answer: string | null;
    hints: { type: string; value: string }[] | null;
    difficulty: string | null;
    definition: string | null;
}

const runScraper = async () => {
    const urlsToScrape: string[] = [];
    const today = new Date();
    // 循环获取最近 15 天的数据
    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = formatDateForUrl(date); // 格式为 EEE-MMM-dd-yyyy
        const url = `https://www.wordlehint.top/todays-wordle-answer-${formattedDate}`;
        urlsToScrape.push(url);
    }

    console.log(`Enqueuing ${urlsToScrape.length} URLs for scraping.`);

    const crawler = new PlaywrightCrawler({
        // *** 关键修复：显式设置各种限制参数 ***
        maxRequestsPerCrawl: urlsToScrape.length, // 确保处理所有请求
        maxConcurrency: 1, // 设置并发为1，避免被网站屏蔽
        requestHandlerTimeoutSecs: 30, // 增加超时时间
        navigationTimeoutSecs: 30, // 增加导航超时时间
        async requestHandler({ request, page, log }) {
            log.info(`Processing URL: ${request.url}`);

            let puzzleNumber: number | null = null;
            let extractedDateFromUrl: string | null = null;

            try {
                const h1Text = await page.locator('h1').textContent();
                if (h1Text) {
                    const match = h1Text.match(/Puzzle #(\d+)/);
                    if (match && match[1]) {
                        puzzleNumber = parseInt(match[1], 10);
                        log.info(`Extracted Puzzle Number from H1: ${puzzleNumber}`);
                    }
                }

                const urlParts = request.url.split('-');
                if (urlParts.length >= 3) {
                    const datePart = urlParts.slice(-3).join('-');
                    try {
                        const parsedDate = parse(datePart, 'MMM-dd-yyyy', new Date());
                        extractedDateFromUrl = format(parsedDate, 'yyyy-MM-dd');
                        log.info(`Extracted Date from URL: ${extractedDateFromUrl}`);
                    } catch (parseError) {
                        log.error(`Failed to parse date from URL part "${datePart}" for ${request.url}: ${parseError}`);
                    }
                }
            } catch (e) {
                log.error(`Error during initial page data extraction (H1/URL) for ${request.url}: ${e}`);
            }

            const jsonContent = await page.evaluate(() => {
                const scriptTags = Array.from(document.querySelectorAll('script'));
                for (const script of scriptTags) {
                    // 首先尝试 TodayHints
                    if (script.textContent?.includes('const TodayHints')) {
                        try {
                            const match = script.textContent.match(/const TodayHints\s*=\s*(\{[\s\S]*?\});/);
                            if (match && match[1]) {
                                try {
                                    const cleanedStr = match[1].replace(/'([^']*)'/g, '"$1"');
                                    const finalJsonStr = cleanedStr.replace(/(\w+):/g, '"$1":');
                                    return JSON.parse(finalJsonStr);
                                } catch (parseError) {
                                    console.error('Failed to parse JSON for TodayHints:', parseError, 'String:', match[1]);
                                }
                            }
                        } catch (e) {
                            console.error(`Error parsing script content for TodayHints: ${e}`);
                        }
                    }
                    
                    // 如果没有找到TodayHints，尝试YesterdayHints
                    if (script.textContent?.includes('const YesterdayHints')) {
                        try {
                            const match = script.textContent.match(/const YesterdayHints\s*=\s*(\{[\s\S]*?\});/);
                            if (match && match[1]) {
                                try {
                                    const cleanedStr = match[1].replace(/'([^']*)'/g, '"$1"');
                                    const finalJsonStr = cleanedStr.replace(/(\w+):/g, '"$1":');
                                    return JSON.parse(finalJsonStr);
                                } catch (parseError) {
                                    console.error('Failed to parse JSON for YesterdayHints:', parseError, 'String:', match[1]);
                                }
                            }
                        } catch (e) {
                            console.error(`Error parsing script content for YesterdayHints: ${e}`);
                        }
                    }
                }
                return null;
            });

            if (jsonContent && jsonContent.answer && jsonContent.hints && extractedDateFromUrl) {
                const hintsArray = jsonContent.hints?.map((hint: { type?: string; value?: string }) => ({
                    type: hint.type || 'clue',
                    value: hint.value,
                }));

                const wordleToUpsert: WordleData = {
                    puzzle_number: puzzleNumber,
                    date: extractedDateFromUrl,
                    answer: jsonContent.answer,
                    hints: hintsArray,
                    difficulty: jsonContent.difficulty || null,
                    definition: jsonContent.definition || null,
                };

                log.info(`Attempting to upsert data for date: ${wordleToUpsert.date}, puzzle: ${wordleToUpsert.puzzle_number}, Answer: ${wordleToUpsert.answer}`);
                const { data, error } = await supabase
                    .from('wordle-answers')
                    .upsert([wordleToUpsert], { onConflict: 'date,puzzle_number' });

                if (error) {
                    log.error(`Error upserting data for ${wordleToUpsert.date}:`, { message: error.message, details: error.details, hint: error.hint });
                } else {
                    log.info(`Successfully upserted data for ${wordleToUpsert.date}.`);
                }
            } else {
                log.warning(`Scraping Warning: Missing essential data for upsert for URL: ${request.url}.
                Extracted JSON: ${JSON.stringify(jsonContent)}.
                Extracted Puzzle Number: ${puzzleNumber}.
                Extracted Date from URL: ${extractedDateFromUrl}.
                Reason: ${!jsonContent ? 'No JSON content from TodayHints.' : ''} ${!jsonContent?.answer ? 'No answer in JSON.' : ''} ${!jsonContent?.hints ? 'No hints in JSON.' : ''} ${!extractedDateFromUrl ? 'No date extracted from URL.' : ''}`);
            }
        },
    });

    console.log(`[DEBUG] Crawler initialized with maxRequestsPerCrawl: ${urlsToScrape.length}`); // 再次确认这里会输出什么

    // *** 关键修复：直接将所有请求传递给 crawler.run() ***
    await crawler.run(urlsToScrape.map(url => ({ url })));

    console.log('Crawl finished.');
};

runScraper(); 