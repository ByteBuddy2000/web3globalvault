import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Asset from "@/models/Asset";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const searchParams = new URL(req.url).searchParams;
    const status = searchParams.get("status"); // Pending / Completed / Failed

    const filter: any = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Admin transactions error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { transactionId, status } = body;

    if (!transactionId || !["Pending", "Completed", "Approved", "Declined", "Failed"].includes(status)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // ── Handle withdrawal-specific logic ───────────────────────────────────
    if (transaction.type === "Withdraw") {
      const symbol = transaction.coin || "USD";
      const asset = await Asset.findOne({ user: transaction.user, symbol });

      if (status === "Declined") {
        // ── Revert balance when declining ──────────────────────────────────
        if (asset) {
          asset.quantity += transaction.amount; // Add back the withdrawn amount
          asset.pendingWithdrawal = Math.max(0, (asset.pendingWithdrawal || 0) - transaction.amount);
          await asset.save();
        }
      } else if (status === "Approved" || status === "Completed") {
        // ── Clear pending withdrawal when approving/completing ──────────────
        if (asset) {
          asset.pendingWithdrawal = Math.max(0, (asset.pendingWithdrawal || 0) - transaction.amount);
          await asset.save();
        }
      }
    }

    transaction.status = status;
    transaction.updatedAt = new Date();
    await transaction.save();

    return NextResponse.json({ message: "Transaction status updated", transaction });
  } catch (err) {
    console.error("Admin transactions PATCH error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
