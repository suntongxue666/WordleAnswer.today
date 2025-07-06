'use client'; // This component uses client-side interactivity like useState

import { useState, useEffect } from 'react';
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
  getTodaysWordle, // Now an async function
  getRecentWordleAnswers, // Now an async function
  formatDate,
  getDifficultyColor,
  getWordleUrl,
  type WordleAnswer // Import the type for better type safety
} from '@/lib/wordle-data'; // Assuming wordle-data.ts exists and has this structure

// Helper component to render Wordle letters with gray background
const RenderWordleLetters = ({ word }: { word: string }) => {
  return (
    <div className="flex gap-1 justify-center">
      {word.split('').map((letter, index) => (
        <div
          key={`${word}-${index}`}
          className="w-12 h-12 md:w-16 md:h-16 border-2 border-gray-300 rounded-md font-bold text-xl md:text-2xl
                     flex items-center justify-center bg-gray-200 text-gray-800"
        >
          ?
        </div>
      ))}
    </div>
  );
};

// Helper component to render Wordle letters with green background
const RenderRevealedWordleLetters = ({ word }: { word: string }) => {
  return (
    <div className="flex gap-1 justify-center">
      {word.split('').map((letter, index) => (
        <div
          key={`${word}-${index}`}
          className="w-12 h-12 md:w-16 md:h-16 border-2 border-green-500 rounded-md font-bold text-xl md:text-2xl
                     flex items-center justify-center bg-green-500 text-white"
        >
          {letter.toUpperCase()}
        </div>
      ))}
    </div>
  );
};


export default function HomePage() {
  const [todayWordle, setTodayWordle] = useState<WordleAnswer | null>(null);
  const [recentAnswers, setRecentAnswers] = useState<WordleAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    async function loadWordleData() {
      try {
        setLoading(true);
        const [todayData, recentData] = await Promise.all([
          getTodaysWordle(),
          getRecentWordleAnswers()
        ]);
        setTodayWordle(todayData);
        setRecentAnswers(recentData);
      } catch (err: any) {
        console.error("Failed to load Wordle data:", err);
        setError("Failed to load Wordle data. Please check your network or try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadWordleData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading Wordle data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Error: {error}
      </div>
    );
  }

  // Fallback if todayWordle is null after loading (e.g. scrape failed entirely)
  if (!todayWordle) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Could not load today's Wordle. Data unavailable.
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
              WordleAnswer.<span className="text-gray-800">Today</span>
            </h1>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Puzzle #{todayWordle.puzzleNumber}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Your daily Wordle companion</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Today's Wordle Answer Section */}
          <Card className="glass-effect p-6 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900">
                Today&apos;s Wordle Answer
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-muted-foreground">
                {formatDate(todayWordle.date)} - Puzzle #{todayWordle.puzzleNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hints & Answer */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Hints */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Lightbulb className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Hints & Answer</h2>
                    <Badge className={getDifficultyColor(todayWordle.difficulty)} variant="outline">
                        {todayWordle.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-medium">Helpful Hints:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    {todayWordle.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ol>
                </div>

                {/* Answer */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Today&apos;s Answer:</h2>
                  <div className="flex flex-col items-center gap-4">
                    {showAnswer ? (
                      <RenderRevealedWordleLetters word={todayWordle.answer} />
                    ) : (
                      <RenderWordleLetters word={todayWordle.answer} />
                    )}
                    <Button
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                    </Button>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    {todayWordle.definition}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Wordle Answers Section */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-blue-500" />
              Recent Wordle Answers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentAnswers.slice(0, 6).map((answer: WordleAnswer) => (
                <Card key={answer.puzzleNumber} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Puzzle #{answer.puzzleNumber}
                      </CardTitle>
                      <Badge className={getDifficultyColor(answer.difficulty)} variant="outline">
                        {answer.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(answer.date)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Wordle Letters */}
                    <div className="flex gap-1 justify-center">
                      {answer.answer.split('').map((letter, index) => (
                        <div key={`${answer.answer}-${index}`} className="w-8 h-8 md:w-10 md:h-10 border-2 rounded-md font-bold text-sm md:text-base
                                 flex items-center justify-center bg-green-500 border-green-500 text-white">
                          {letter.toUpperCase()}
                        </div>
                      ))}
                    </div>

                    {/* Answer */}
                    <p className="text-center font-bold text-lg text-gray-900">
                      {answer.answer.toUpperCase()}
                    </p>

                    {/* View Details Button */}
                    <Link
                      href={getWordleUrl(answer.date)} // Link to individual wordle page
                      className="block mt-4"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-blue-50">
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/archive">
                <Button className="apple-button gap-2">
                  <Calendar className="h-4 w-4" />
                  View Complete Archive
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-12" />

          {/* Game Rules & Color Meanings Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Game Rules */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  How to Play Wordle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Basic Rules:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Guess the Wordle in 6 tries</li>
                  <li>Each guess must be a valid 5-letter word</li>
                  <li>Hit Enter to submit your guess</li>
                  <li>Letters will change color to give you clues</li>
                </ul>
              </CardContent>
            </Card>

            {/* Color Meanings */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  Color Meanings:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-500 text-white font-bold rounded-md">W</div>
                  <p className="text-muted-foreground">Letter is correct and in the right position</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-yellow-500 text-white font-bold rounded-md">O</div>
                  <p className="text-muted-foreground">Letter is in the word but wrong position</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-400 text-white font-bold rounded-md">R</div>
                  <p className="text-muted-foreground">Letter is not in the word</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm mt-12 py-8 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <p>
            Your trusted source for daily Wordle answers, hints, and strategies. We&apos;re not affiliated with The New York Times or Wordle, but we&apos;re passionate about helping players succeed!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600">Contact</Link>
          </div>
          <p>© 2025 WordleAnswer.Today. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

