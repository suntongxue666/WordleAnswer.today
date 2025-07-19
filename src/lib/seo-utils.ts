import { format, parseISO } from 'date-fns';
import { WordleAnswer } from '@/lib/wordle-data';

// 生成动态SEO元数据
export function generateSEOMetadata(wordleData: WordleAnswer | null) {
  // 使用抓取到的数据日期，而不是当前日期
  const dataDate = wordleData?.date ? parseISO(wordleData.date) : new Date();
  const dataDateFormatted = format(dataDate, 'MMMM d'); // "July 10"
  const dayOfWeek = format(dataDate, 'EEEE'); // "Thursday"
  const fullDate = format(dataDate, 'MMMM d, yyyy'); // "July 10, 2025"

  const answer = wordleData?.answer || 'Daily Wordle';
  const puzzleNumber = wordleData?.puzzle_number || format(dataDate, 'MMdd');

  // 基于Google Trends的高搜索量关键词
  const primaryKeywords = [
    'Wordle Answer Today',
    `Wordle ${dataDateFormatted}`,
    'Wordle Hint Today',
    `Today's Wordle`,
    'Wordle Solution',
    `Wordle Puzzle #${puzzleNumber}`
  ];

  // 动态标题 - 包含核心关键词和日期
  const title = `Wordle ${dataDateFormatted} Answer & Hint - Puzzle #${puzzleNumber} Solver & Finder`;

  // 描述 - 包含答案预告和关键词
  const description = `Get today's Wordle answer for ${fullDate}! Find Wordle hints, clues and the solution for puzzle #${puzzleNumber}. Daily Wordle help with strategic tips and letter analysis. Updated every day with the latest ${dayOfWeek} Wordle answer.`;

  // 关键词 - 基于搜索趋势优化
  const keywords = [
    'wordle answer today',
    `wordle ${dataDateFormatted.toLowerCase()}`,
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
      title: `${dayOfWeek} Wordle Answer - ${dataDateFormatted} Hint & Solution`,
      description: `Discover today's Wordle answer for ${fullDate}. Get hints, tips and the solution for Wordle puzzle #${puzzleNumber}. Updated daily!`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Wordle Answer Today'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle Answer ${dataDateFormatted} - Puzzle #${puzzleNumber} Solution`,
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

// 为二级页面生成SEO元数据，使用URL日期参数
export function generateSecondaryPageSEOMetadata(urlDate: string, wordleData: WordleAnswer | null) {
  // 使用URL中的日期，而不是抓取到的数据日期
  const pageDate = parseISO(urlDate);
  const pageDateFormatted = format(pageDate, 'MMMM d'); // "July 8"
  const dayOfWeek = format(pageDate, 'EEEE'); // "Monday"
  const fullDate = format(pageDate, 'MMMM d, yyyy'); // "July 8, 2025"

  const answer = wordleData?.answer || 'Daily Wordle';
  const puzzleNumber = wordleData?.puzzle_number || format(pageDate, 'MMdd');

  // 动态标题 - 使用URL日期
  const title = `Wordle ${pageDateFormatted} Answer & Hint - ${dayOfWeek} Solution | Puzzle #${puzzleNumber}`;

  // 描述 - 使用URL日期
  const description = `Get the Wordle answer for ${fullDate}! Find hints, clues and the solution for puzzle #${puzzleNumber}. Complete analysis with strategic tips and letter patterns for ${dayOfWeek}'s Wordle puzzle.`;

  // 关键词 - 基于URL日期
  const keywords = [
    `wordle ${pageDateFormatted.toLowerCase()}`,
    `wordle ${pageDateFormatted.toLowerCase()} answer`,
    `wordle ${pageDateFormatted.toLowerCase()} hint`,
    `wordle ${pageDateFormatted.toLowerCase()} solution`,
    `wordle puzzle ${puzzleNumber}`,
    `${dayOfWeek.toLowerCase()} wordle`,
    'wordle help',
    'wordle tips',
    'wordle strategy',
    'wordle clues',
    'wordle solver',
    'wordle answers',
    'wordle hints'
  ].join(', ');

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${dayOfWeek} Wordle ${pageDateFormatted} - Answer & Hint Solution`,
      description: `Discover the Wordle answer for ${fullDate}. Get hints, tips and the solution for puzzle #${puzzleNumber}. Complete analysis and strategic insights!`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Wordle Answer Today'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle ${pageDateFormatted} Answer - Puzzle #${puzzleNumber} Solution`,
      description: `${dayOfWeek}'s Wordle answer and hints for ${fullDate}. Get the solution and strategic tips!`
    },
    alternates: {
      canonical: `https://wordleanswer.today/wordle/${urlDate}`
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