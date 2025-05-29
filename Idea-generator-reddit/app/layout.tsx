import type { Metadata } from "next";
import { Hubot_Sans } from "next/font/google";
import "./globals.css";

const hubotSans = Hubot_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hubot-sans",
});

export const metadata: Metadata = {
  title: "Idea Generator AI",
  description: "This app uses Reddit to find pain-points and generate ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${hubotSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
