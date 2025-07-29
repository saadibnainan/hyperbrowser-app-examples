import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Site-to-Dataset | Generate Q/A from docs",
  description: "Generate fine-tuning Q/A datasets from any documentation URL",
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
