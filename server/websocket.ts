import { Server } from "socket.io";
import http from "http";
import Task from "@/models/Task";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
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
  console.log("User connected");

  socket.on("createTask", async (newTask) => {
    await connectDB();
    const task = await Task.create(newTask);
    io.emit("taskCreated", task); // Broadcast to all clients
  });

  socket.on("updateTask", async (updatedTask) => {
    await connectDB();
    const task = await Task.findByIdAndUpdate(updatedTask._id, updatedTask, { new: true });
    io.emit("taskUpdated", task); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("WebSocket server listening on port 4000");
});
