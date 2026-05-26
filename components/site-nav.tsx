"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/sign-out/actions";

const navItems = [
  {
    href: "/",
    label: "Dashboard"
  },
  {
    href: "/projects",
    label: "Projects"
  },
  {
    href: "/reports",
    label: "Reports"
  }
];

type SiteNavProps = {
  signedIn: boolean;
};

export function SiteNav({ signedIn }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="top-nav">
      <div className="nav-cluster">
        <Link className="brand-mark" href="/">
          Trackr
        </Link>

        <div className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              className={`nav-link ${
                isActiveRoute(item.href, pathname) ? "active" : ""
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="nav-actions">
        <Link className="nav-button nav-button-secondary" href="/projects/create">
          New Project
        </Link>
        <Link className="nav-button nav-button-primary" href="/reports/create">
          New Report
        </Link>
        {signedIn ? (
          <form action={signOutAction}>
            <button className="nav-button nav-button-secondary" type="submit">
              Sign Out
            </button>
          </form>
        ) : (
          <Link className="nav-button nav-button-secondary" href="/sign-in">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

function isActiveRoute(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}