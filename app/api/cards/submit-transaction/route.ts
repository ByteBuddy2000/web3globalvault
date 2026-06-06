import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

/**
 * POST /api/cards/submit-transaction
 * User submits transaction hash for payment verification
 * Body: { cardId, transactionHash }
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

    const { cardId, transactionHash } = await req.json();

    if (!cardId || !transactionHash) {
      return NextResponse.json(
        { message: "Card ID and transaction hash required" },
        { status: 400 }
      );
    }

    // Validate transaction hash format (basic check)
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(transactionHash)) {
      return NextResponse.json(
        { message: "Invalid transaction hash format" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    // Verify card belongs to user
    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check card is awaiting payment
    if (card.requestStatus !== "PAYMENT_PENDING") {
      return NextResponse.json(
        {
          message: `Invalid card status. Expected PAYMENT_PENDING but got ${card.requestStatus}`,
        },
        { status: 400 }
      );
    }

    // Store transaction hash
    card.transactionHash = transactionHash;
    card.requestStatus = "PAYMENT_RECEIVED";
    card.paymentVerificationStatus = "PENDING_APPROVAL"; // Admin approval pending
    card.transactionHashVerified = true;
    card.transactionVerifiedAt = new Date();
    card.updatedAt = new Date();
    await card.save();

    return NextResponse.json({
      message: "Transaction hash received. Awaiting admin verification",
      card: {
        _id: card._id,
        requestStatus: card.requestStatus,
        paymentVerificationStatus: card.paymentVerificationStatus,
        transactionHash: card.transactionHash,
      },
    });
  } catch (error) {
    console.error("Submit transaction error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/cards/submit-transaction?cardId=xxx
 * Get transaction submission status for a card
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
      transactionStatus: {
        requestStatus: card.requestStatus,
        paymentVerificationStatus: card.paymentVerificationStatus,
        transactionHash: card.transactionHash || null,
        transactionHashVerified: card.transactionHashVerified,
        transactionVerifiedAt: card.transactionVerifiedAt,
        rejectionReason: card.rejectionReason || null,
      },
    });
  } catch (error) {
    console.error("Get transaction status error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
