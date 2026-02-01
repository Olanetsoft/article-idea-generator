import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Short URL domain
const SHORT_URL_DOMAIN = "aig.link";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Check if request is from the short URL domain (aig.link)
  if (host === SHORT_URL_DOMAIN || host === `www.${SHORT_URL_DOMAIN}`) {
    // Root path on aig.link -> redirect to main site tools page
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL("/tools/url-shortener", "https://articleideagenerator.com"),
      );
    }

    // Any other path on aig.link -> treat as short code
    // Rewrite to /r/[code] which handles the redirect with analytics
    const code = pathname.slice(1); // Remove leading slash
    if (code && !code.includes("/")) {
      return NextResponse.rewrite(new URL(`/r/${code}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
