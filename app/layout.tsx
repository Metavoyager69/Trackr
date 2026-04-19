import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Construction Daily Reports",
  description: "A minimal daily reporting system for construction teams."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container nav-row">
              <Link className="brand" href="/">
                BuildLog
              </Link>
              <nav className="nav-links" aria-label="Primary navigation">
                <Link href="/reports">Reports</Link>
                <Link href="/reports/create">Create Report</Link>
              </nav>
            </div>
          </header>
          <main className="container page-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
