// Lightweight scraper that doesn't require Playwright
// Uses simple HTTP requests and cheerio for HTML parsing

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedWordleData {
  answer: string;
  puzzle_number: number;
  date: string;
  source: string;
}

// Helper function to calculate puzzle number
function calculatePuzzleNumber(dateStr: string): number {
  const targetDate = new Date(dateStr);
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return basePuzzleNumber + diffDays;
}

// Method 1: Try to scrape from NYT review page
async function scrapeFromNYTReview(dateStr: string, puzzleNumber: number): Promise<string | null> {
  try {
    const targetDate = new Date(dateStr);
    const reviewDate = new Date(targetDate);
    reviewDate.setDate(reviewDate.getDate() - 1);
    
    const year = reviewDate.getFullYear();
    const month = String(reviewDate.getMonth() + 1).padStart(2, '0');
    const day = String(reviewDate.getDate()).padStart(2, '0');
    
    const reviewUrl = `https://www.nytimes.com/${year}/${month}/${day}/crosswords/wordle-review-${puzzleNumber}.html`;
    
    console.log(`Trying NYT review: ${reviewUrl}`);
    
    const response = await axios.get(reviewUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const bodyText = $.text();
    
    // Try multiple patterns to find the answer
    const patterns = [
      /Today'?s word is ([A-Z]{5})/i,
      /(?:The answer is|Answer:?)\s*([A-Z]{5})/i,
      /([A-Z]{5})\s*(?:was|is)\s*the answer/i,
      /["'"]([A-Z]{5})["'"]/i
    ];
    
    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match && match[1]) {
        console.log(`Found answer from NYT review: ${match[1]}`);
        return match[1].toUpperCase();
      }
    }
    
    // Also check for emphasized text
    const strongText = $('strong, b, em, .answer').text();
    const strongMatch = strongText.match(/\b([A-Z]{5})\b/i);
    if (strongMatch) {
      console.log(`Found answer in emphasized text: ${strongMatch[1]}`);
      return strongMatch[1].toUpperCase();
    }
    
    return null;
  } catch (error) {
    console.log('NYT review scraping failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Method 2: Try wordlehint.top as fallback
async function scrapeFromWordleHint(dateStr: string): Promise<string | null> {
  try {
    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    };
    const formatted = dateObj.toLocaleDateString('en-US', options);
    const urlDate = formatted.replace(/, /g, '-').replace(/ /g, '-');
    
    const fallbackUrl = `https://www.wordlehint.top/todays-wordle-answer-${urlDate}`;
    console.log(`Trying wordlehint.top: ${fallbackUrl}`);
    
    const response = await axios.get(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Look for script tags containing hints data
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const scriptContent = $(script).html();
      if (scriptContent) {
        // Try to find TodayHints or YesterdayHints
        let match = scriptContent.match(/const TodayHints = ({.*?});/s);
        if (!match) {
          match = scriptContent.match(/const YesterdayHints = ({.*?});/s);
        }
        
        if (match && match[1]) {
          try {
            const hintsObj = JSON.parse(match[1]);
            if (hintsObj.answer) {
              console.log(`Found answer from wordlehint.top: ${hintsObj.answer}`);
              return hintsObj.answer.toUpperCase();
            }
          } catch (e) {
            console.log('Error parsing hints JSON:', e);
          }
        }
      }
    }
    
    // Also try to find answer in page text
    const pageText = $.text();
    const answerMatch = pageText.match(/(?:answer|word).*?([A-Z]{5})/i);
    if (answerMatch && answerMatch[1]) {
      console.log(`Found answer in page text: ${answerMatch[1]}`);
      return answerMatch[1].toUpperCase();
    }
    
    return null;
  } catch (error) {
    console.log('WordleHint scraping failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Main lightweight scraping function
export async function lightweightScrape(dateStr: string): Promise<ScrapedWordleData | null> {
  const puzzleNumber = calculatePuzzleNumber(dateStr);
  
  console.log(`Starting lightweight scrape for ${dateStr}, puzzle #${puzzleNumber}`);
  
  // Try NYT review first
  let answer = await scrapeFromNYTReview(dateStr, puzzleNumber);
  let source = 'nyt_review';
  
  // Fallback to wordlehint.top
  if (!answer) {
    answer = await scrapeFromWordleHint(dateStr);
    source = 'wordlehint_top';
  }
  
  if (answer) {
    return {
      answer: answer.toUpperCase(),
      puzzle_number: puzzleNumber,
      date: dateStr,
      source
    };
  }
  
  console.log('All lightweight scraping methods failed');
  return null;
}