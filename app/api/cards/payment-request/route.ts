import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

// Define USDT wallet addresses for each tier (you should configure these)
const TIER_PAYMENT_ADDRESSES: Record<string, { address: string; amount: number }> = {
  BASIC: { address: process.env.USDT_WALLET_BASIC || "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt", amount: 15 },
  SILVER: { address: process.env.USDT_WALLET_SILVER || "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt", amount: 20 },
  GOLD: { address: process.env.USDT_WALLET_GOLD || "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt", amount: 25 },
  PLATINUM: { address: process.env.USDT_WALLET_PLATINUM || "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt", amount: 30 },
};

/**
 * POST /api/cards/payment-request
 * Generate a payment request for a card application
 * User should send: { cardId }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { cardId } = await req.json();
    if (!cardId) {
      return NextResponse.json({ message: "Card ID required" }, { status: 400 });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    // Verify card belongs to user
    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check card is in DRAFT status
    if (card.requestStatus !== "DRAFT") {
      return NextResponse.json(
        { message: "Card request already submitted. Current status: " + card.requestStatus },
        { status: 400 }
      );
    }

    // Get payment details
    const tierConfig = TIER_PAYMENT_ADDRESSES[card.tierLevel] || TIER_PAYMENT_ADDRESSES.BASIC;

    // Update card with payment details
    card.usdtAddress = tierConfig.address;
    card.paymentAmount = tierConfig.amount;
    card.requestStatus = "PAYMENT_PENDING";
    card.updatedAt = new Date();
    await card.save();

    return NextResponse.json({
      message: "Payment request generated",
      paymentDetails: {
        cardId: card._id,
        tierLevel: card.tierLevel,
        paymentAddress: tierConfig.address,
        paymentAmount: tierConfig.amount,
        paymentCurrency: "USDT",
        cardNumber: card.cardNumber.slice(-4),
        requestStatus: card.requestStatus,
      },
    });
  } catch (error) {
    console.error("Payment request error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/cards/payment-request?cardId=xxx
 * Get payment request details for a card
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json({ message: "Card ID required" }, { status: 400 });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      paymentDetails: {
        cardId: card._id,
        tierLevel: card.tierLevel,
        paymentAddress: card.usdtAddress,
        paymentAmount: card.paymentAmount,
        paymentCurrency: card.paymentCurrency,
        transactionHash: card.transactionHash || null,
        requestStatus: card.requestStatus,
        transactionHashVerified: card.transactionHashVerified,
      },
    });
  } catch (error) {
    console.error("Get payment request error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
