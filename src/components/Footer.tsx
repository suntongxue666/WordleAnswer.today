'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">📖 About Wordle Answer Today</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your daily source for Wordle answers, hints, and puzzle analysis. We help Wordle enthusiasts 
              solve puzzles faster and improve their word game skills with comprehensive guides and strategies.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© 2025 WordleAnswer.today</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🔗 Quick Links</h3>
            <div className="space-y-2">
              <Link href="/archive" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                📚 Wordle Archive
              </Link>
              <Link href="/sitemap.xml" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                🗺️ Site Map
              </Link>
              <Link href="/privacy-policy" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                🔒 Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                📋 Terms of Service
              </Link>
              <Link href="/disclaimer" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                ⚠️ Disclaimer
              </Link>
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🎮 Official Wordle</h3>
            <div className="space-y-2">
              <a 
                href="https://www.nytimes.com/games/wordle/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>🎯 Play Official Wordle</span>
              </a>
              <a 
                href="https://www.nytimes.com/games"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>🗞️ NY Times Games</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            <p>
              ⚠️ WordleAnswer.today is an independent fan site and is not affiliated with 
              The New York Times or the official Wordle game.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Made with ❤️ for Wordle fans</span>
          </div>
        </div>
      </div>
    </footer>
  );
}