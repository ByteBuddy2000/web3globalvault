import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Asset from "@/models/Asset";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const assets = await Asset.find({ user: userId }).select("_id symbol name type quantity").lean();
    return NextResponse.json({ assets });
  } catch (err) {
    console.error("Admin assets GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
