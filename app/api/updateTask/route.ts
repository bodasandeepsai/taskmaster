import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getTokenFromServer, verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = await getTokenFromServer();
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, status } = await request.json();

    if (!["pending", "in-progress", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
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