import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";


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
      console.warn("Missing required fields:", { cardId: !!cardId, transactionHash: !!transactionHash });
      return NextResponse.json(
        { message: "Card ID and transaction hash required" },
        { status: 400 }
      );
    }

    // Validate and normalize transaction hash format
    let cleanHash = transactionHash.trim();
    console.log("Original hash:", transactionHash.substring(0, 10) + "...");
    
    // Add 0x prefix if missing
    if (!cleanHash.startsWith('0x')) {
      cleanHash = '0x' + cleanHash;
    }
    
    // Validate transaction hash format
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(cleanHash)) {
      console.warn("Invalid hash format:", { 
        input: cleanHash.substring(0, 20) + "...",
        length: cleanHash.length,
        startsWithOx: cleanHash.startsWith('0x')
      });
      return NextResponse.json(
        { message: "Invalid transaction hash format. Expected 0x followed by 64 hex characters" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      console.warn("Card not found:", cardId);
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    // Verify card belongs to user
    if (card.user.toString() !== user._id.toString()) {
      console.warn("Card does not belong to user");
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check card is awaiting payment
    if (card.requestStatus !== "PAYMENT_PENDING") {
      console.warn("Invalid card status:", card.requestStatus);
      return NextResponse.json(
        {
          message: `Invalid card status. Expected PAYMENT_PENDING but got ${card.requestStatus}`,
        },
        { status: 400 }
      );
    }

    // Store transaction hash - admin will verify on their end
    card.transactionHash = cleanHash;
    card.requestStatus = "PAYMENT_RECEIVED";
    card.paymentVerificationStatus = "PENDING_APPROVAL"; // Admin approval pending
    card.transactionVerifiedAt = new Date();
    card.updatedAt = new Date();
    await card.save();

    return NextResponse.json({
      message: "Transaction hash received. Commencing verification",
      card: {
        _id: card._id,
        requestStatus: card.requestStatus,
        paymentVerificationStatus: card.paymentVerificationStatus,
        transactionHash: card.transactionHash,
      },
    });
  } catch (error) {
    console.error("Submit transaction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ 
      message: "Server error", 
      error: errorMessage 
    }, { status: 500 });
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
