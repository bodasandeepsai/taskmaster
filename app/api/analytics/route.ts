import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getTokenFromServer, verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    
    // Get and verify token
    const token = await getTokenFromServer();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignee: verified.userId },
            { createdBy: verified.userId }
          ]
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityAnalytics = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignee: verified.userId },
            { createdBy: verified.userId }
          ]
        }
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      statusCounts: analytics,
      priorityCounts: priorityAnalytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
} 