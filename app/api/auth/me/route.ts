import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

const SECRET_KEY = process.env.JWT_SECRET!;

export async function GET(req: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verify(token, SECRET_KEY) as any;
        
        // Connect to DB and get user details
        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
}
