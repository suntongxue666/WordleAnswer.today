import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClientBody from '@/app/ClientBody';

export default function DisclaimerPage() {
  return (
    <ClientBody>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">⚠️ Wordle Puzzle Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🎯 Website Purpose</h2>
              <p className="text-gray-700 leading-relaxed">
                WordleAnswer.today is an independent fan website created to help Wordle enthusiasts 
                find daily answers, hints, and strategies. We provide educational content and analysis 
                to enhance your Wordle puzzle-solving experience.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📱 No Affiliation</h2>
              <p className="text-gray-700 leading-relaxed">
                This website is <strong>not affiliated with, endorsed by, or connected to</strong> The New York Times, 
                Josh Wardle (creator of Wordle), or any official Wordle game. We are an independent resource 
                created by and for Wordle fans.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🔍 Content Accuracy</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to provide accurate Wordle answers and hints, we cannot guarantee 100% accuracy. 
                Wordle answers may change, and our automated systems may occasionally contain errors. 
                Always verify with the official Wordle game for the most current information.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🎮 Fair Play</h2>
              <p className="text-gray-700 leading-relaxed">
                We encourage users to attempt solving Wordle puzzles independently before seeking answers. 
                This website is intended as a learning tool and backup resource, not as a replacement for 
                the genuine puzzle-solving experience.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">⚖️ Legal Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                All Wordle-related trademarks, game mechanics, and intellectual property belong to their 
                respective owners. This website operates under fair use principles for educational and 
                informational purposes only.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📧 Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have concerns about this disclaimer or believe any content infringes on your rights, 
                please contact us for prompt resolution.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientBody>
  );
}