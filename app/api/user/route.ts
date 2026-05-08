import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email }).select("fullName email");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}