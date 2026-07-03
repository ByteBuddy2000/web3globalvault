import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

/**
 * GET /api/cards/history/archived
 * Retrieve user's archived cards (history)
 */
export async function GET(req: NextRequest) {
  try {
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

    // Get archived cards for history
    const archivedCards = await Card.find({
      user: user._id,
      archived: true,
    })
      .populate("replacedByCardId", "tierLevel cardType status")
      .sort({ archivedAt: -1 });

    return NextResponse.json({
      archivedCards,
      totalArchived: archivedCards.length,
    });
  } catch (error) {
    console.error("Archived cards GET error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
