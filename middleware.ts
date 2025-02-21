import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Log all cookies to verify if the token is being read
    console.log("Cookies in Middleware:", request.cookies);

    const token = request.cookies.get("token");
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    // If there's no token and trying to access protected route
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If there's a token and trying to access auth pages (login/register)
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log("Token found, allowing access.");
    return NextResponse.next(); // Proceed with the request if token is found
}

// Update matcher to include all relevant paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
