'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { calculatePuzzleNumber } from '@/lib/wordle-data';

interface PuzzleProps {
  date: string; // YYYY-MM-DD
  puzzleNumber: number | null;
  answer: string;
  hints: { type: string; value: string }[];
  difficulty: string | null;
  definition: string | null;
}

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

export function WordlePuzzle({ date, puzzleNumber, answer, hints, difficulty, definition }: PuzzleProps) {
  const parsedDate = parseISO(date);
  const formattedDateForDisplay = format(parsedDate, 'PPP');
  const formattedDayOfWeek = format(parsedDate, 'EEEE');
  const formattedMonthDay = format(parsedDate, 'MMMM d'); // e.g., "July 8"
  
  // 计算期数，优先使用传入的puzzleNumber，否则自动计算
  const calculatedPuzzleNumber = puzzleNumber || calculatePuzzleNumber(date);

  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyColor = (diff: string | null) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'hard':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Today's Wordle Answer/Hint - Wordle {formattedMonthDay}</CardTitle>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 mb-1">
            Wordle Puzzle #{calculatedPuzzleNumber}
          </div>
          <CardDescription className="text-center">
            {formattedDayOfWeek}, {formattedDateForDisplay}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {difficulty && (
            <div className="flex justify-end mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(difficulty)}`}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
            </div>
        )}

        {hints && hints.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" /> Helpful Hints:
            </h3>
            <ul className="list-decimal list-inside text-left">
              {hints.map((hint, index) => (
                <li key={index} className="text-gray-700">
                  {hint.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Separator />
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold">Today's Answer:</h3>
          {showAnswer ? (
            <RenderRevealedWordleLetters word={answer} />
          ) : (
            <RenderWordleLetters word={answer} />
          )}
          <Button onClick={() => setShowAnswer(!showAnswer)} className="w-auto">
            <Eye className="mr-2 h-4 w-4" /> {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
          </Button>
        </div>
        {definition && showAnswer && (
          <p className="text-gray-600 text-left">
            <span className="font-semibold">Definition:</span> {definition}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 