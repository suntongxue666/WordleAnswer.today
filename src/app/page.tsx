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
  calculatePuzzleNumber,
  type WordleAnswer
} from '@/lib/wordle-data';
import ClientBody from '@/app/ClientBody';
import { WordlePuzzle } from '@/components/WordlePuzzle';
import { RecentWordleCard } from '@/components/RecentWordleCard';
import { WordleAnalysis } from '@/components/WordleAnalysis';
import { HowToPlayWordle } from '@/components/HowToPlayWordle';
import { format, subDays, parseISO } from 'date-fns';
import { generateSEOMetadata } from '@/lib/seo-utils';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  // 使用服务器端安全的方式获取日期
  const now = Date.now();
  const todaysDate = new Date(now);
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
  // 使用服务器端安全的方式获取日期
  const now = Date.now();
  const todaysDate = new Date(now);
  const formattedTodaysDate = format(todaysDate, 'yyyy-MM-dd');
  const formattedYesterdayDate = format(subDays(todaysDate, 1), 'yyyy-MM-dd');

  const recentWordles = await getRecentWordles();

  // 获取最新可用的数据作为主要显示内容
  let wordleToDisplay: WordleAnswer | null = null;

  // 首先尝试今天的数据
  wordleToDisplay = await getTodaysWordle(formattedTodaysDate);

  // 如果没有今天的，尝试昨天的
  if (!wordleToDisplay) {
    console.log(`Today's Wordle (${formattedTodaysDate}) not found, trying yesterday's (${formattedYesterdayDate}).`);
    wordleToDisplay = await getTodaysWordle(formattedYesterdayDate);
  }

  // 如果今天和昨天都没有，使用最新的历史数据
  if (!wordleToDisplay && recentWordles.length > 0) {
    console.log(`No recent data found, using latest from history.`);
    wordleToDisplay = recentWordles[0];
  }

  // Recent Wordle Answers: 确保今天的数据显示在第一位
  const todaysWordle = await getTodaysWordle(formattedTodaysDate);
  const displayWordles = todaysWordle
    ? [todaysWordle, ...recentWordles.filter(w => w.date !== formattedTodaysDate)]
    : recentWordles;

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

          {/* Today's Wordle Answer Card */}
          <div className="mt-8 w-full max-w-lg md:max-w-4xl mx-auto">
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-700">
                  Today's Wordle Answer/Hint - Wordle {format(todaysDate, 'MMMM d')}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Get today's Wordle answer and hints instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href={`/wordle/${formattedTodaysDate}`} passHref>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    View Today's Answer & Hints
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Always show the latest available Wordle data */}
            {wordleToDisplay ? (
              <>
                {/* Date indicator if not today's data */}
                {wordleToDisplay.date !== formattedTodaysDate && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Showing latest available: {wordleToDisplay.date}
                        {wordleToDisplay.date === formattedYesterdayDate ? ' (Yesterday)' : ''}
                      </span>
                    </div>
                  </div>
                )}

                <WordlePuzzle
                  date={wordleToDisplay.date}
                  puzzleNumber={wordleToDisplay.puzzle_number}
                  answer={wordleToDisplay.answer}
                  hints={wordleToDisplay.hints}
                  difficulty={wordleToDisplay.difficulty}
                  definition={wordleToDisplay.definition}
                />
              </>
            ) : (
              <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Wordle Data Available</h3>
                  <p className="text-gray-600 mb-4">
                    We're working on collecting the latest puzzle data. Please check back later.
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-left mt-8">Recent Wordle Answers</h2>

            {displayWordles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Show 15 recent Wordle cards (3 rows x 5 columns) */}
                  {displayWordles
                    .slice(0, 15) // 显示最近的15个
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

          {/* Quick Links Section */}
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🔗 Quick Links</CardTitle>
                <CardDescription className="text-center">
                  Useful links and resources for Wordle enthusiasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/archive" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Archive</span>
                  </Link>
                  <Link href="/sitemap.xml" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <ExternalLink className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Sitemap</span>
                  </Link>
                  <a
                    href="https://www.nytimes.com/games/wordle/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm font-medium">Play Wordle</span>
                  </a>
                  <Link href="/privacy-policy" className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Info className="h-6 w-6 mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Privacy</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ClientBody>
  );
}