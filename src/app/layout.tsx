import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Kanban Board - Free Online Task Management Tool",
    template: "%s | Kanban Board",
  },
  description:
    "Free online Kanban board for task management. Organize projects with drag-and-drop columns, track progress with real-time analytics, and boost your productivity. No sign-up required.",
  keywords: [
    "kanban board",
    "task management",
    "project management",
    "productivity tool",
    "free kanban",
    "drag and drop",
    "todo list",
    "agile board",
    "scrum board",
    "work management",
  ],
  authors: [{ name: "ShunyaPulse" }],
  creator: "ShunyaPulse",
  publisher: "ShunyaPulse",
  openGraph: {
    title: "Kanban Board - Free Online Task Management Tool",
    description:
      "Organize your projects with a beautiful drag-and-drop Kanban board. Track progress, manage WIP limits, and boost productivity — completely free.",
    type: "website",
    locale: "en_US",
    siteName: "Kanban Board",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanban Board - Free Online Task Management Tool",
    description:
      "Organize your projects with a beautiful drag-and-drop Kanban board. Completely free, no sign-up required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
        <footer className="shrink-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Kanban Board by ShunyaPulse. All rights reserved.</p>
            <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/" className="hover:text-slate-200 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-slate-200 transition-colors">About</Link>
              <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-slate-200 transition-colors">Contact</Link>
              <a href="https://github.com/ShunyaPulse/kanban-board" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">GitHub</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
