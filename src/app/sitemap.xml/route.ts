import { NextResponse } from 'next/server';
import { getAllWordlesForSitemap } from '@/lib/wordle-data';

export async function GET() {
  const baseUrl = 'https://wordleanswer.today';
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Get all Wordle data from database
  const allWordles = await getAllWordlesForSitemap();
  
  // Start building the sitemap URLs
  const urls: string[] = [];
  
  // Add main pages
  urls.push(`  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  
  urls.push(`  <url>
    <loc>${baseUrl}/archive</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  
  // Add all Wordle pages from database
  allWordles.forEach(wordle => {
    // Primary URL format (by date)
    urls.push(`  <url>
    <loc>${baseUrl}/wordle/${wordle.date}</loc>
    <lastmod>${wordle.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    
    // Puzzle number format
    urls.push(`  <url>
    <loc>${baseUrl}/puzzle/${wordle.puzzle_number}</loc>
    <lastmod>${wordle.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });
  
  // Add static pages
  urls.push(`  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`);
  
  urls.push(`  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`);
  
  urls.push(`  <url>
    <loc>${baseUrl}/disclaimer</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour to allow fresh updates
    },
  });
}