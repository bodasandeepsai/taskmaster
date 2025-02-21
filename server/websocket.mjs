import { Server } from "socket.io";
import http from "http";
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-vercel-url.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("userConnected", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("createTask", (task) => {
    console.log("Task created:", task);
    io.emit("taskCreated", task);
  });

  socket.on("updateTask", (task) => {
    console.log("Task updated:", task);
    io.emit("taskUpdated", task);
  });

  socket.on("addComment", (data) => {
    io.emit("commentAdded", data);
  });

  socket.on("disconnect", () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

server.listen(4000, () => {
  console.log("WebSocket server running on port 4000");
}); 