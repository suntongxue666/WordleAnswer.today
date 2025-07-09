import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClientBody from '@/app/ClientBody';

export default function PrivacyPolicyPage() {
  return (
    <ClientBody>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔒 Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: July 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📋 Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="font-medium">🔍 Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Device type and operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring websites and search terms</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📊 Google Analytics</h2>
              <p className="text-gray-700 leading-relaxed">
                We use Google Analytics to understand how visitors interact with our website. 
                This service collects anonymous usage data to help us improve our content and user experience. 
                You can opt out of Google Analytics by installing the 
                <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🍪 Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website uses cookies to enhance your browsing experience and analyze site traffic. 
                These cookies do not store personal information and are used solely for analytics and 
                site functionality. You can disable cookies in your browser settings.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">🔐 Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your information. However, 
                no method of transmission over the internet is 100% secure. We cannot guarantee 
                absolute security but strive to use commercially acceptable means to protect your data.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">👥 Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for 
                the privacy practices of these external sites. We encourage you to review the 
                privacy policies of any third-party services you visit.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">👶 Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website is not directed to children under 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected 
                such information, please contact us immediately.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📝 Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. Changes will be posted on 
                this page with an updated revision date. We encourage you to review this policy 
                periodically for any changes.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">📧 Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientBody>
  );
}