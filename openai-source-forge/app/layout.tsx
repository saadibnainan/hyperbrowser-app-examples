import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAI SourceForge - Real-time Research with AI",
  description: "Drop in any question and get real-time answers with live source citations and developer-ready API samples. Powered by Hyperbrowser + GPT-4o.",
  keywords: "AI research, web scraping, API discovery, OpenAI, Hyperbrowser, citations",
  authors: [{ name: "OpenAI SourceForge" }],
  openGraph: {
    title: "OpenAI SourceForge",
    description: "Real-time web research with AI-powered answers and API discovery",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
