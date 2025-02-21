import Task from "@/models/Task";  // Import Task model
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getTokenFromServer, verifyToken } from "@/lib/auth";

// Task Creation (POST /api/tasks)
export async function POST(req: Request) {
  try {
    // Connect to DB first
    await connectDB();

    // Get and verify token
    const token = await getTokenFromServer();
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const task = new Task({
      ...body,
      createdBy: decoded.userId
    });

    await task.save();
    await task.populate("assignee", "username email");

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// Get Tasks (GET /api/tasks)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const token = await getTokenFromServer();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const tasks = await Task.find({
      $or: [
        { assignee: decoded.userId },
        { createdBy: decoded.userId }
      ]
    }).populate("assignee", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// Update Task (PATCH /api/tasks)
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const token = await getTokenFromServer();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { taskId, status } = await req.json();

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
