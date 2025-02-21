import { NextResponse } from "next/server";

export async function POST() {
  // Create response with cleared cookie
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear the token cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
} 