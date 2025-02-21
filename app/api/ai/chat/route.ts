import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTokenFromServer, verifyToken } from "@/lib/auth";
import Task from "@/models/Task";
import { connectDB } from "@/lib/db";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a comprehensive task management AI assistant. Your role is to:
- Suggest practical and actionable tasks
- Provide clear task descriptions and steps
- Include estimated time and complexity
- Consider task dependencies and priorities
- Adapt suggestions based on the user's request

When suggesting tasks:
1. Analyze the user's request carefully
2. Consider the task domain (frontend, backend, design, etc.)
3. Provide relevant technical details
4. Include implementation tips
5. Consider best practices

Format your response as:
Task 1: [Task Name] (~X hours)
• Description: Brief overview
• Key Steps: Main implementation points
• Priority: High/Medium/Low`;

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message } = await req.json();
    
    // Get and verify token
    const token = await getTokenFromServer();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current tasks for context
    const currentTasks = await Task.find({
      $or: [
        { assignee: verified.userId },
        { createdBy: verified.userId }
      ]
    }).select('title status priority').limit(5);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
${SYSTEM_PROMPT}

Current Context:
User's Request: "${message}"
Active Tasks: ${currentTasks.map(t => `${t.title} (${t.status})`).join(', ')}

Please provide 3 relevant task suggestions based on the user's specific request.
Consider the current context and provide appropriate recommendations.
Ensure the tasks are specific to the requested domain or type.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Format response
    text = text.trim();
    if (text.length > 500) {
      text = text.substring(0, 500) + "\n\nNeed more specific details? Just ask!";
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { response: "I apologize, but I'm having trouble processing your request at the moment. Please try again in a few seconds." },
      { status: 200 }
    );
  }
} 