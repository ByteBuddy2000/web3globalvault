import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// Admin endpoints: GET -> list users (supports search + pagination), POST -> top-up balance (creates Transaction), DELETE -> remove user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(200, Math.max(10, Number(url.searchParams.get("limit") || 20)));

    const filter: any = {};
    if (q) {
      const regex = new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { accountNumber: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("fullName email accountNumber balance role accountStatus kycVerified profileImage")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ users, meta: { total, page, limit } });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId, assetId, amount } = await req.json();
    if (!userId || !assetId || typeof amount !== "number") {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: "Amount must be a positive number" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Import Asset model dynamically
    const Asset = require("@/models/Asset").default;
    const asset = await Asset.findById(assetId);
    if (!asset) return NextResponse.json({ message: "Asset not found" }, { status: 404 });

    // Create a transaction record for audit (Deposit)
    const reference = `GlobalVault-credit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tx = new Transaction({
      user: user._id,
      type: "Deposit",
      amount,
      status: "Completed",
      reference,
      details: `Received ${asset.symbol || asset.name}`,
    });
    await tx.save();

    // Increment asset quantity
    asset.quantity = (asset.quantity || 0) + amount;
    await asset.save();

    // Push transaction ref to user
    user.transactions = user.transactions || [];
    user.transactions.push(tx._id);
    await user.save();

    return NextResponse.json({
      message: `Topped up ${amount} ${asset.symbol} for user`,
      asset: { id: asset._id, symbol: asset.symbol, quantity: asset.quantity },
      txId: tx._id,
    });
  } catch (err) {
    console.error("Admin users POST error:", err);
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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await user.remove();
    return NextResponse.json({ message: "User removed" });
  } catch (err) {
    console.error("Admin users DELETE error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
