import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(MONGODB_URI, { dbName: "authDB" });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
