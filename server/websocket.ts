import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "https://your-vercel-app-url.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB when server starts
connectDB().then(() => {
  console.log("MongoDB connected for WebSocket server");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("createTask", async (task) => {
    io.emit("taskCreated", task);
  });

  socket.on("updateTask", async (task) => {
    io.emit("taskUpdated", task);
  });

  socket.on("deleteTask", async (taskId) => {
    io.emit("taskDeleted", taskId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

export default io;
