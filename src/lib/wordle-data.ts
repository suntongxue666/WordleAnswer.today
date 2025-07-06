1234
import { supabase } from '@/lib/supabase'; // 导入 Supabase 客户端

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
export async function getTodaysWordle(): Promise<WordleData | null> {
  // const today = new Date().toISOString().split('T')[0]; // 原来的代码：查询今天的日期

  // --- 临时修改：查询固定日期的数据，用于测试 ---
  const testDate = '2025-07-06'; // 修改为你的爬虫刚刚插入的日期
  // --- 临时修改结束 ---

  // 从 Supabase 查询数据
  const { data, error } = await supabase
    .from('wordle-answers') // 你的表名
    .select('*')
    // .eq('date', today) // 原来的查询条件
    .eq('date', testDate) // 修改为查询固定日期的数据
    .single(); // 期望只返回一条记录

  if (error) {
    console.error('Error fetching today\'s Wordle:', error);
    return null;
  }

  if (!data) {
    return null; // 没有找到今天的 Wordle 数据
  }

  // 转换数据格式以匹配 WordleData 类型
  return {
    date: data.date,
    puzzle_number: data.puzzle_number,
    answer: data.answer,
    hints: Array.isArray(data.hints) ? data.hints : [],
    difficulty: data.difficulty,
    definition: data.definition,
  };
}

// 获取最近的 Wordle 答案（根据需求可以按日期排序或限制数量）
export async function getRecentWordleAnswers(limit: number = 10): Promise<WordleData[]> {
  const { data, error } = await supabase
    .from('wordle-answers')
    .select('*')
    .order('date', { ascending: false }) // 按日期降序排序
    .limit(limit); // 限制返回数量

  if (error) {
    console.error('Error fetching recent Wordle answers:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // 转换数据格式
  return data.map((item: any) => ({
    date: item.date,
    puzzle_number: item.puzzle_number,
    answer: item.answer,
    hints: Array.isArray(item.hints) ? item.hints : [],
    difficulty: item.difficulty,
    definition: item.definition,
  }));
}

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
