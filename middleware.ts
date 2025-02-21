import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export function middleware(request: NextRequest) {
    // Log all cookies to verify if the token is being read
    console.log("Cookies in Middleware:", request.cookies);

    const token = request.cookies.get("token");
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/register');

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log("Token found, allowing access.");
    return NextResponse.next(); // Proceed with the request if token is found
}

// Define which routes the middleware should run on
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/register'
    ]
};
