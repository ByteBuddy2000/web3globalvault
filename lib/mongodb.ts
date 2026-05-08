import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in your .env file");

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global variable to persist the cache across hot reloads in development
let cached: Cached = (global as any).mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as any).mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;