import mongoose from "mongoose";
import { setServers } from "node:dns";

setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI chưa được cấu hình trong file .env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    
    process.exit(1);
  }
};