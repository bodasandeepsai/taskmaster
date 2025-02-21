import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

let isConnected = false;

export const connectDB = async () => {
  try {
    if (isConnected) {
      return;
    }

    const db = await mongoose.connect(MONGODB_URI);
    isConnected = !!db.connections[0].readyState;
    
    // Ensure models are registered after connection
    require("@/models/User");
    require("@/models/Task");
    
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
