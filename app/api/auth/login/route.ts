import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Validate password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Generate JWT Token with username included
  const token = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      username: user.username 
    }, 
    process.env.JWT_SECRET!, 
    { expiresIn: "24h" }
  );

  // ✅ Use `Set-Cookie` header instead of `response.cookies.set()`
  const response = new NextResponse(
    JSON.stringify({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
      },
    }
  );
  return response;
}
