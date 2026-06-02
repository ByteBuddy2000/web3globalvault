import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";

import Transaction from "@/models/Transaction";

import Kyc from "@/models/Kyc";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const admin = await User.findOne({ email: session.user.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get total users
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // Get pending withdrawals count
    const pendingWithdrawals = await Transaction.countDocuments({
      type: "Withdrawal",
      status: "Pending",
    });

    // Get pending KYC count
    const pendingKYC = await Kyc.countDocuments({ status: "pending" });

    return NextResponse.json({
      success: true,
      totalUsers,
      pendingWithdrawals,
      pendingKYC,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
