import { NextRequest, NextResponse } from "next/server";
import { getTokenFromServer, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromServer();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email || ''
      }
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
} 