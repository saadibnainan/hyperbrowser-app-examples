import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrape2API - Turn Any Website Into a REST API",
  description: "Turn any web page into a live REST endpoint in 60 seconds. Visual element selection, automatic code generation, and instant API deployment.",
  keywords: "API generation, web scraping, REST API, data extraction, Hyperbrowser",
  authors: [{ name: "Hyperbrowser" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
