import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const user = getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignee: user.userId },
            { createdBy: user.userId }
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
            { assignee: user.userId },
            { createdBy: user.userId }
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