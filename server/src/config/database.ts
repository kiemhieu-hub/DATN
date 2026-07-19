import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI chưa được cấu hình trong file .env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB Atlas connected successfully");
     console.log("Database:", mongoose.connection.db?.databaseName);

    const docs = await mongoose.connection.db!
      .collection("Bookings")
      .find({})
      .toArray();
      console.log("Số document:", docs.length);
    console.log(docs);
  } catch (error) {
    console.error("MongoDB connection error:", error);

    process.exit(1);
  }
};