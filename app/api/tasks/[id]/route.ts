import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get request body
    const { status } = await req.json();

    // Validate status
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      { status },
      { 
        new: true,
        runValidators: true
      }
    ).populate("assignee", "username email");

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Error updating task" }, { status: 500 });
  }
} 