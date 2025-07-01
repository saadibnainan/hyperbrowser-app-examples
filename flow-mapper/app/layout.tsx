import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowMapper | Zero-Auth Hyperbrowser Demo",
  description: "Generate interactive flow graphs and downloadable Playwright tests from any website using Hyperbrowser",
  keywords: "flowmapper, hyperbrowser, playwright, automation, testing, web scraping",
  authors: [{ name: "FlowMapper Team" }],
  openGraph: {
    title: "FlowMapper - Generate User Flow Tests",
    description: "Paste your Hyperbrowser API key and URL to generate interactive flow graphs and downloadable test files",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowMapper - Generate User Flow Tests",
    description: "Generate interactive flow graphs and downloadable Playwright tests from any website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
