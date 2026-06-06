import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

interface Params {
  id: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // ✅ Prevent BSON error
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await User.findById(id)
      .select(
        "fullName email accountNumber balance role accountStatus kycVerified profileImage address phone transactions"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const transactions = await Transaction.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ user, transactions });
  } catch (err) {
    console.error("Admin user detail GET error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Prevent self deletion
    if (token.sub === id) {
      return NextResponse.json(
        { message: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return NextResponse.json(
        { message: "Cannot delete admin accounts" },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);
    await Transaction.deleteMany({ user: id });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Admin user delete error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}