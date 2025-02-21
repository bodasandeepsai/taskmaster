import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { verifyToken } from "@/lib/auth";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : "http://localhost:3000",
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

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error("Invalid token"));
  }
  
  socket.data.user = decoded;
  next();
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

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

export default io;
