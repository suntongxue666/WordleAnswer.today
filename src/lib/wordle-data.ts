export interface WordleAnswer {
  date: string;
  puzzleNumber: number;
  answer: string;
  hints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  definition: string;
}

export interface NYTGame {
  name: string;
  description: string;
  icon: string;
  playUrl: string;
  category: 'Word Games' | 'Number Games' | 'Logic Games';
}

// Data fetching functions
export async function fetchWordleData(date: string, puzzleNumber: number): Promise<WordleAnswer | null> {
  try {
    const response = await fetch(`/api/wordle-scrape?date=${date}&puzzleNumber=${puzzleNumber}`);
    if (!response.ok) {
      console.error(`Error fetching Wordle data for ${date}, puzzle ${puzzleNumber}: ${response.statusText}`);
      return null;
    }
    const data: WordleAnswer = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch Wordle data for ${date}, puzzle ${puzzleNumber}:`, error);
    return null;
  }
}

// Hardcode today's target based on user's request (July 4, 2025, Puzzle #1476)
// In a real application, you'd likely have a more robust way to find today's puzzle number dynamically.
export const getTodaysWordle = async (): Promise<WordleAnswer | null> => {
  // As per user's request, target July 4, 2025, Puzzle #1476
  const targetDate = '2025-07-04';
  const targetPuzzleNumber = 1476; 
  
  const data = await fetchWordleData(targetDate, targetPuzzleNumber);
  
  if (data) {
    console.log("Successfully fetched today's Wordle:", data);
  } else {
    console.warn("Failed to fetch today's Wordle data.");
  }
  return data;
};

// For recent answers, we will provide a small set of known historical puzzles
// To fetch more historical data, you would need to know their puzzle numbers
// or implement a more complex scraping strategy that explores archive links.
export const getRecentWordleAnswers = async (): Promise<WordleAnswer[]> => {
    const historicalPuzzles: { date: string; puzzleNumber: number }[] = [
        { date: '2025-01-03', puzzleNumber: 1494 }, // This seems to be an old mock from current date, re-evaluate based on techwiser.com
        { date: '2025-01-02', puzzleNumber: 1493 },
        { date: '2025-01-01', puzzleNumber: 1492 },
        // ... add more if you know their puzzle numbers and want to fetch them
    ];

    // For now, we'll keep a few fixed ones. Fetching all history would require more advanced scraping.
    // Given the techwiser.com URL structure, finding historical puzzle numbers by date is non-trivial.
    // For demonstration, let's just use the current known good July 4 data as the first "recent" item
    // and then some of the original mock data for structure.
    
    const recentData: WordleAnswer[] = [];
    const todayData = await getTodaysWordle(); // Fetch today's first
    if (todayData) {
        recentData.push(todayData);
    }

    // Keeping some mock-like data for recent answers for now as full historical scraping is complex.
    // In a real app, you'd store this in Supabase and fetch from there.
    recentData.push(      {
        date: '2025-01-03', // Note: Puzzle numbers are inconsistent if these are relative to 1476.
        puzzleNumber: 1494, // This mock data's puzzle numbers are relative to 2025-01-04
        answer: 'CRANE',
        hints: ['Large bird', 'Construction equipment', 'Starts with C', 'Five letters', 'Used for lifting heavy objects'],
        difficulty: 'Easy',
        definition: 'A large, tall machine used for moving heavy objects by suspending them from a projecting arm or beam.'
      },
      {
        date: '2025-01-02',
        puzzleNumber: 1493,
        answer: 'LIGHT',
        hints: ['Opposite of dark', 'Electromagnetic radiation', 'Not heavy', 'Common English word', 'Essential for vision'],
        difficulty: 'Easy',
        definition: 'The natural agent that stimulates sight and makes things visible.'
      },
      {
        date: '2025-01-01',
        puzzleNumber: 1492,
        answer: 'DREAM',
        hints: ['Happens during sleep', 'Can be vivid or vague', 'Often forgotten', 'REM sleep phenomenon', 'Aspirations and goals'],
        difficulty: 'Medium',
        definition: 'A series of thoughts, images, and sensations occurring in a person\'s mind during sleep.'
      },
      {
        date: '2024-12-31',
        puzzleNumber: 1491,
        answer: 'PARTY',
        hints: ['Social gathering', 'Celebration event', 'New Year tradition', 'Fun with friends', 'Music and dancing'],
        difficulty: 'Easy',
        definition: 'A social gathering of invited guests, typically involving eating, drinking, and entertainment.'
      },
      {
        date: '2024-12-30',
        puzzleNumber: 1490,
        answer: 'QUIET',
        hints: ['Opposite of loud', 'Peaceful state', 'Library atmosphere', 'Soft volume', 'Calm and still'],
        difficulty: 'Medium',
        definition: 'Making little or no noise; free from disturbance or tumult; tranquil.'
      });

    // Remove duplicates if any (e.g. today's answer might be present in mock)
    const uniqueRecentData = Array.from(new Map(recentData.map(item => [item['puzzleNumber'], item])).values());

    return uniqueRecentData.slice(0,6); // Return top 6 recent answers
};

export const nytGames: NYTGame[] = [
  {
    name: 'Wordle',
    description: 'Guess the five-letter word in six tries',
    icon: '🔤',
    playUrl: 'https://www.nytimes.com/games/wordle/index.html',
    category: 'Word Games'
  },
  {
    name: 'Connections',
    description: 'Find groups of four items that share something in common',
    icon: '🔗',
    playUrl: 'https://www.nytimes.com/games/connections',
    category: 'Logic Games'
  },
  {
    name: 'Strands',
    description: 'Find words hidden in a letter grid',
    icon: '🧵',
    playUrl: 'https://www.nytimes.com/games/strands',
    category: 'Word Games'
  },
  {
    name: 'Mini Crossword',
    description: 'A bite-sized crossword puzzle',
    icon: '🔲',
    playUrl: 'https://www.nytimes.com/crosswords/game/mini',
    category: 'Word Games'
  },
  {
    name: 'Spelling Bee',
    description: 'How many words can you make with 7 letters?',
    icon: '🐝',
    playUrl: 'https://www.nytimes.com/puzzles/spelling-bee',
    category: 'Word Games'
  },
  {
    name: 'Letter Boxed',
    description: 'Draw lines to connect letters and spell words',
    icon: '📦',
    playUrl: 'https://www.nytimes.com/puzzles/letter-boxed',
    category: 'Word Games'
  }
];

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getWordleUrl = (date: string): string => {
  // This URL will be for the detailed page, not for scraping.
  // The puzzle number might be needed here too if the detail page requires it in its path.
  // For now, it assumes /wordle/[date] is sufficient.
  return `/wordle/${date}`;
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return 'text-green-600 bg-green-100';
    case 'Medium': return 'text-yellow-600 bg-yellow-100';
    case 'Hard': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
