// Emergency fallback mechanism for Wordle answers
// This provides a last resort when all scraping methods fail

export interface EmergencyWordleData {
  date: string;
  answer: string;
  puzzle_number: number;
}

// Known Wordle answers as emergency fallback
// These will be updated regularly with confirmed answers
export const knownAnswers: EmergencyWordleData[] = [
  { date: '2025-07-07', answer: 'MAKER', puzzle_number: 1479 },
  { date: '2025-07-08', answer: 'FRAUD', puzzle_number: 1480 },
  { date: '2025-07-09', answer: 'LAUGH', puzzle_number: 1481 },
  { date: '2025-07-10', answer: 'FLARE', puzzle_number: 1482 },
  { date: '2025-07-11', answer: 'SKUNK', puzzle_number: 1483 },
  { date: '2025-07-12', answer: 'KNELT', puzzle_number: 1484 },
  { date: '2025-07-13', answer: 'GNOME', puzzle_number: 1485 },
  { date: '2025-07-14', answer: 'UNDID', puzzle_number: 1486 },
  { date: '2025-07-15', answer: 'FOIST', puzzle_number: 1487 },
  // Add more known answers here as they become available
];

/**
 * Get emergency fallback data for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns WordleData or null if not found
 */
export function getEmergencyFallback(date: string): EmergencyWordleData | null {
  const found = knownAnswers.find(item => item.date === date);
  return found || null;
}

/**
 * Get the most recent known answer before the given date
 * Useful for estimating puzzle numbers
 * @param date - Date in YYYY-MM-DD format
 * @returns Most recent known answer or null
 */
export function getLatestKnownAnswer(date: string): EmergencyWordleData | null {
  const targetDate = new Date(date);
  const validAnswers = knownAnswers.filter(item => new Date(item.date) <= targetDate);
  
  if (validAnswers.length === 0) return null;
  
  return validAnswers.reduce((latest, current) => 
    new Date(current.date) > new Date(latest.date) ? current : latest
  );
}

/**
 * Calculate puzzle number based on known reference points
 * @param date - Date in YYYY-MM-DD format
 * @returns Calculated puzzle number
 */
export function calculatePuzzleNumber(date: string): number {
  const baseDate = new Date('2025-07-07');
  const basePuzzleNumber = 1479;
  
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return basePuzzleNumber + diffDays;
}

/**
 * Generate a reasonable guess for an unknown answer
 * This is a last resort - returns a common 5-letter word
 * @param date - Date in YYYY-MM-DD format
 * @returns A fallback word
 */
export function generateFallbackWord(date: string): string {
  const commonWords = [
    'ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'ALONG', 'AMONG', 'APPLY',
    'BELOW', 'BRING', 'BUILD', 'CARRY', 'CATCH', 'CAUSE', 'CHAIR',
    'CLEAN', 'CLEAR', 'CLOSE', 'COVER', 'DANCE', 'DAILY', 'EARLY',
    'EARTH', 'EVERY', 'FIELD', 'FINAL', 'FIRST', 'FOCUS', 'FORCE',
    'FRAME', 'FRONT', 'GLASS', 'GREAT', 'GREEN', 'GROUP', 'GUARD',
    'HAPPY', 'HEART', 'HOUSE', 'HUMAN', 'IMAGE', 'LARGE', 'LEARN',
    'LIGHT', 'MIGHT', 'MONEY', 'MONTH', 'MUSIC', 'NEVER', 'NIGHT',
    'NORTH', 'OTHER', 'PAPER', 'PARTY', 'PEACE', 'PHONE', 'PLACE',
    'PLANT', 'POINT', 'POWER', 'PRESS', 'PRICE', 'QUICK', 'QUIET',
    'RADIO', 'REACH', 'RIGHT', 'ROUND', 'SCALE', 'SENSE', 'SERVE',
    'SHARE', 'SHELL', 'SHIFT', 'SHINE', 'SHORT', 'SMALL', 'SMILE',
    'SOUND', 'SPACE', 'SPEAK', 'SPEND', 'STAGE', 'START', 'STATE',
    'STILL', 'STUDY', 'STYLE', 'SUGAR', 'TABLE', 'TEACH', 'THANK',
    'THEIR', 'THESE', 'THINK', 'THREE', 'THROW', 'TODAY', 'TOTAL',
    'TOUCH', 'TRADE', 'TRAIN', 'TREAT', 'TRUST', 'TRUTH', 'UNCLE',
    'UNDER', 'UNION', 'UNTIL', 'USUAL', 'VALUE', 'VIDEO', 'VISIT',
    'VOICE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE',
    'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WORLD', 'WORRY', 'WOULD',
    'WRITE', 'WRONG', 'YOUNG', 'YOUTH'
  ];
  
  // Use date as seed for consistent "random" selection
  const dateNum = new Date(date).getTime();
  const index = dateNum % commonWords.length;
  
  return commonWords[index];
}

/**
 * Comprehensive emergency fallback handler
 * @param date - Date in YYYY-MM-DD format
 * @returns Emergency WordleData
 */
export function getEmergencyWordleData(date: string): EmergencyWordleData {
  // First try to get known answer
  const knownAnswer = getEmergencyFallback(date);
  if (knownAnswer) {
    return knownAnswer;
  }
  
  // If no known answer, generate fallback
  const puzzleNumber = calculatePuzzleNumber(date);
  const fallbackWord = generateFallbackWord(date);
  
  console.warn(`Using emergency fallback for ${date}: ${fallbackWord} (puzzle ${puzzleNumber})`);
  
  return {
    date,
    answer: fallbackWord,
    puzzle_number: puzzleNumber
  };
}