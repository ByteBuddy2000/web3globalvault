// app/api/transactions/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find all transactions for this user
    const userId = token.sub ?? token.email;
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transaction API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
