import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

interface WithdrawBody {
  method?: string;
  amount?: number | string;
  bankName?: string;
  accountNumber?: string;
  coin?: string;
  network?: string;
  walletAddress?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub && !token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = token.sub ?? token.email;

    const body: WithdrawBody = await req.json().catch(() => ({} as WithdrawBody));
    const { method, amount, bankName, accountNumber, coin, network, walletAddress } = body;

    const parsedAmount = Number(amount);
    if (!method || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ message: "Invalid withdrawal request" }, { status: 400 });
    }

    if (method === "bank") {
      if (!bankName || !accountNumber) {
        return NextResponse.json({ message: "Bank details required" }, { status: 400 });
      }
    }
    if (method === "crypto") {
      if (!coin || !network || !walletAddress) {
        return NextResponse.json({ message: "Crypto details required" }, { status: 400 });
      }
    }

    const details =
      method === "bank"
        ? `Bank withdrawal: ${parsedAmount} to ${bankName} (${accountNumber})`
        : `Crypto withdrawal: ${parsedAmount} ${coin} on ${network} to ${walletAddress}`;

    const transaction = new Transaction({
      user: userId,
      type: "Withdraw",
      amount: parsedAmount,
      status: "Pending",
      reference: `WD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      details,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await transaction.save();

    return NextResponse.json({ message: "Withdrawal request created", transaction });
  } catch (err) {
    console.error("Withdraw API error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub && !token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = token.sub ?? token.email;

    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("Withdraw GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
