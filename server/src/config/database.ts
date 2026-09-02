import mongoose from "mongoose";
import { setServers } from "node:dns";
import Payment from "../models/Payment";

setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI chưa được cấu hình trong file .env");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 20_000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    // syncIndexes có thể khóa/chậm MongoDB Atlas và không cần chạy mỗi lần
    // khởi động. Chỉ bật thủ công khi vừa thay đổi index trong model Payment.
    if (process.env.SYNC_DB_INDEXES === "true") {
      await Payment.syncIndexes();
    }

    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    
    process.exit(1);
  }
};
