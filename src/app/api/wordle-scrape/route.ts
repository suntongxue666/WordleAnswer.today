import { NextResponse } from 'next/server';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { WordleAnswer } from '@/lib/wordle-data'; // Import the interface

// Helper function to format date for wordlehint.top URL (e.g., Fri-Jul-04-2025)
const formatUrlDateForWordleHintTop = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options); // "Fri, Jul 04, 2025"
  // Replace comma with hyphen, spaces with hyphens, and remove trailing dot from weekday if any
  return formatted.replace(/, /g, '-').replace(/ /g, '-').replace(/\.$/, ''); 
};

// This API route will handle scraping for a specific date from wordlehint.top
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetDateParam = searchParams.get('date'); // e.g., '2025-07-04'
  // puzzleNumberParam is still passed from frontend, but not used for URL construction on this site
  const puzzleNumberParam = searchParams.get('puzzleNumber'); 

  if (!targetDateParam) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
  }
  try {
    const dateObj = new Date(targetDateParam);
    const formattedUrlDate = formatUrlDateForWordleHintTop(dateObj);
    
    // Construct the URL for wordlehint.top
    const url = `https://www.wordlehint.top/todays-wordle-answer-${formattedUrlDate}`;
    
    // Define proxy for Crawlee (disabled for testing)
    // const proxyUrl = 'http://127.0.0.1:7890'; // 你的 ClashX 代理地址
    // const proxyConfiguration = new ProxyConfiguration({
    //     proxyUrls: [proxyUrl]
    // });

    console.log(`Scraping URL with Crawlee: ${url}`);

    // eslint-disable-next-line prefer-const
    let parsedHintsVarName: string = '';
    // eslint-disable-next-line prefer-const
    let wordleData: Partial<WordleAnswer> = {
        puzzle_number: puzzleNumberParam ? parseInt(puzzleNumberParam) : 0,
        date: targetDateParam,
        answer: '',
        hints: [],
        difficulty: 'Medium',
        definition: ''
    };

    const crawler = new PlaywrightCrawler({
      // proxyConfiguration, // Disabled for testing
      requestHandler: async ({ page, request }) => {
        await page.setExtraHTTPHeaders({ 'User-Agent': 'curl/8.7.1' });

        console.log(`Visiting page: ${request.url}`);

        const htmlContent = await page.content();
        console.log("Fetched HTML snippet (first 2000 chars from Playwright):", htmlContent.slice(0, 2000));

        let extractedAnswer: string = '';
        let extractedHints: string[] = [];
        let parsedHintsVarName: string = '';

        const scriptContents = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.map(script => script.textContent);
        });

        for (const scriptText of scriptContents) {
            if (scriptText) {
                let match = scriptText.match(/const TodayHints = ({.*?});/s);
                if (match && match[1]) {
                    try {
                        const hintsObj = JSON.parse(match[1]);
                        if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                        if (hintsObj.hints) extractedHints = hintsObj.hints;
                        parsedHintsVarName = 'TodayHints';
                        console.log("Successfully parsed TodayHints variable.");
                        break; 
                    } catch (e) {
                        console.error("Error parsing TodayHints JSON from script:", e);
                    }
                }

                if (!extractedAnswer && !extractedHints.length) { 
                   match = scriptText.match(/const YesterdayHints = ({.*?});/s);
                   if (match && match[1]) {
                      try {
                          const hintsObj = JSON.parse(match[1]);
                          if (hintsObj.answer) extractedAnswer = hintsObj.answer;
                          if (hintsObj.hints) extractedHints = hintsObj.hints;
                          parsedHintsVarName = 'YesterdayHints';
                          console.log("Successfully parsed YesterdayHints variable.");
                          break; 
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
        wordleData.hints = extractedHints.map((hint) => ({
          type: 'clue',
          value: hint
        }));

        const pageTitle = await page.title();
        const titlePuzzleMatch = pageTitle.match(/#(\d+)/) || pageTitle.match(/Wordle Hint For.*#(\d+)/); 
        wordleData.puzzle_number = titlePuzzleMatch && titlePuzzleMatch[1] ? parseInt(titlePuzzleMatch[1], 10) : (puzzleNumberParam ? parseInt(puzzleNumberParam) : 0);
      },
      maxRequestsPerCrawl: 1,
    });

    await crawler.run([{ url }]);

    console.log("Extracted Puzzle Number (Final):", wordleData.puzzle_number);
    console.log("Extracted Answer (Final):", wordleData.answer);
    console.log("Extracted Hints (Final):", wordleData.hints);

    wordleData.difficulty = 'Medium'; // Defaulting to Medium
    wordleData.definition = ''; // Set to empty as it's not provided for each word

    // Log warnings if crucial data is missing
    if (!wordleData.answer) {
        console.warn("Scraping Warning: Could not find answer on page:", url);
    }
    if (wordleData.hints?.length === 0) {
        console.warn("Scraping Warning: Could not find hints on page:", url);
    }

    // Return a 500 error if essential data is missing
    if (!wordleData.answer || wordleData.hints?.length === 0) { 
        console.error("Scraped data incomplete, returning 500:", wordleData);
        return NextResponse.json({ 
            error: 'Scraped data is incomplete or invalid. Check scraper logic or target website structure.',
            debug: {
                scriptContentFound: !!parsedHintsVarName,
                parsedTodayHints: wordleData.answer ? { answer: wordleData.answer, hints: wordleData.hints } : {}
            }
        }, { status: 500 });
    }

    return NextResponse.json(wordleData as WordleAnswer);

  } catch (error: unknown) {
    console.error('Scraping error:', error);
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof Error && error.stack) {
        errorMessage += `\nStack: ${error.stack}`;
    }
    return NextResponse.json({
      error: `Scraping error: ${errorMessage}`,
      cause: error instanceof Error ? error.cause?.toString() || 'No specific cause reported' : 'Unknown cause'
    }, { status: 500 });
  }
} 