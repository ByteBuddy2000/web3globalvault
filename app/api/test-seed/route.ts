import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Test endpoint to create a test user for development
 * Creates user: test@example.com / password123
 * DELETE THIS IN PRODUCTION
 */
export async function POST() {
  try {
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "Test user already exists",
          email: "test@example.com",
          password: "password123",
        },
        { status: 200 }
      );
    }

    // Create test user
    const passwordHash = await bcrypt.hash("password123", 12);
    const testUser = await User.create({
      fullName: "Test User",
      email: "test@example.com",
      passwordHash,
      accountNumber: "1234567890",
      phone: "555-0000",
      address: "123 Test Street",
      role: "user",
    });

    console.log("[Seed] Test user created:", testUser.email);

    return NextResponse.json(
      {
        message: "Test user created successfully",
        email: "test@example.com",
        password: "password123",
        userId: testUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Seed] Error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to show test credentials
 */
export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to create a test user",
    testCredentials: {
      email: "test@example.com",
      password: "password123",
    },
    note: "Delete this endpoint in production",
  });
}
