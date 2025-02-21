import Task from "@/models/Task";  // Import Task model
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// Task Creation (POST /api/tasks)
export async function POST(req: Request) {
  try {
    // Connect to DB first
    await connectDB();

    // Get and verify token
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get request body
    const { title, description, assignee } = await req.json();

    // Validate required fields
    if (!title || !description || !assignee) {
      return NextResponse.json(
        { error: "Title, description, and assignee are required" },
        { status: 400 }
      );
    }

    // Create new task
    const task = new Task({
      title,
      description,
      assignee,
      createdBy: decoded.userId,
      status: "pending"
    });
    
    await task.save();

    // Populate assignee details
    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "username email")
      .populate("createdBy", "username email");

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: error.message || "Error creating task" },
      { status: 500 }
    );
  }
}

// Get All Tasks (GET /api/tasks)
export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find()
      .populate("assignee", "username email")
      .populate("createdBy", "username email");
    
    console.log("Fetched tasks:", tasks); // Debug log
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 });
  }
}

// Update Task (PATCH /api/tasks/:id)
export async function PATCH(req: Request) {
  try {
    await connectDB();

    // Get task ID from URL
    const taskId = req.url.split('/tasks/')[1];
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

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

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
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
