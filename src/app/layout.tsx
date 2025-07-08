import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Today's Wordle Answer & Hints - WordleAnswer.Today",
  description: "Get today's Wordle answer, hints, and solutions. Find daily Wordle answers, helpful hints, and access our complete archive of past Wordle solutions.",
  keywords: ["wordle answer", "wordle hint", "wordle today", "wordle solution", "daily wordle", "wordle help", "nyt wordle"],
  authors: [{ name: "WordleAnswer.Today" }],
  creator: "WordleAnswer.Today",
  publisher: "WordleAnswer.Today",
  openGraph: {
    title: "Today's Wordle Answer & Hints - WordleAnswer.Today",
    description: "Get today's Wordle answer, hints, and solutions. Find daily Wordle answers, helpful hints, and access our complete archive of past Wordle solutions.",
    url: "https://wordleanswer.today",
    siteName: "WordleAnswer.Today",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Today's Wordle Answer & Hints - WordleAnswer.Today",
    description: "Get today's Wordle answer, hints, and solutions. Find daily Wordle answers, helpful hints, and access our complete archive of past Wordle solutions.",
    site: "@WordleAnswerToday",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://wordleanswer.today",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://wordleanswer.today" />
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "WordleAnswer.Today",
              "url": "https://wordleanswer.today",
              "description": "Get today's Wordle answer, hints, and solutions. Find daily Wordle answers, helpful hints, and access our complete archive of past Wordle solutions.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://wordleanswer.today/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased bg-gradient-to-br from-blue-50 via-white to-slate-50 min-h-screen">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
