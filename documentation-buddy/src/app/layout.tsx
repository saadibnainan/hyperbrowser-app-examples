import type { Metadata } from "next";
import { Hubot_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const hubotSans = Hubot_Sans({
  variable: "--font-hubot-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Documentation Buddy",
  description: "Turn any documentation into an intelligent chatbot. Crawl documentation sites and chat with AI about the content using Hyperbrowser and OpenAI.",
  keywords: ["documentation", "AI", "chatbot", "hyperbrowser", "openai", "web scraping"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hubotSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
