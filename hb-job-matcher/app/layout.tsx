import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Matcher - Hyperbrowser",
  description: "Extract skills from your portfolio and find matching jobs using Hyperbrowser AI. Professional job matching powered by cloud browser automation.",
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
