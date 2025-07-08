import { PlaywrightCrawler } from 'crawlee';
import { supabase } from './src/lib/supabase';
import { format, parse } from 'date-fns';

// 测试单个URL
const testUrl = 'https://www.wordlehint.top/todays-wordle-answer-Tue-Jul-08-2025';

const runSingleTest = async () => {
    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 1,
        maxConcurrency: 1,
        requestHandlerTimeoutSecs: 30,
        navigationTimeoutSecs: 30,

        async requestHandler({ request, page, log }) {
            log.info(`Processing URL: ${request.url}`);

            // 等待页面完全加载
            await page.waitForLoadState('networkidle');
            
            // 获取所有script标签的内容
            const scriptContents = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                return scripts.map((script, index) => ({
                    index,
                    content: script.textContent || '',
                    hasYesterdayHints: script.textContent?.includes('YesterdayHints') || false,
                    hasTodayHints: script.textContent?.includes('TodayHints') || false
                }));
            });

            console.log('Script tags analysis:');
            scriptContents.forEach(script => {
                console.log(`Script ${script.index}: length=${script.content.length}, hasYesterdayHints=${script.hasYesterdayHints}, hasTodayHints=${script.hasTodayHints}`);
                if (script.hasYesterdayHints || script.hasTodayHints) {
                    console.log('Content snippet:', script.content.substring(0, 500));
                }
            });

            // 尝试提取数据
            const jsonContent = await page.evaluate(() => {
                const scriptTags = Array.from(document.querySelectorAll('script'));
                
                for (const script of scriptTags) {
                    if (script.textContent) {
                        // 尝试YesterdayHints
                        if (script.textContent.includes('const YesterdayHints')) {
                            console.log('Found YesterdayHints variable');
                            try {
                                const match = script.textContent.match(/const YesterdayHints\s*=\s*(\{[\s\S]*?\});/);
                                if (match && match[1]) {
                                    console.log('YesterdayHints raw match:', match[1]);
                                    try {
                                        // 数据已经是标准JSON格式，直接解析
                                        const parsed = JSON.parse(match[1]);
                                        console.log('YesterdayHints parsed successfully:', parsed);
                                        return parsed;
                                    } catch (parseError) {
                                        console.error('Failed to parse JSON for YesterdayHints:', parseError);
                                        console.error('Original string:', match[1]);
                                        
                                        // 如果直接解析失败，尝试清理格式
                                        try {
                                            const cleanedStr = match[1]
                                                .replace(/"([^"]*)"/g, '"$1"')  // 保持双引号
                                                .replace(/'([^']*)'/g, '"$1"')  // 单引号改双引号
                                                .replace(/(\w+):/g, '"$1":');   // 键添加双引号
                                            console.log('YesterdayHints cleaned:', cleanedStr);
                                            const parsed2 = JSON.parse(cleanedStr);
                                            console.log('YesterdayHints parsed after cleaning:', parsed2);
                                            return parsed2;
                                        } catch (parseError2) {
                                            console.error('Failed to parse cleaned JSON for YesterdayHints:', parseError2);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error(`Error parsing script content for YesterdayHints: ${e}`);
                            }
                        }
                        
                        // 尝试TodayHints
                        if (script.textContent.includes('const TodayHints')) {
                            console.log('Found TodayHints variable');
                            try {
                                const match = script.textContent.match(/const TodayHints\s*=\s*(\{[\s\S]*?\});/);
                                if (match && match[1]) {
                                    console.log('TodayHints raw match:', match[1]);
                                    try {
                                        const cleanedStr = match[1]
                                            .replace(/"([^"]*)"/g, '"$1"')  // 保持双引号
                                            .replace(/'([^']*)'/g, '"$1"')  // 单引号改双引号
                                            .replace(/(\w+):/g, '"$1":');   // 键添加双引号
                                        console.log('TodayHints cleaned:', cleanedStr);
                                        const parsed = JSON.parse(cleanedStr);
                                        console.log('TodayHints parsed successfully:', parsed);
                                        return parsed;
                                    } catch (parseError) {
                                        console.error('Failed to parse JSON for TodayHints:', parseError);
                                        console.error('Original string:', match[1]);
                                    }
                                }
                            } catch (e) {
                                console.error(`Error parsing script content for TodayHints: ${e}`);
                            }
                        }
                    }
                }
                return null;
            });

            console.log('Final extracted data:', jsonContent);
        },
    });

    await crawler.run([{ url: testUrl }]);
};

runSingleTest().catch(console.error);