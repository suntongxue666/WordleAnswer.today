import { NextResponse } from 'next/server';

export function GET() {
  const robots = `User-agent: *
Allow: /

# Sitemap location
Sitemap: https://wordleanswer.today/sitemap.xml

# Allow search engines to crawl all content
Allow: /wordle/
Allow: /puzzle/
Allow: /archive
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /disclaimer

# Block unnecessary crawling of API routes
Disallow: /api/
Disallow: /_next/
Disallow: /favicon.ico

# Crawl delay for good behavior
Crawl-delay: 1`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}