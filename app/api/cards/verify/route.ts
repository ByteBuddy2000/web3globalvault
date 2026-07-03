import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { notifyCardApproved, notifyCardRejected } from "@/lib/notificationHelpers";

/**
 * GET /api/cards/verify
 * Admin gets list of pending card verifications
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = await User.findOne({ email: token.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    // Get cards awaiting payment verification (user submitted transaction hash)
    const pendingCards = await Card.find({
      requestStatus: "PAYMENT_RECEIVED",
      paymentVerificationStatus: "PENDING_APPROVAL",
    }).populate("user", "fullName email");

    return NextResponse.json({
      pendingCards: pendingCards.map(card => ({
        _id: card._id,
        user: {
          fullName: card.user?.fullName || "Unknown",
          email: card.user?.email || "Unknown",
        },
        tierLevel: card.tierLevel,
        paymentAmount: card.paymentAmount,
        transactionHash: card.transactionHash,
        usdtAddress: card.usdtAddress,
        requestStatus: card.requestStatus,
        transactionVerifiedAt: card.transactionVerifiedAt,
        cardNumber: card.cardNumber.slice(-4),
      })),
      total: pendingCards.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/cards/verify
 * Admin approves or rejects card payment verification
 * Body: { cardId, action: "APPROVE" | "REJECT", notes?: string }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = await User.findOne({ email: token.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    const { cardId, action, notes } = await req.json();

    if (!cardId || !action) {
      return NextResponse.json(
        { message: "Card ID and action required" },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { message: "Action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    // ❌ Prevent double processing
    if (card.requestStatus !== "PAYMENT_RECEIVED") {
      return NextResponse.json(
        {
          message: `Card already processed. Current status: ${card.requestStatus}`,
        },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      card.paymentVerificationStatus = "APPROVED";
      card.status = "ACTIVE"; // ✅ Card is now active and usable
      card.requestStatus = "ADMIN_APPROVED";
      card.verifiedBy = admin._id;
      card.verificationDate = new Date();
      card.verificationNotes = notes || "Payment verified and approved";
      
      // Archive any previous ACTIVE or BLOCKED cards from this user (bank-standard practice)
      const previousCards = await Card.find({
        user: card.user,
        _id: { $ne: card._id },
        status: { $in: ["ACTIVE", "BLOCKED"] },
      });

      for (const prevCard of previousCards) {
        prevCard.archived = true;
        prevCard.status = "ARCHIVED";
        prevCard.archivedAt = new Date();
        prevCard.archivedReason = "Replaced by new card";
        prevCard.replacedByCardId = card._id;
        await prevCard.save();
      }
      
      // Create notification for approval
      await notifyCardApproved(card.user, card.tierLevel, card.cardType, card._id);
    }

    if (action === "REJECT") {
      card.paymentVerificationStatus = "REJECTED";
      card.status = "INACTIVE"; // Card cannot be used
      card.requestStatus = "ADMIN_REJECTED";
      card.verifiedBy = admin._id;
      card.verificationDate = new Date();
      card.rejectionReason = notes || "Payment rejected";
      card.verificationNotes = notes || "Payment rejected by admin";
      
      // Create notification for rejection
      await notifyCardRejected(
        card.user,
        card.tierLevel,
        card.cardType,
        notes || "Payment verification failed",
        card._id
      );
    }

    card.updatedAt = new Date();
    await card.save();

    // Get user info for response
    const user = await User.findById(card.user);

    return NextResponse.json({
      message: `Card ${action.toLowerCase()}ed successfully`,
      card: {
        _id: card._id,
        userEmail: user?.email,
        status: card.status,
        requestStatus: card.requestStatus,
        paymentVerificationStatus: card.paymentVerificationStatus,
        verificationNotes: card.verificationNotes,
        rejectionReason: card.rejectionReason,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}