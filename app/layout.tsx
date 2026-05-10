import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trackr",
  description: "Industrial-style construction reporting dashboard."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="dark" lang="en">
      <body>
        <div className="site-shell">
          <SiteNav />
          <main className="page-shell">{children}</main>
          <footer className="site-footer">
            <div className="site-footer-row">
              <div className="footer-copy">
                <span>Precision Industrialism</span>
                <span>Reporting Layer Active</span>
              </div>
              <div className="footer-links">
                <Link href="/">Dashboard</Link>
                <Link href="/projects">Projects</Link>
                <Link href="/reports">Reports</Link>
                <Link href="/projects/create">Create Project</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
