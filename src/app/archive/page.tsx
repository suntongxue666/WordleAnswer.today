import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getRecentWordleAnswers,
  getTodaysWordle,
  getRecentWordles,
  formatDate,
  getWordleUrl,
  getDifficultyColor,
  type WordleAnswer
} from '@/lib/wordle-data';
import {
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { generateSEOMetadata } from '@/lib/seo-utils';
import type { Metadata } from 'next';

// Generate SEO metadata for archive page
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Complete Wordle Answer Archive - All Past Wordle Solutions & Hints',
    description: 'Browse the complete archive of Wordle answers, hints, and solutions from past puzzles. Perfect for practice, checking missed days, or studying Wordle patterns. Updated daily with new answers.',
    keywords: 'wordle archive, wordle answers, wordle solutions, past wordle puzzles, wordle hints, wordle history, wordle practice, wordle all answers, wordle complete list',
    openGraph: {
      title: 'Complete Wordle Answer Archive - All Past Solutions',
      description: 'Browse all past Wordle answers, hints, and solutions. Perfect for practicing or checking previous puzzles you might have missed.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Wordle Answer Today'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Complete Wordle Answer Archive - All Past Solutions',
      description: 'Browse all past Wordle answers, hints, and solutions. Perfect for practicing or checking previous puzzles.'
    },
    alternates: {
      canonical: 'https://wordleanswer.today/archive'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    }
  };
}

export default async function ArchivePage() {
  // Fetch all wordle data server-side
  const allAnswers = await getRecentWordles(100); // Get more answers for archive
  
  const renderWordleLetters = (word: string) => {
    return (
      <div className="flex gap-1 justify-center">
        {word.split('').map((letter, index) => (
          <div key={`${word}-${index}`} className="w-8 h-8 md:w-10 md:h-10 border-2 rounded-md font-bold text-sm md:text-base
                   flex items-center justify-center bg-green-500 border-green-500 text-white">
            {letter}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
                  Wordle Archive
                </h1>
                <p className="text-sm text-muted-foreground">
                  Complete collection of Wordle answers
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Complete Wordle Answer Archive
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse all past Wordle answers, hints, and solutions. Perfect for practicing or checking previous puzzles you might have missed.
            </p>
          </div>

          {/* Results Count */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Showing {allAnswers.length} Wordle answers
            </p>
          </div>

          {/* Archive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAnswers.map((answer) => (
              <Card key={answer.date} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Wordle Puzzle #{answer.puzzle_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Wordle {new Date(answer.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {answer.difficulty && (
                      <Badge className={getDifficultyColor(answer.difficulty)} variant="outline">
                        {answer.difficulty}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wordle Letters */}
                  {renderWordleLetters(answer.answer)}

                  {/* Answer */}
                  <p className="text-center font-bold text-lg text-gray-900">
                    {answer.answer}
                  </p>

                  {/* Definition Preview */}
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {answer.definition}
                  </p>

                  {/* Hints Preview */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Quick Hints:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {answer.hints.slice(0, 2).map((hint, index) => (
                        <li key={`preview-hint-${index}`} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span className="line-clamp-1">{typeof hint === 'string' ? hint : hint.value}</span>
                        </li>
                      ))}
                      {answer.hints.length > 2 && (
                        <li className="text-blue-500 font-medium">+{answer.hints.length - 2} more hints</li>
                      )}
                    </ul>
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={getWordleUrl(answer.date)}
                    className="block mt-4"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-blue-50">
                      <ExternalLink className="h-4 w-4" />
                      View Full Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results Message */}
          {allAnswers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Archive loading...</h3>
              <p className="text-muted-foreground">
                Wordle answers are being loaded
              </p>
            </div>
          )}

          {/* SEO Content */}
          <section className="space-y-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle>About Our Wordle Archive</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Complete Historical Record</h3>
                    <p className="text-muted-foreground">
                      Our archive contains every Wordle answer since the game's inception. Each entry includes
                      the original puzzle number, date, answer, helpful hints, and detailed explanations to help
                      you understand the solution.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Perfect for Practice</h3>
                    <p className="text-muted-foreground">
                      Use our archive to practice with previous puzzles, study patterns in Wordle answers,
                      or simply catch up on any days you might have missed. Each answer includes strategic
                      tips and difficulty ratings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Navigation */}
          <div className="text-center">
            <Link href="/">
              <Button className="apple-button gap-2">
                <Calendar className="h-4 w-4" />
                Back to Today's Wordle
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
