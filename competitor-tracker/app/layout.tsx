import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Competitor Tracker',
  description: 'Monitor competitor site changes with AI summaries',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  )
}
