import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { notifyCardBlocked, notifyCardCanceled } from "@/lib/notificationHelpers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const cardTier = card.tierLevel;
    const cardType = card.cardType;
    const cardId = card._id;
    const userId = card.user;

    await Card.findByIdAndDelete(id);

    // Create notification for card cancellation
    await notifyCardCanceled(userId, cardTier, cardType, cardId);

    return NextResponse.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/cards/[id]
 * Update card status (BLOCK, UNBLOCK, etc.)
 * Body: { status: "BLOCKED" | "ACTIVE" | "INACTIVE" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status` },
        { status: 400 }
      );
    }

    const previousStatus = card.status;
    card.status = status;
    card.updatedAt = new Date();
    
    // If blocking a card, archive it (following bank standards)
    if (status === "BLOCKED") {
      card.archived = true;
      card.archivedAt = new Date();
      card.archivedReason = "Card blocked by user";
    }
    
    await card.save();

    // Create notification for blocking
    if (status === "BLOCKED") {
      await notifyCardBlocked(card.user, card.tierLevel, card.cardType, card._id);
    }

    return NextResponse.json({
      message: `Card updated`,
      card,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}