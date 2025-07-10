'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  todayAnswer,
  recentAnswers,
  nytGames,
  formatDate,
  getWordleUrl,
  getDifficultyColor
} from '@/lib/wordle-data';
import {
  Eye,
  EyeOff,
  Calendar,
  Lightbulb,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Puzzle,
  Trophy,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const renderWordleLetters = (word: string, revealed = true) => {
    if (!revealed) {
      return (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`hidden-${index}`} className="wordle-letter wordle-letter-empty">
              ?
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-2 justify-center">
        {word.split('').map((letter, index) => (
          <div key={`${word}-${index}`} className="wordle-letter wordle-letter-correct">
            {letter}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon//Wordle%20logo.png"
                alt="Wordle Logo"
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
                  WordleAnswer.Today
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your daily Wordle companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                Puzzle #{todayAnswer.puzzleNumber}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">

        {/* Today's Answer Section */}
        <section className="text-center space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Today's Wordle Answer
            </h1>
            <p className="text-xl text-muted-foreground">
              {formatDate(todayAnswer.date)} - Puzzle #{todayAnswer.puzzleNumber}
            </p>
          </div>

          <Card className="max-w-2xl mx-auto glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Hints & Answer
                </CardTitle>
                <Badge className={getDifficultyColor(todayAnswer.difficulty)}>
                  {todayAnswer.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hints */}
              <div>
                <h3 className="font-semibold mb-3">Helpful Hints:</h3>
                <ul className="space-y-2">
                  {todayAnswer.hints.map((hint, index) => (
                    <li key={`hint-${index}`} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">{index + 1}.</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Answer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Today's Answer:</h3>
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

                {renderWordleLetters(todayAnswer.answer, answerRevealed)}

                {answerRevealed && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Definition:</p>
                    <p className="font-medium">{todayAnswer.definition}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Answers */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            Recent Wordle Answers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAnswers.map((answer) => (
              <Card key={answer.date} className="hover:shadow-lg transition-shadow">
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
                <CardContent>
                  <div className="space-y-3">
                    {renderWordleLetters(answer.answer)}
                    <p className="text-sm text-center font-medium">{answer.answer}</p>
                    <Link
                      href={getWordleUrl(answer.date)}
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
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
        </section>

        {/* Tabs Section */}
        <section>
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Game Rules</TabsTrigger>
              <TabsTrigger value="games">NYT Games</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Game Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    How to Play Wordle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Basic Rules:</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          Guess the Wordle in 6 tries
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          Each guess must be a valid 5-letter word
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          Hit enter to submit your guess
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          Letters will change color to give you clues
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Color Meanings:</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="wordle-letter wordle-letter-correct text-sm">W</div>
                          <span className="text-sm">Letter is correct and in the right position</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="wordle-letter wordle-letter-present text-sm">O</div>
                          <span className="text-sm">Letter is in the word but wrong position</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="wordle-letter wordle-letter-absent text-sm">R</div>
                          <span className="text-sm">Letter is not in the word</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NYT Games Tab */}
            <TabsContent value="games" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-blue-500" />
                    New York Times Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nytGames.map((game) => (
                      <Card key={game.name} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{game.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-semibold">{game.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {game.description}
                              </p>
                              <Badge variant="outline" className="text-xs mb-3">
                                {game.category}
                              </Badge>
                              <a
                                href={game.playUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <Button size="sm" variant="outline" className="w-full gap-2">
                                  <ExternalLink className="h-3 w-3" />
                                  Play Now
                                </Button>
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What time does the new Wordle come out?</AccordionTrigger>
                      <AccordionContent>
                        A new Wordle puzzle is released daily at midnight local time. The puzzle resets at 12:00 AM in your timezone.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Can I play previous Wordle puzzles?</AccordionTrigger>
                      <AccordionContent>
                        The official Wordle only allows you to play the current day's puzzle. However, you can find archives and variations online that let you play previous puzzles.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Are there any good starting words for Wordle?</AccordionTrigger>
                      <AccordionContent>
                        Popular starting words include SLATE, CRANE, ADIEU, and ARISE. These words contain common vowels and consonants that help narrow down possibilities quickly.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>How often do you update the answers?</AccordionTrigger>
                      <AccordionContent>
                        We update our website with the latest Wordle answer and hints every day shortly after the puzzle is released. Check back daily for the newest solution!
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    User Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Share Your Thoughts</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'd love to hear from you! Your feedback helps us improve our Wordle hints and website experience.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Suggestions</h4>
                          <p className="text-xs text-muted-foreground">
                            Share ideas for better hints
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Bug Reports</h4>
                          <p className="text-xs text-muted-foreground">
                            Let us know about issues
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">General</h4>
                          <p className="text-xs text-muted-foreground">
                            Any other feedback
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="text-center mt-4">
                      <Button className="apple-button">
                        Send Feedback
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg">WordleAnswer.Today</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Your trusted source for daily Wordle answers, hints, and strategies. We're not affiliated with The New York Times or Wordle, but we're passionate about helping players succeed!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-blue-600">Terms of Service</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 WordleAnswer.Today. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
