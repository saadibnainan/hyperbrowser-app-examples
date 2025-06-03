import type { Metadata } from "next";
import { Hubot_Sans } from "next/font/google";
import "./globals.css";

const hubotSans = Hubot_Sans({
  variable: "--font-hubot-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podcast generator AI",
  description: "Generate podcast episodes with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hubotSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
