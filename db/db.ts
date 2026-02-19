import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("Database connection interrupted");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(MONGO_URI, {
          bufferCommands: false,
        })
        .catch((err) => {
          cached.promise = null;
          throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("URI being used:", MONGO_URI); // confirm the URI
    throw error; // re-throw so the API returns the real error
  }
}
export default connectToDatabase;
