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
import { WordleAnalysis } from '@/components/WordleAnalysis';
import { HowToPlayWordle } from '@/components/HowToPlayWordle';
import { format, subDays } from 'date-fns';
import { generateSEOMetadata } from '@/lib/seo-utils';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const todaysDate = new Date();
  const formattedTodaysDate = format(todaysDate, 'yyyy-MM-dd');
  const formattedYesterdayDate = format(subDays(todaysDate, 1), 'yyyy-MM-dd');

  // Try to get today's data first, then yesterday's for metadata
  let wordleToDisplay = await getTodaysWordle(formattedTodaysDate);
  if (!wordleToDisplay) {
    wordleToDisplay = await getTodaysWordle(formattedYesterdayDate);
  }

  return generateSEOMetadata(wordleToDisplay);
}

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
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon//Wordle%20logo.png"
              alt="Wordle Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Wordle Answer Today
            </h1>
          </div>

          {/* Always show Recent Wordle Answers section */}
          <div className="mt-8 w-full max-w-lg md:max-w-4xl mx-auto">
            {wordleToDisplay ? (
              <WordlePuzzle
                date={wordleToDisplay.date}
                puzzleNumber={wordleToDisplay.puzzle_number}
                answer={wordleToDisplay.answer}
                hints={wordleToDisplay.hints}
                difficulty={wordleToDisplay.difficulty}
                definition={wordleToDisplay.definition}
              />
            ) : (
              <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Wordle Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Today's puzzle data is being updated. Check back in a few hours or view recent answers below.
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-left">Recent Wordle Answers</h2>
            {displayWordles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </>
            ) : (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-600">No recent Wordle data available.</p>
                <p className="text-sm text-gray-500 mt-2">
                  The data collection system is being updated. Please check back later.
                </p>
              </div>
            )}
          </div>
          
          {/* Wordle Analysis Section - Only show if we have today's data */}
          {wordleToDisplay && (
            <div className="mt-12 w-full max-w-4xl mx-auto">
              <WordleAnalysis
                date={wordleToDisplay.date}
                answer={wordleToDisplay.answer}
                puzzleNumber={wordleToDisplay.puzzle_number}
                difficulty={wordleToDisplay.difficulty}
                hints={wordleToDisplay.hints}
              />
            </div>
          )}
          
          {/* How to Play Section - Always show */}
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <HowToPlayWordle />
          </div>
        </main>
      </div>
    </ClientBody>
  );
}