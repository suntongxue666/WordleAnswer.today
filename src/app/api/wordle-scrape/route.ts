import { NextResponse } from 'next/server';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { WordleAnswer } from '@/lib/wordle-data'; // Import the interface
import { getSupabase } from '@/lib/supabase';
import { generateHints, generateDifficulty } from '@/lib/hint-generator';
import { getEmergencyWordleData } from '@/lib/emergency-fallback';

// Helper function to format date for wordlehint.top URL (e.g., Fri-Jul-04-2025)
const formatUrlDateForWordleHintTop = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options); // "Fri, Jul 04, 2025"
  // Replace comma with hyphen, spaces with hyphens, and remove trailing dot from weekday if any
  return formatted.replace(/, /g, '-').replace(/ /g, '-').replace(/\.$/, ''); 
};

// This API route will handle scraping for a specific date from NYT Wordle
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let targetDateParam = searchParams.get('date'); // e.g., '2025-07-04'
  const puzzleNumberParam = searchParams.get('puzzleNumber'); 

  // Handle 'TODAY' parameter for external cron jobs
  if (targetDateParam === 'TODAY' || !targetDateParam) {
    const today = new Date();
    // Format as YYYY-MM-DD
    targetDateParam = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    console.log(`Using today's date: ${targetDateParam}`);
  }

  try {
    const dateObj = new Date(targetDateParam);
    
    // Calculate puzzle number if not provided
    let puzzleNumber = puzzleNumberParam ? parseInt(puzzleNumberParam) : 0;
    if (!puzzleNumber) {
      const baseDate = new Date('2025-07-07');
      const basePuzzleNumber = 1479;
      const diffTime = dateObj.getTime() - baseDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      puzzleNumber = basePuzzleNumber + diffDays;
    }
    
    // Format date for NYT URL (YYYY/MM/DD)
    const nytDateFormat = targetDateParam.replace(/-/g, '/');
    const nytReviewUrl = `https://www.nytimes.com/${nytDateFormat}/crosswords/wordle-review-${puzzleNumber}.html`;
    
    console.log(`Scraping Wordle answer from NYT review page: ${nytReviewUrl}`);

    // eslint-disable-next-line prefer-const
    let wordleData: Partial<WordleAnswer> = {
        puzzle_number: puzzleNumber,
        date: targetDateParam,
        answer: '',
        hints: [],
        difficulty: 'Medium',
        definition: ''
    };

    const crawler = new PlaywrightCrawler({
      requestHandler: async ({ page, request }) => {
        await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' });

        console.log(`Visiting page: ${request.url}`);
        
        let extractedAnswer: string = '';
        
        // Try multiple approaches to get the answer
        try {
          // Method 1: Try NYT review page first
          try {
            await page.goto(nytReviewUrl, { waitUntil: 'networkidle' });
            
            // Look for the answer in the review page
            const reviewAnswer = await page.evaluate(() => {
              // Look for text patterns that indicate the answer
              const bodyText = document.body.innerText;
              
              // Pattern 1: "Today's word is WORD" (primary pattern from NYT)
              let match = bodyText.match(/Today'?s word is ([A-Z]{5})/i);
              if (match) return match[1];
              
              // Pattern 2: "The answer is WORD" or "Answer: WORD"
              match = bodyText.match(/(?:The answer is|Answer:?)\s*([A-Z]{5})/i);
              if (match) return match[1];
              
              // Pattern 3: "WORD was the answer" or "WORD is the answer"
              match = bodyText.match(/([A-Z]{5})\s*(?:was|is)\s*the answer/i);
              if (match) return match[1];
              
              // Pattern 4: Look for emphasized or highlighted 5-letter words
              const strongElements = document.querySelectorAll('strong, b, em, .answer');
              for (const element of strongElements) {
                const text = element.textContent?.trim();
                if (text && /^[A-Z]{5}$/i.test(text)) {
                  return text;
                }
              }
              
              // Pattern 5: Look for 5-letter words in quotes
              match = bodyText.match(/["'"]([A-Z]{5})["'"]/i);
              if (match) return match[1];
              
              // Pattern 6: Look for "word was" or "word is" patterns
              match = bodyText.match(/([A-Z]{5})\s*(?:was|is)/i);
              if (match) return match[1];
              
              return null;
            });
            
            if (reviewAnswer) {
              extractedAnswer = reviewAnswer;
              console.log('Found answer in NYT review page:', extractedAnswer);
            }
            
          } catch (reviewError) {
            console.log('NYT review page not accessible, trying main game page...');
          }
          
          // Method 2: Try main Wordle page if review fails
          if (!extractedAnswer) {
            await page.goto('https://www.nytimes.com/games/wordle/index.html', { waitUntil: 'networkidle' });
            
            // Check localStorage/sessionStorage
            const storageAnswer = await page.evaluate(() => {
              const gameState = localStorage.getItem('nyt-wordle-state');
              const gameData = sessionStorage.getItem('nyt-wordle-state');
              
              if (gameState) {
                try {
                  const parsed = JSON.parse(gameState);
                  return parsed.solution || parsed.answer;
                } catch (e) {
                  console.log('Error parsing localStorage:', e);
                }
              }
              
              if (gameData) {
                try {
                  const parsed = JSON.parse(gameData);
                  return parsed.solution || parsed.answer;
                } catch (e) {
                  console.log('Error parsing sessionStorage:', e);
                }
              }
              
              return null;
            });
            
            if (storageAnswer) {
              extractedAnswer = storageAnswer;
              console.log('Found answer in game storage:', extractedAnswer);
            }
            
            // Try to find answer in script tags
            if (!extractedAnswer) {
              const scriptContents = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                return scripts.map(script => script.textContent || '').join('\n');
              });
              
              // Look for solution in various patterns
              const patterns = [
                /solution['":\s]*['"]([A-Z]{5})['"]/gi,
                /answer['":\s]*['"]([A-Z]{5})['"]/gi,
                /word['":\s]*['"]([A-Z]{5})['"]/gi,
                /'([A-Z]{5})'/g,
                /"([A-Z]{5})"/g
              ];
              
              for (const pattern of patterns) {
                const matches = scriptContents.match(pattern);
                if (matches) {
                  for (const match of matches) {
                    const word = match.match(/[A-Z]{5}/)?.[0];
                    if (word && word.length === 5) {
                      extractedAnswer = word;
                      console.log(`Found answer using pattern: ${extractedAnswer}`);
                      break;
                    }
                  }
                  if (extractedAnswer) break;
                }
              }
            }
          }
          
          // Method 3: Fallback to wordlehint.top if NYT methods fail
          if (!extractedAnswer) {
            console.log('NYT methods failed, trying wordlehint.top as fallback...');
            const fallbackUrl = formatUrlDateForWordleHintTop(dateObj);
            await page.goto(`https://www.wordlehint.top/todays-wordle-answer-${fallbackUrl}`, { waitUntil: 'networkidle' });
            
            const fallbackScripts = await page.evaluate(() => {
              const scripts = Array.from(document.querySelectorAll('script'));
              return scripts.map(script => script.textContent);
            });

            for (const scriptText of fallbackScripts) {
              if (scriptText) {
                // Try TodayHints first, then YesterdayHints
                let match = scriptText.match(/const TodayHints = ({.*?});/s);
                if (!match) {
                  match = scriptText.match(/const YesterdayHints = ({.*?});/s);
                }
                
                if (match && match[1]) {
                  try {
                    const hintsObj = JSON.parse(match[1]);
                    if (hintsObj.answer) {
                      extractedAnswer = hintsObj.answer;
                      console.log("Found answer from wordlehint.top:", extractedAnswer);
                      break;
                    }
                  } catch (e) {
                    console.error("Error parsing hints JSON:", e);
                  }
                }
              }
            }
          }
          
        } catch (error) {
          console.error('Error during scraping:', error);
        }

        if (extractedAnswer) {
          wordleData.answer = extractedAnswer.toUpperCase();
          
          // Generate hints automatically
          wordleData.hints = generateHints(extractedAnswer);
          
          // Generate difficulty automatically
          wordleData.difficulty = generateDifficulty(extractedAnswer);
          
          console.log(`Generated ${wordleData.hints.length} hints for answer: ${wordleData.answer}`);
        }
      },
      maxRequestsPerCrawl: 1,
    });

    await crawler.run([{ url: nytReviewUrl }]);

    console.log("Extracted Puzzle Number (Final):", wordleData.puzzle_number);
    console.log("Extracted Answer (Final):", wordleData.answer);
    console.log("Generated Hints (Final):", wordleData.hints);
    console.log("Generated Difficulty (Final):", wordleData.difficulty);

    // Log warnings if crucial data is missing
    if (!wordleData.answer) {
        console.warn("Scraping Warning: Could not find answer");
    }

    // Return a 500 error if essential data is missing
    if (!wordleData.answer) { 
        console.error("All scraping methods failed, using emergency fallback:", wordleData);
        
        // Use emergency fallback as last resort
        const emergencyData = getEmergencyWordleData(targetDateParam);
        wordleData.answer = emergencyData.answer;
        wordleData.puzzle_number = emergencyData.puzzle_number;
        
        // Generate hints for emergency fallback
        wordleData.hints = generateHints(emergencyData.answer);
        wordleData.difficulty = generateDifficulty(emergencyData.answer);
        
        console.log("Emergency fallback activated:", {
            date: targetDateParam,
            answer: emergencyData.answer,
            puzzle_number: emergencyData.puzzle_number,
            source: 'emergency_fallback'
        });
    }

    // Save scraped data to database
    try {
      if (!getSupabase()) {
        console.warn("Supabase client not initialized, skipping database save");
        return NextResponse.json({
          ...wordleData,
          saved: false,
          message: 'Data scraped successfully but not saved to database (missing credentials)'
        } as WordleAnswer & { saved: boolean; message: string });
      }

      console.log("Saving scraped data to database...");
      
      const { data, error } = await getSupabase()
        .from('wordle-answers')
        .upsert({
          date: wordleData.date,
          puzzle_number: wordleData.puzzle_number,
          answer: wordleData.answer,
          hints: wordleData.hints,
          difficulty: wordleData.difficulty,
          definition: wordleData.definition
        }, {
          onConflict: 'date' // Update if record exists with same date
        })
        .select();

      if (error) {
        console.error("Database save error:", error);
        return NextResponse.json({ 
          error: 'Failed to save scraped data to database',
          details: error.message,
          scrapedData: wordleData 
        }, { status: 500 });
      }

      console.log("Successfully saved to database:", data);
      
      return NextResponse.json({
        ...wordleData,
        saved: true,
        message: 'Data scraped and saved successfully'
      }, { status: 200 });
      
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        scrapedData: wordleData 
      }, { status: 500 });
    }

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