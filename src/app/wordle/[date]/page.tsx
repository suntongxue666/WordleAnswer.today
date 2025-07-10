import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  fetchWordleData,
  getTodaysWordle,
  getRecentWordles,
  formatDate,
  getDifficultyColor,
  type WordleAnswer
} from '@/lib/wordle-data';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Calendar,
  Lightbulb,
  BookOpen,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClientBody from '@/app/ClientBody';
import { WordlePuzzle } from '@/components/WordlePuzzle';
import { WordleAnalysis } from '@/components/WordleAnalysis';
import { RecentWordleCard } from '@/components/RecentWordleCard';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { generateSEOMetadata } from '@/lib/seo-utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const wordleData = await getTodaysWordle(date);
  return generateSEOMetadata(wordleData);
}

const RenderWordleLetters = ({ word, revealed }: { word: string; revealed: boolean }) => {
    if (!revealed) {
      return (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 5 }).map((_, index) => (
          <div key={`hidden-${index}`} className="w-12 h-12 md:w-16 md:h-16 border-2 border-gray-300 rounded-md font-bold text-xl md:text-2xl flex items-center justify-center bg-gray-200 text-gray-800">
              ?
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-2 justify-center">
        {word.split('').map((letter, index) => (
        <div key={`${word}-${index}`} className="w-12 h-12 md:w-16 md:h-16 border-2 border-green-500 rounded-md font-bold text-xl md:text-2xl flex items-center justify-center bg-green-500 text-white">
          {letter.toUpperCase()}
          </div>
        ))}
      </div>
    );
  };

export default async function WordleDatePage({ params }: PageProps) {
  const { date } = await params;
  const wordleData = await getTodaysWordle(date);
  const recentWordles = await getRecentWordles(10);
  
  // Generate navigation dates
  const currentDate = parseISO(date);
  const previousDate = subDays(currentDate, 1);
  const nextDate = addDays(currentDate, 1);
  const today = new Date();
  
  // Format dates for navigation
  const formattedCurrentDate = format(currentDate, 'MMMM d');
  const formattedPreviousDate = format(previousDate, 'MMMM d');
  const formattedNextDate = format(nextDate, 'MMMM d');
  
  // Check if next date is in the future
  const isNextDateFuture = nextDate > today;

  if (!wordleData) {
  return (
      <ClientBody>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
              Wordle {formattedCurrentDate} Answer & Hint
                </h1>
            <p className="text-lg text-gray-700">
              Could not find Wordle data for {date}.
                </p>
          </main>
        </div>
      </ClientBody>
    );
  }

  return (
    <ClientBody>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          {/* Back to Homepage Button */}
          <div className="w-full max-w-4xl flex justify-start mb-6">
            <Link href="/" passHref>
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" /> Back to Homepage
              </Button>
            </Link>
          </div>
          
          {/* Navigation Bar */}
          <div className="w-full max-w-4xl flex justify-between items-center mb-6">
            <Link href={`/wordle/${format(previousDate, 'yyyy-MM-dd')}`} passHref>
              <Button variant="outline" className="flex items-center">
                <ChevronLeft className="mr-2 h-4 w-4" /> Wordle {formattedPreviousDate}
              </Button>
            </Link>
            
            {!isNextDateFuture && (
              <Link href={`/wordle/${format(nextDate, 'yyyy-MM-dd')}`} passHref>
                <Button variant="outline" className="flex items-center">
                  Wordle {formattedNextDate} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            
            {isNextDateFuture && (
              <Button variant="outline" disabled className="flex items-center opacity-50">
                Wordle {formattedNextDate} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
            Wordle {formattedCurrentDate} Answer & Hint
          </h1>
          
          <WordlePuzzle
            date={wordleData.date}
            puzzleNumber={wordleData.puzzle_number}
            answer={wordleData.answer}
            hints={wordleData.hints}
            difficulty={wordleData.difficulty}
            definition={wordleData.definition}
          />
          
          {/* Wordle Analysis Section */}
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <WordleAnalysis
              date={wordleData.date}
              answer={wordleData.answer}
              puzzleNumber={wordleData.puzzle_number}
              difficulty={wordleData.difficulty}
              hints={wordleData.hints}
            />
          </div>
          
          {/* Recent Wordle Answers Section */}
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-left">Recent Wordle Answers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWordles
                .filter(wordle => wordle.date !== date)
                .slice(0, 9)
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
          
        </main>
      </div>
    </ClientBody>
  );
}
