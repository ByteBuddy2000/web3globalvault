import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });

    const card = await Card.findById(params.id);
    if (!card) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Card.findByIdAndDelete(params.id);

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
  { params }: { params: { id: string } }
) {
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

    const card = await Card.findById(params.id);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    if (card.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { message: "Status field required" },
        { status: 400 }
      );
    }

    const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    card.status = status;
    card.updatedAt = new Date();
    await card.save();

    return NextResponse.json({
      message: `Card status updated to ${status}`,
      card: {
        _id: card._id,
        status: card.status,
        updatedAt: card.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH card error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}