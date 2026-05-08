import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("Id") || undefined;
    // When using dynamic route, Next passes the id via pathname; parse fallback below
    let userId = id;
    if (!userId) {
      // attempt to extract from pathname: /api/admin/users/<id>
      const parts = new URL(req.url).pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "users");
      if (idx >= 0 && parts.length > idx + 1) userId = parts[idx + 1];
    }

    if (!userId) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const user = await User.findById(userId).select("fullName email accountNumber balance role accountStatus kycVerified profileImage address phone transactions").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // populate recent transactions using userId (not user._id which may be array)
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean();

    return NextResponse.json({ user, transactions });
  } catch (err) {
    console.error("Admin user detail GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Extract userId from pathname
    const parts = new URL(req.url).pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "users");
    if (idx < 0 || parts.length <= idx + 1) {
      return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }
    const userId = parts[idx + 1];

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return NextResponse.json({ message: "Cannot delete admin accounts" }, { status: 403 });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Optionally delete associated transactions
    await Transaction.deleteMany({ user: userId });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin user delete error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
