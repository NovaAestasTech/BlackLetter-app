import mongoose from "mongoose";
const Mongo_uri = process.env.Mongo_uri!;

if (!Mongo_uri) {
  throw new Error("Database connection interupted");
}

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}
async function connectToDatabase() {
  try {
    if (cached.conn) {
      return cached.conn;
    }
    if (!cached.conn) {
      cached.promise = mongoose.connect(Mongo_uri).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error("Unknown error occurred");
    }
  }
}

export default connectToDatabase;
