import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear the token cookie
    cookieStore.delete('token');

    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          'Set-Cookie': `token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
        }
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 