import { PlaywrightCrawler } from 'crawlee';
import { supabase } from './src/lib/supabase';
import { format, parse } from 'date-fns';

// 只更新7月8日的数据
const testUrl = 'https://www.wordlehint.top/todays-wordle-answer-Tue-Jul-08-2025';

interface WordleData {
    puzzle_number: number | null;
    date: string;
    answer: string | null;
    hints: { type: string; value: string }[] | null;
    difficulty: string | null;
    definition: string | null;
}

const updateTodaysData = async () => {
    console.log('🔄 Updating today\'s data...');
    
    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 1,
        maxConcurrency: 1,
        requestHandlerTimeoutSecs: 30,
        navigationTimeoutSecs: 30,

        async requestHandler({ request, page, log }) {
            log.info(`Processing URL: ${request.url}`);

            // 从URL提取日期
            const urlParts = request.url.split('-');
            const datePart = urlParts.slice(-3).join('-'); // 得到 "Jul-08-2025"
            const parsedDate = parse(datePart, 'MMM-dd-yyyy', new Date());
            const extractedDateFromUrl = format(parsedDate, 'yyyy-MM-dd');
            
            log.info(`Extracted Date from URL: ${extractedDateFromUrl}`);

            // 等待页面加载
            await page.waitForLoadState('networkidle');

            const jsonContent = await page.evaluate(() => {
                const scriptTags = Array.from(document.querySelectorAll('script'));
                
                for (const script of scriptTags) {
                    if (script.textContent) {
                        // 首先尝试 TodayHints
                        if (script.textContent.includes('const TodayHints')) {
                            try {
                                const match = script.textContent.match(/const TodayHints\s*=\s*(\{[\s\S]*?\});/);
                                if (match && match[1]) {
                                    try {
                                        return JSON.parse(match[1]);
                                    } catch (parseError) {
                                        try {
                                            const cleanedStr = match[1]
                                                .replace(/"([^"]*)"/g, '"$1"')
                                                .replace(/'([^']*)'/g, '"$1"')
                                                .replace(/(\w+):/g, '"$1":');
                                            return JSON.parse(cleanedStr);
                                        } catch (parseError2) {
                                            console.error('Failed to parse TodayHints JSON:', parseError2);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error(`Error parsing script content for TodayHints: ${e}`);
                            }
                        }
                        
                        // 如果没有找到TodayHints，尝试YesterdayHints
                        if (script.textContent.includes('const YesterdayHints')) {
                            try {
                                const match = script.textContent.match(/const YesterdayHints\s*=\s*(\{[\s\S]*?\});/);
                                if (match && match[1]) {
                                    try {
                                        return JSON.parse(match[1]);
                                    } catch (parseError) {
                                        try {
                                            const cleanedStr = match[1]
                                                .replace(/"([^"]*)"/g, '"$1"')
                                                .replace(/'([^']*)'/g, '"$1"')
                                                .replace(/(\w+):/g, '"$1":');
                                            return JSON.parse(cleanedStr);
                                        } catch (parseError2) {
                                            console.error('Failed to parse YesterdayHints JSON:', parseError2);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error(`Error parsing script content for YesterdayHints: ${e}`);
                            }
                        }
                    }
                }
                return null;
            });

            console.log('Extracted JSON:', JSON.stringify(jsonContent, null, 2));

            if (jsonContent && jsonContent.answer && jsonContent.hints && extractedDateFromUrl) {
                const hintsArray = jsonContent.hints?.map((hint: any) => {
                    // 如果hint是字符串，直接使用
                    if (typeof hint === 'string') {
                        return {
                            type: 'clue',
                            value: hint
                        };
                    }
                    // 如果hint是对象，检查是否有value属性
                    return {
                        type: hint.type || 'clue',
                        value: hint.value || hint
                    };
                });

                const wordleToUpsert: WordleData = {
                    puzzle_number: null,
                    date: extractedDateFromUrl,
                    answer: jsonContent.answer,
                    hints: hintsArray,
                    difficulty: jsonContent.difficulty || null,
                    definition: jsonContent.definition || null,
                };

                log.info(`Attempting to upsert data for date: ${wordleToUpsert.date}, Answer: ${wordleToUpsert.answer}`);
                console.log('Final hints array:', JSON.stringify(hintsArray, null, 2));
                
                const { data, error } = await supabase
                    .from('wordle-answers')
                    .upsert([wordleToUpsert], { onConflict: 'date,puzzle_number' });

                if (error) {
                    log.error(`Error upserting data for ${wordleToUpsert.date}:`, { message: error.message, details: error.details, hint: error.hint });
                } else {
                    log.info(`Successfully upserted data for ${wordleToUpsert.date}.`);
                }
            } else {
                log.warning(`Scraping Warning: Missing essential data for upsert for URL: ${request.url}.`);
            }
        },
    });

    await crawler.run([{ url: testUrl }]);
    console.log('✅ Update finished.');
};

// 设置环境变量并运行
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yubvrpzgvixulyylqfkp.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

updateTodaysData().catch(console.error);