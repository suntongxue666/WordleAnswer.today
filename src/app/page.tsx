import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import {
  Lightbulb,
  Calendar,
  Eye,
  Info,
  ExternalLink
} from 'lucide-react';

import {
  getTodaysWordle,
  getRecentWordles,
  type WordleAnswer
} from '@/lib/wordle-data';
import ClientBody from '@/app/ClientBody';
import { WordlePuzzle } from '@/components/WordlePuzzle';
import { RecentWordleCard } from '@/components/RecentWordleCard';
import { format, parseISO, subDays } from 'date-fns';

export default async function HomePage() {
  const todaysDate = new Date();
  const formattedTodaysDate = format(todaysDate, 'yyyy-MM-dd');
  const formattedYesterdayDate = format(subDays(todaysDate, 1), 'yyyy-MM-dd');

  let wordleToDisplay: WordleAnswer | null = null;

  // 尝试获取今天的数据
  wordleToDisplay = await getTodaysWordle(formattedTodaysDate);

  // 如果获取不到今天的数据，显示前一天的
  if (!wordleToDisplay) {
    console.log(`Today's Wordle (${formattedTodaysDate}) not found, trying yesterday's (${formattedYesterdayDate}).`);
    wordleToDisplay = await getTodaysWordle(formattedYesterdayDate);
  }

  const recentWordles = await getRecentWordles();
  
  // 将今天的数据加到Recent列表的第一位（如果存在）
  const recentWordlesWithToday = wordleToDisplay 
    ? [wordleToDisplay, ...recentWordles.filter(wordle => wordle.date !== wordleToDisplay?.date)]
    : recentWordles;
  
  // 显示所有最近的Wordles（SEO优化：更多内容有利于搜索引擎收录）
  const displayWordles = recentWordlesWithToday;

  return (
    <ClientBody>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
            Wordle Answer Today
          </h1>

          {wordleToDisplay ? (
            <>
              <WordlePuzzle
                date={wordleToDisplay.date}
                puzzleNumber={wordleToDisplay.puzzle_number}
                answer={wordleToDisplay.answer}
                hints={wordleToDisplay.hints}
                difficulty={wordleToDisplay.difficulty}
                definition={wordleToDisplay.definition}
              />
              <div className="mt-8 w-full max-w-lg md:max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-left">Recent Wordle Answers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayWordles
                    .map((wordle) => (
                      <RecentWordleCard
                        key={wordle.id}
                        id={wordle.id}
                        date={wordle.date}
                        puzzleNumber={wordle.puzzle_number}
                        answer={wordle.answer}
                        difficulty={wordle.difficulty}
                      />
                    ))}
                </div>
                <div className="mt-6">
                  <Link href="/archive" passHref>
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" /> View Complete Archive
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-lg text-gray-700">
              <p>Could not load any Wordle data. Please check back later.</p>
              <div className="mt-4 p-4 bg-gray-100 text-sm">
                <p>Debug info:</p>
                <p>Today's date: {formattedTodaysDate}</p>
                <p>Yesterday's date: {formattedYesterdayDate}</p>
                <p>Recent wordles count: {recentWordles.length}</p>
                <p>Environment: {process.env.NODE_ENV}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ClientBody>
  );
}

