import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const currentUser = getAuthUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users except sensitive information
    const users = await User.find({}, 'username email _id');

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 