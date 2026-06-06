import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { cardNumber, amount } = await req.json();

    if (!cardNumber || !amount || amount <= 0) {
      return NextResponse.json(
        { status: "DECLINED", reason: "Invalid request" },
        { status: 400 }
      );
    }

    // 1. Find card
    const card = await Card.findOne({ cardNumber });

    if (!card) {
      return NextResponse.json({
        status: "DECLINED",
        reason: "Card not found",
      });
    }

    // 2. Status check
    if (card.status !== "ACTIVE") {
      return NextResponse.json({
        status: "DECLINED",
        reason: "Card not active",
      });
    }

    // 3. Balance check
    if (card.balance < amount) {
      return NextResponse.json({
        status: "DECLINED",
        reason: "Insufficient balance",
      });
    }

    // 4. Daily limit check
    if (card.dailySpent + amount > card.dailyLimit) {
      return NextResponse.json({
        status: "DECLINED",
        reason: "Daily limit exceeded",
      });
    }

    // 5. Monthly limit check
    if (card.monthlySpent + amount > card.monthlyLimit) {
      return NextResponse.json({
        status: "DECLINED",
        reason: "Monthly limit exceeded",
      });
    }

    // 6. Approve transaction (deduct instantly)
    card.balance -= amount;
    card.dailySpent += amount;
    card.monthlySpent += amount;
    card.updatedAt = new Date();

    await card.save();

    return NextResponse.json({
      status: "APPROVED",
      amount,
      remainingBalance: card.balance,
      cardId: card._id,
    });
  } catch (error) {
    console.error("Authorization error:", error);

    return NextResponse.json(
      {
        status: "DECLINED",
        reason: "Server error",
      },
      { status: 500 }
    );
  }
}