import { NextRequest, NextResponse } from "next/server";
import { getTokenFromServer, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromServer();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
} 