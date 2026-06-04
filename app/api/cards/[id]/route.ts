import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

// DELETE - Delete a card
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    // Verify card belongs to user
    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Unauthorized - Card does not belong to this user" },
        { status: 403 }
      );
    }

    // Delete the card
    await Card.findByIdAndDelete(id);

    // Remove card from user's cards array
    user.cards = user.cards.filter((c: any) => c.toString() !== id);
    await user.save();

    return NextResponse.json(
      {
        message: "Card deleted successfully",
        cardId: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Card DELETE error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update card status (block/unblock)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const card = await Card.findById(id);
    if (!card) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    // Verify card belongs to user
    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Unauthorized - Card does not belong to this user" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be one of: ACTIVE, INACTIVE, BLOCKED, PENDING" },
        { status: 400 }
      );
    }

    // Update card status
    card.status = status;
    await card.save();

    return NextResponse.json(
      {
        message: `Card ${status === "BLOCKED" ? "blocked" : "unblocked"} successfully`,
        card,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Card PATCH error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
