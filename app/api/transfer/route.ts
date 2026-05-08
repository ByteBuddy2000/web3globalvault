import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Asset from "@/models/Asset"; // added
import mongoose from "mongoose";
import crypto from "crypto";

type ReqBody = {
  type?: string;
  amount?: number | string;
  accountNumber?: string; // recipient for local transfers
  note?: string;
  // other fields (crypto, international) may be ignored/extended later
};

async function makeReference() {
  return crypto.randomBytes(8).toString("hex");
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email: token.email }).populate({
      path: "transactions",
      options: { sort: { createdAt: -1 }, limit: 100 },
    });

    const transactions = (user?.transactions || []).map((t: any) =>
      typeof t.toObject === "function" ? t.toObject() : t
    );

    return NextResponse.json({ transactions });
  } catch (err: any) {
    console.error("Transactions GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body: ReqBody = await req.json().catch(() => ({} as ReqBody));
    const { type = "local", amount, accountNumber, note } = body;

    // only implementing local transfer here
    if (type !== "local") {
      return NextResponse.json({ message: "Only local transfers supported by this endpoint" }, { status: 400 });
    }

    const sendAmount = Number(amount);
    if (!accountNumber || isNaN(sendAmount) || sendAmount <= 0) {
      return NextResponse.json({ message: "Missing/invalid payload" }, { status: 400 });
    }

    // start mongoose transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const sender = await User.findOne({ email: token.email }).session(session);
      if (!sender) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "Sender not found" }, { status: 404 });
      }

      // --- NEW: check USDT asset instead of fiat balance ---
      const senderUsdt = await Asset.findOne({ user: sender._id, symbol: "USDT" }).session(session);
      if (!senderUsdt || (senderUsdt.quantity ?? 0) < sendAmount) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "Insufficient USDT balance" }, { status: 400 });
      }

      const recipient = await User.findOne({ accountNumber: String(accountNumber).trim() }).session(session);
      if (!recipient) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "Recipient not found" }, { status: 404 });
      }

      // Atomically deduct USDT from sender
      const updatedSenderUsdt = await Asset.findOneAndUpdate(
        { _id: senderUsdt._id, quantity: { $gte: sendAmount } },
        { $inc: { quantity: -sendAmount } },
        { new: true, session }
      );
      if (!updatedSenderUsdt) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "Insufficient USDT balance" }, { status: 400 });
      }

      // Credit USDT to recipient (create asset entry if not exist)
      let recipientUsdt = await Asset.findOne({ user: recipient._id, symbol: "USDT" }).session(session);
      if (recipientUsdt) {
        recipientUsdt = await Asset.findOneAndUpdate(
          { _id: recipientUsdt._id },
          { $inc: { quantity: sendAmount } },
          { new: true, session }
        );
      } else {
        recipientUsdt = new Asset({
          user: recipient._id,
          type: "Crypto",
          symbol: "USDT",
          name: "Tether",
          quantity: sendAmount,
        });
        await recipientUsdt.save({ session });
      }

      const reference = await makeReference();
      const now = new Date();

      // create transaction record for sender (Withdraw / USDT transfer)
      const txSender = new Transaction({
        user: sender._id,
        type: "Withdraw",
        amount: sendAmount,
        status: "Completed",
        reference,
        createdAt: now,
        updatedAt: now,
        details: `USDT transfer to ${recipient.fullName} (${recipient.accountNumber})${note ? ` — ${note}` : ""}`,
      });
      await txSender.save({ session });

      // create transaction record for recipient (Deposit / USDT received)
      const txRecipient = new Transaction({
        user: recipient._id,
        type: "Deposit",
        amount: sendAmount,
        status: "Completed",
        reference,
        createdAt: now,
        updatedAt: now,
        details: `USDT received from ${sender.fullName} (${sender.accountNumber})${note ? ` — ${note}` : ""}`,
      });
      await txRecipient.save({ session });

      // attach transactions to users (if arrays exist)
      try {
        sender.transactions = sender.transactions || [];
        recipient.transactions = recipient.transactions || [];
        sender.transactions.push(txSender._id);
        recipient.transactions.push(txRecipient._id);
        await sender.save({ session });
        await recipient.save({ session });
      } catch (e) {
        console.warn("Failed to push tx refs to user arrays:", e);
      }

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        message: "Transfer successful",
        reference,
        senderTx: txSender.toObject(),
        recipientTx: txRecipient.toObject(),
        senderUsdt: updatedSenderUsdt.toObject(),
        recipientUsdt: recipientUsdt.toObject(),
      });
    } catch (innerErr: any) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transactions POST inner error:", innerErr);
      return NextResponse.json({ message: "Transaction failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Transactions POST error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}