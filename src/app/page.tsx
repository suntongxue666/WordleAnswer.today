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
import { ClientBody } from '@/app/ClientBody'; // Fix: Change to default import

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

export default async function Home() {
  const wordleData = await getTodaysWordle();
  const recentAnswers = await getRecentWordleAnswers(6); // Fetch recent answers here

  return (
    <main className="flex flex-col items-center justify-between p-4 md:p-8">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* ... 其他头部内容，例如 Logo, NavLinks ... */}
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 lg:static lg:size-auto lg:bg-none">
        {/* ... Logo 或其他核心居中元素 ... */}
      </div>

      {/* 条件性显示今日Wordle内容 */}
      <div className="mb-8 w-full max-w-5xl"> {/* Use mb-8 to provide space from next section */}
        {wordleData ? (
          <ClientBody initialWordleData={wordleData} />
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              哎呀，今天的 Wordle 数据暂时无法获取。
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              请稍后再试，或者查看历史记录。
            </p>
          </div>
        )}
      </div>

      {/* 最近答案部分 (始终显示) */}
      <Separator className="my-12 w-full max-w-5xl" /> {/* Adjust width as needed */}
      <div className="w-full max-w-5xl text-center lg:text-left mb-32"> {/* Original mb-32 grid container */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          最近的 Wordle 答案
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentAnswers.slice(0, 6).map((answer: WordleAnswer) => (
            <Card key={answer.puzzle_number} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Puzzle #{answer.puzzle_number}
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

      {/* Game Rules & Color Meanings Section (始终显示) */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl"> {/* Adjust width as needed */}
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

      {/* Footer (移动到main标签内，确保单根元素) */}
      <footer className="bg-white/50 backdrop-blur-sm mt-12 py-8 border-t text-center text-sm text-muted-foreground w-full">
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
    </main>
  );
}

