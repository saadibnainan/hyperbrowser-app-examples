import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assets Optimizer - Optimize Web Assets with AI",
  description: "Optimize images, CSS, and JavaScript assets on any website in seconds with AI-powered optimization",
  keywords: "asset optimization, web performance, image compression, AI optimization",
  authors: [{ name: "Hyperbrowser" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/hb.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/hb.svg',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
        <link rel="icon" href="/hb.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/hb.svg" />
      </head>
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
