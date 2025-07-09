'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WordleAnalysisProps {
  date: string;
  answer: string;
  puzzleNumber: number;
  difficulty: string | null;
  hints: { type: string; value: string }[];
}

export function WordleAnalysis({ date, answer, puzzleNumber, difficulty, hints }: WordleAnalysisProps) {
  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, 'MMMM d');

  // 生成AI分析内容
  const generateAnalysis = () => {
    const vowels = 'AEIOU';
    const vowelCount = answer.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
    const consonantCount = 5 - vowelCount;
    const hasDoubleLetters = /(.)\1/.test(answer.toUpperCase());
    const commonLetters = ['E', 'A', 'R', 'I', 'O', 'T', 'N', 'S'];
    const commonLetterCount = answer.split('').filter(letter => commonLetters.includes(letter.toUpperCase())).length;

    return {
      letterFrequency: `This word contains ${vowelCount} vowel${vowelCount !== 1 ? 's' : ''} and ${consonantCount} consonant${consonantCount !== 1 ? 's' : ''}. ${hasDoubleLetters ? 'It has repeated letters, which can make it trickier to solve.' : 'All letters are unique, making it easier to eliminate possibilities.'}`,
      commonLetters: `${commonLetterCount} out of 5 letters are among the most common in English (E, A, R, I, O, T, N, S). This ${commonLetterCount >= 3 ? 'high frequency makes it a relatively approachable word' : 'lower frequency might make it more challenging'}.`,
      strategy: answer.charAt(0).toUpperCase() === 'S' ? 'Starting with S makes this word accessible with common opening words like STARE or SLATE.' : 
                answer.charAt(0).toUpperCase() === 'A' ? 'The A at the beginning is helpful as it\'s a common vowel placement.' :
                'The starting letter might require some strategic thinking in your opening moves.',
      difficulty: difficulty === 'Easy' ? 'This puzzle is rated as Easy, making it perfect for beginners or a quick solve.' :
                 difficulty === 'Medium' ? 'This Medium-difficulty puzzle offers a balanced challenge for most players.' :
                 'This Hard puzzle will test your vocabulary and strategic thinking skills.'
    };
  };

  const analysis = generateAnalysis();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-xl">Wordle {formattedDate} Analysis</CardTitle>
          {difficulty && (
            <Badge variant={difficulty === 'Easy' ? 'default' : difficulty === 'Medium' ? 'secondary' : 'destructive'}>
              {difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Letter Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold">Letter Composition</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.letterFrequency}</p>
        </div>

        <Separator />

        {/* Frequency Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold">Frequency Analysis</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.commonLetters}</p>
        </div>

        <Separator />

        {/* Strategy Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold">Strategy Insight</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.strategy}</p>
        </div>

        <Separator />

        {/* Difficulty Assessment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold">Difficulty Assessment</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.difficulty}</p>
        </div>

        {/* Stats Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{answer.length}</div>
              <div className="text-gray-600">Letters</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{answer.split('').filter(letter => 'AEIOU'.includes(letter.toUpperCase())).length}</div>
              <div className="text-gray-600">Vowels</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{/(.)\1/.test(answer.toUpperCase()) ? 'Yes' : 'No'}</div>
              <div className="text-gray-600">Repeated</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">#{puzzleNumber}</div>
              <div className="text-gray-600">Puzzle</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}