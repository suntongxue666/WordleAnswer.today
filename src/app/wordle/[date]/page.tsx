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

export default function WordleDetailPage({ params }: PageProps) {
  const [answerData, setAnswerData] = useState<WordleAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const { date } = params;

  useEffect(() => {
    async function loadSpecificWordleData() {
      try {
        setLoading(true);
        setError(null);
        const allRecentAnswersFromMock = [
          { date: '2025-01-04', puzzleNumber: 1495, answer: 'SLATE', hints: ['Starts with the letter S'], difficulty: 'Medium', definition: 'A rock' },
          { date: '2025-01-03', puzzleNumber: 1494, answer: 'CRANE', hints: ['Large bird'], difficulty: 'Easy', definition: 'A machine' },
          { date: '2025-01-02', puzzleNumber: 1493, answer: 'LIGHT', hints: ['Opposite of dark'], difficulty: 'Easy', definition: 'Visible agent' },
          { date: '2025-01-01', puzzleNumber: 1492, answer: 'DREAM', hints: ['Happens during sleep'], difficulty: 'Medium', definition: 'Thoughts during sleep' },
          { date: '2024-12-31', puzzleNumber: 1491, answer: 'PARTY', hints: ['Social gathering'], difficulty: 'Easy', definition: 'A social event' },
          { date: '2024-12-30', puzzleNumber: 1490, answer: 'QUIET', hints: ['Opposite of loud'], difficulty: 'Medium', definition: 'Making no noise' },
          { date: '2025-07-04', puzzleNumber: 1476, answer: 'CURVE', hints: ['Starts with C', 'Ends with E'], difficulty: 'Medium', definition: 'A line that deviates from being straight.'}
        ] as WordleAnswer[];

        const foundAnswer = allRecentAnswersFromMock.find(ans => ans.date === date);

        if (foundAnswer) {
          setAnswerData(foundAnswer);
        } else {
          const today = new Date();
          const todayFormatted = today.toISOString().slice(0, 10);
          
          if (date === todayFormatted) {
            const fetchedToday = await getTodaysWordle();
            setAnswerData(fetchedToday);
          } else {
            setError(`No data found for ${date}. Historical scraping requires a known puzzle number.`);
            notFound();
          }
        }
      } catch (err: any) {
        console.error("Failed to load Wordle detail data:", err);
        setError("Failed to load Wordle data for this date. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadSpecificWordleData();
  }, [date]);

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

  if (!answerData) {
    notFound();
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && answerData) {
      try {
        await navigator.share({
          title: `Wordle #${answerData.puzzleNumber} Answer`,
          text: `Check out the Wordle answer for ${formatDate(answerData.date)}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-blue-600">
                  Wordle #{answerData.puzzleNumber}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formatDate(answerData.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getDifficultyColor(answerData.difficulty)}>
                {answerData.difficulty}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto space-y-8">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Wordle #{answerData.puzzleNumber} - {formatDate(answerData.date)}
                </CardTitle>
                <Badge className={getDifficultyColor(answerData.difficulty)}>
                  {answerData.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Helpful Hints:</h3>
                <ul className="space-y-3">
                  {answerData.hints.map((hint, index) => (
                    <li key={`hint-${index}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-bold text-lg">{index + 1}.</span>
                      <span className="text-gray-700">{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <h3 className="font-semibold text-lg">Answer:</h3>
                  <Button
                    onClick={() => setAnswerRevealed(!answerRevealed)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {answerRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {answerRevealed ? 'Hide Answer' : 'Reveal Answer'}
                  </Button>
                </div>

                {RenderWordleLetters({ word: answerData.answer, revealed: answerRevealed })}

                {answerRevealed && (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-gray-900">{answerData.answer.toUpperCase()}</div>
                    <div className="bg-blue-50 p-6 rounded-lg max-w-2xl mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">Definition:</p>
                      <p className="font-medium text-gray-700">{answerData.definition}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Strategy Tips for This Word
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Best Starting Words:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      SLATE - Contains common letters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      CRANE - Good vowel and consonant mix
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      ADIEU - Maximizes vowel information
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Why This Word is {answerData.difficulty}:</h3>
                  <div className="text-sm text-muted-foreground">
                    {answerData.difficulty === 'Easy' && (
                      <p>This word uses common letters and follows typical English patterns, making it easier to guess.</p>
                    )}
                    {answerData.difficulty === 'Medium' && (
                      <p>This word has some uncommon letters or patterns that make it moderately challenging.</p>
                    )}
                    {answerData.difficulty === 'Hard' && (
                      <p>This word contains rare letters, unusual patterns, or is not commonly used in everyday speech.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button className="apple-button gap-2">
                <Calendar className="h-4 w-4" />
                Today's Wordle
              </Button>
            </Link>
            <Link href="/archive">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                View Archive
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
