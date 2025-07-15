import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordle Answer Today",
  description: "Get today's Wordle answer, hints, and past puzzles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Sitemap for SEO */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MMGE1750H4" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MMGE1750H4');
          `}
        </Script>
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="64x64" href="https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon//Wodle%20Fav%20icon-64.png" />
        <link rel="shortcut icon" href="https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon//Wodle%20Fav%20icon-64.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
