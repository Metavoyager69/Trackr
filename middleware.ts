import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join("; ")
};

const PUBLIC_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  let response = NextResponse.next();
  
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const hasSession = request.cookies.has("sitelog_session");
  
  // Protect all non-public routes
  if (!isPublicRoute && !hasSession && pathname !== "/") {
    response = NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Redirect authenticated users away from public auth routes
  if (isPublicRoute && hasSession) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirect root to dashboard or login
  if (pathname === "/") {
    if (hasSession) {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      response = NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Apply security headers
  for (const [header, value] of Object.entries(securityHeaders)) {
    response.headers.set(header, value);
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};
