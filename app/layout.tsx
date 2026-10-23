import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobApply Copilot",
  description: "AI-assisted job match & autofill command center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <header className="border-b bg-white border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                JobApply<span className="text-emerald-600">.copilot</span>
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link href="/" className="hover:text-emerald-600 transition">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-emerald-600 transition">
                My Profile
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}