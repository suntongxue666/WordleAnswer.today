import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClientBody from '@/app/ClientBody';

export default function TermsOfServicePage() {
  return (
    <ClientBody>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">📋 Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: July 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">✅ Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using WordleAnswer.today, you accept and agree to be bound by these 
                Terms of Service. If you do not agree to these terms, please do not use our website.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🎯 Website Purpose</h2>
              <p className="text-gray-700 leading-relaxed">
                WordleAnswer.today provides Wordle puzzle answers, hints, analysis, and educational 
                content for entertainment and learning purposes. The website is designed to help 
                users improve their word puzzle skills and enjoy the Wordle experience.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">✨ Permitted Use</h2>
              <div className="space-y-2">
                <p className="text-gray-700">You may use this website to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>View Wordle answers and hints for personal use</li>
                  <li>Read our educational content and analysis</li>
                  <li>Share links to our content on social media</li>
                  <li>Learn strategies to improve your Wordle game</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🚫 Prohibited Activities</h2>
              <div className="space-y-2">
                <p className="text-gray-700">You may not:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Copy or redistribute our content without permission</li>
                  <li>Use automated systems to scrape our website</li>
                  <li>Attempt to interfere with website functionality</li>
                  <li>Use the website for any illegal or harmful purposes</li>
                  <li>Impersonate our website or claim affiliation with official Wordle</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📄 Content Accuracy</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to provide accurate information, we make no warranties about the 
                completeness, reliability, or accuracy of our content. Wordle answers and hints 
                are provided "as is" without any guarantees.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">⚖️ Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on this website, including text, graphics, and layout, is owned by 
                WordleAnswer.today or used with permission. Wordle is a trademark of The New York Times. 
                This website operates independently and is not affiliated with official Wordle.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🛡️ Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                WordleAnswer.today shall not be liable for any damages arising from your use of 
                this website, including but not limited to direct, indirect, incidental, or 
                consequential damages.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🔄 Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be posted 
                on this page with an updated revision date. Continued use of the website after 
                changes constitutes acceptance of the new terms.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📧 Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us through our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientBody>
  );
}