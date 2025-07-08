'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  fetchWordleData,
  getTodaysWordle,
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
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ClientBody from '@/app/ClientBody';
import { WordlePuzzle } from '@/components/WordlePuzzle';

interface PageProps {
  params: { date: string };
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
  const { date } = params;
  const wordleData = await getTodaysWordle(date);

  if (!wordleData) {
  return (
      <ClientBody>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
              Wordle Answer Archive
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
          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
            Wordle Answer Archive
          </h1>
          <WordlePuzzle
            date={wordleData.date}
            puzzleNumber={wordleData.puzzle_number}
            answer={wordleData.answer}
            hints={wordleData.hints}
            difficulty={wordleData.difficulty}
            definition={wordleData.definition}
          />
      </main>
        </div>
    </ClientBody>
  );
}
