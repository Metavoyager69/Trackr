"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/logout/actions";

const navItems = [
  {
    href: "/dashboard",
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
  user: { fullName: string; organizationName: string; role: string } | null;
};

export function SiteNav({ user }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className="top-nav">
      <div className="nav-cluster">
        <Link className="brand-mark" href="/">
          {user ? user.organizationName : "Trackr"}
        </Link>

        {user && (
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
        )}
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            {user.role === "ADMIN" && (
              <Link className="nav-button nav-button-secondary" href="/projects/create">
                New Project
              </Link>
            )}
            <Link className="nav-button nav-button-primary" href="/reports/create">
              New Report
            </Link>
            <form action={signOutAction}>
              <button className="nav-button nav-button-secondary" type="submit">
                Sign Out ({user.fullName})
              </button>
            </form>
          </>
        ) : (
          <Link className="nav-button nav-button-secondary" href="/login">
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