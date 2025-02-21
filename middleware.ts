import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    // Log all cookies to verify if the token is being read
    console.log("Cookies in Middleware:", req.cookies);

    const token = req.cookies.get("token");

    if (!token) {
        console.log("No token found, redirecting to login.");
        return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if no token is found
    }

    console.log("Token found, allowing access.");
    return NextResponse.next(); // Proceed with the request if token is found
}

// Define which routes the middleware should run on
export const config = {
    matcher: ["/dashboard/:path*"], // Apply middleware to dashboard and subroutes
};
