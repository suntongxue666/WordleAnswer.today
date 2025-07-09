'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GameController2, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Trophy,
  Clock,
  Lightbulb
} from 'lucide-react';

export function HowToPlayWordle() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GameController2 className="h-5 w-5 text-green-600" />
          <CardTitle className="text-xl">How to Play Wordle Puzzle</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Rules */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold">Basic Rules</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Guess the 5-letter word in 6 attempts or fewer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Each guess must be a valid English word</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Only one puzzle per day - everyone gets the same word</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Letters will change color to show how close your guess was</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Color Guide */}
        <div className="space-y-3">
          <h3 className="font-semibold">Color Guide</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600 flex items-center justify-center text-white font-bold">W</div>
                <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600 flex items-center justify-center text-white font-bold">O</div>
                <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600 flex items-center justify-center text-white font-bold">R</div>
                <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600 flex items-center justify-center text-white font-bold">L</div>
                <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600 flex items-center justify-center text-white font-bold">D</div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm"><strong>Green:</strong> Letter is correct and in the right position</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600 flex items-center justify-center text-white font-bold">P</div>
                <div className="w-8 h-8 bg-gray-300 rounded border-2 border-gray-400 flex items-center justify-center text-gray-800 font-bold">L</div>
                <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600 flex items-center justify-center text-white font-bold">A</div>
                <div className="w-8 h-8 bg-gray-300 rounded border-2 border-gray-400 flex items-center justify-center text-gray-800 font-bold">N</div>
                <div className="w-8 h-8 bg-gray-300 rounded border-2 border-gray-400 flex items-center justify-center text-gray-800 font-bold">T</div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm"><strong>Yellow:</strong> Letter is in the word but wrong position</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600 flex items-center justify-center text-white font-bold">B</div>
                <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600 flex items-center justify-center text-white font-bold">R</div>
                <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600 flex items-center justify-center text-white font-bold">I</div>
                <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600 flex items-center justify-center text-white font-bold">C</div>
                <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-600 flex items-center justify-center text-white font-bold">K</div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm"><strong>Gray:</strong> Letter is not in the word</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Strategy Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold">Winning Strategies</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Starting Words</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Use words with common vowels (A, E, I, O)</li>
                <li>• Include frequent consonants (R, S, T, L, N)</li>
                <li>• Try: STARE, SLATE, AROSE, AUDIO</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Advanced Tips</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Avoid repeated letters in early guesses</li>
                <li>• Use process of elimination</li>
                <li>• Consider letter positioning patterns</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Scoring */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold">Scoring System</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">1/6</div>
                <div className="text-xs text-gray-600">Genius</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">2/6</div>
                <div className="text-xs text-gray-600">Magnificent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">3/6</div>
                <div className="text-xs text-gray-600">Impressive</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">4/6</div>
                <div className="text-xs text-gray-600">Splendid</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">5/6</div>
                <div className="text-xs text-gray-600">Great</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">6/6</div>
                <div className="text-xs text-gray-600">Phew!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Fun Facts</h4>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Wordle was created by Josh Wardle and became a viral sensation in 2022</li>
            <li>• The average player solves Wordle in 3.9 guesses</li>
            <li>• There are 2,315 possible answer words in the original Wordle</li>
            <li>• The hardest Wordle ever was puzzle #244: DODGE</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}