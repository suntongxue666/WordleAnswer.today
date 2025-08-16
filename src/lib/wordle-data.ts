import { supabase } from '@/lib/supabase'; // 导入 Supabase 客户端
import { format } from 'date-fns'; // Add this import
import { unstable_cache as cache } from 'next/cache'; // 导入 unstable_cache

export interface WordleAnswer {
  id: string;
  date: string; // YYYY-MM-DD
  puzzle_number: number;
  answer: string;
  hints: { type: string; value: string }[];
  difficulty: string | null; // Allow null for difficulty
  definition: string | null; // Allow null for definition
  created_at: string;
}

export interface NYTGame {
  name: string;
  description: string;
  icon: string;
  playUrl: string;
  category: 'Word Games' | 'Number Games' | 'Logic Games';
}

export type WordleData = {
  date: string;
  puzzle_number: number;
  answer: string;
  hints: { type: string; value: string }[];
  difficulty?: string;
  definition?: string;
};

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

// 获取今天的 Wordle 数据
export const getTodaysWordle = cache(
  async (testDate?: string): Promise<WordleAnswer | null> => {
  const dateToFetch = testDate || format(new Date(Date.now()), 'yyyy-MM-dd');
  console.log(`[getTodaysWordle] Attempting to fetch Wordle for date: ${dateToFetch}`);

  const supabaseClient = supabase;
  if (!supabaseClient) {
    console.error('[getTodaysWordle] Supabase client not available');
    return null;
  }

  const { data, error } = await supabaseClient
    .from('wordle-answers')
    .select('*')
    .eq('date', dateToFetch)
    .order('created_at', { ascending: false })
    .limit(1)
    .single(); // Use .single() for a single record

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error(`[getTodaysWordle] Error fetching Wordle for ${dateToFetch}:`, error);
    return null;
  }

  const result = data as WordleAnswer | null;
  console.log(`[getTodaysWordle] Result for ${dateToFetch}: ${result ? `Found (Puzzle: ${result.puzzle_number}, Answer: ${result.answer})` : 'Not Found'}`);
  return result;
  },
  ['todays-wordle'], // Cache tag for today's wordle
  { revalidate: 3600 } // Revalidate every hour
);


// 获取最近的 Wordle 答案（根据需求可以按日期排序或限制数量）
export const getRecentWordleAnswers = cache(
  async (limit: number = 10): Promise<WordleData[]> => {
  const supabaseClient = supabase;
  if (!supabaseClient) {
    console.error('[getRecentWordleAnswers] Supabase client not available');
    return [];
  }

  const { data, error } = await supabaseClient
    .from('wordle-answers')
    .select('*')
    .order('date', { ascending: false }) // 按日期降序排序
    .limit(limit);

  if (error) {
    console.error('Error fetching recent Wordle answers:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // 转换数据格式
  return data.map((item: WordleAnswer) => ({
    date: item.date,
    puzzle_number: item.puzzle_number,
    answer: item.answer,
    hints: Array.isArray(item.hints) ? item.hints : [],
    difficulty: item.difficulty || undefined,
    definition: item.definition || undefined,
  }));
  },
  ['recent-wordles'], // Cache tag for recent wordles
  { revalidate: 3600 } // Revalidate every hour (3600 seconds)
);

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
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error(`[formatDate] Error formatting date: ${dateString}`, error);
    return dateString; // 返回原始日期字符串作为后备
  }
};

// 计算Wordle期数，基于7月7日为#1479
export const calculatePuzzleNumber = (dateString: string): number => {
  try {
    const baseDate = new Date('2025-07-07'); // 基准日期：7月7日
    const basePuzzleNumber = 1479; // 基准期数
    
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return basePuzzleNumber + diffDays;
  } catch (error) {
    console.error(`[calculatePuzzleNumber] Error calculating puzzle number for date: ${dateString}`, error);
    // 如果出错，返回一个基于日期字符串的简单计算
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(5, 7));
    const day = parseInt(dateString.substring(8, 10));
    return 1479 + ((year - 2025) * 365) + ((month - 7) * 30) + (day - 7);
  }
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

export const getRecentWordles = cache(
  async (days: number = 30): Promise<WordleAnswer[]> => {
  const supabaseClient = supabase;
  if (!supabaseClient) {
    console.error('[getRecentWordles] Supabase client not available');
    return [];
  }

  const now = Date.now();
  const today = new Date(now);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(today.getDate() - days);

  const startDate = format(thirtyDaysAgo, 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  console.log(`[getRecentWordles] Fetching Wordles from ${startDate} to ${endDate}`);

  const { data, error } = await supabaseClient
    .from('wordle-answers')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('[getRecentWordles] Error fetching recent Wordles:', error);
    return [];
  }
  // Log fetched dates to verify
  console.log(`[getRecentWordles] Fetched ${data.length} recent Wordles. Dates: ${data.map(d => d.date).join(', ')}`);
  return data as WordleAnswer[];
  },
  ['all-recent-wordles'], // Cache tag for recent wordles
  { revalidate: 60 } // Revalidate every minute for testing
);

// 获取所有Wordle数据用于sitemap生成
export async function getAllWordlesForSitemap(): Promise<WordleAnswer[]> {
  const supabaseClient = supabase;
  if (!supabaseClient) {
    console.error('[getAllWordlesForSitemap] Supabase client not available');
    return [];
  }

  const { data, error } = await supabaseClient
    .from('wordle-answers')
    .select('date, puzzle_number')
    .order('date', { ascending: true });

  if (error) {
    console.error('[getAllWordlesForSitemap] Error fetching all Wordles:', error);
    return [];
  }

  return data as WordleAnswer[];
}
