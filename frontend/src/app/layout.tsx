import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premier League Player Explorer",
  description:
    "Explore 100+ Premier League players extracted from Wikipedia using Python regex — a Theory of Computation course project.",
  keywords: [
    "Premier League",
    "football",
    "soccer",
    "web scraper",
    "regex",
    "theory of computation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
