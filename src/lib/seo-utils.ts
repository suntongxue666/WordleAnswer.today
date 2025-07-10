import { format } from 'date-fns';
import { WordleAnswer } from '@/lib/wordle-data';

// 生成动态SEO元数据
export function generateSEOMetadata(wordleData: WordleAnswer | null) {
  const today = new Date();
  const todayFormatted = format(today, 'MMMM d'); // "July 10"
  const dayOfWeek = format(today, 'EEEE'); // "Thursday"
  const fullDate = format(today, 'MMMM d, yyyy'); // "July 10, 2025"
  
  const answer = wordleData?.answer || 'Daily Wordle';
  const puzzleNumber = wordleData?.puzzle_number || format(today, 'MMdd');
  
  // 基于Google Trends的高搜索量关键词
  const primaryKeywords = [
    'Wordle Answer Today',
    `Wordle ${todayFormatted}`,
    'Wordle Hint Today',
    `Today's Wordle`,
    'Wordle Solution',
    `Wordle Puzzle #${puzzleNumber}`
  ];
  
  // 动态标题 - 包含核心关键词和日期
  const title = `Wordle Answer Today - ${dayOfWeek} ${todayFormatted} Wordle Hint & Solution | Puzzle #${puzzleNumber}`;
  
  // 描述 - 包含答案预告和关键词
  const description = `Get today's Wordle answer for ${fullDate}! Find Wordle hints, clues and the solution for puzzle #${puzzleNumber}. Daily Wordle help with strategic tips and letter analysis. Updated every day with the latest ${dayOfWeek} Wordle answer.`;
  
  // 关键词 - 基于搜索趋势优化
  const keywords = [
    'wordle answer today',
    `wordle ${todayFormatted.toLowerCase()}`,
    'wordle hint today',
    'wordle solution',
    'wordle clues',
    `wordle puzzle ${puzzleNumber}`,
    'wordle help',
    'wordle tips',
    'wordle strategy',
    'wordle game',
    `${dayOfWeek.toLowerCase()} wordle`,
    'wordle daily',
    'wordle solver',
    'wordle answers',
    'wordle hints'
  ].join(', ');
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${dayOfWeek} Wordle Answer - ${todayFormatted} Hint & Solution`,
      description: `Discover today's Wordle answer for ${fullDate}. Get hints, tips and the solution for Wordle puzzle #${puzzleNumber}. Updated daily!`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Wordle Answer Today'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle Answer ${todayFormatted} - Puzzle #${puzzleNumber} Solution`,
      description: `Today's Wordle answer and hints for ${dayOfWeek}, ${fullDate}. Get the solution and strategic tips!`
    },
    alternates: {
      canonical: 'https://wordleanswer.today/'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    }
  };
}