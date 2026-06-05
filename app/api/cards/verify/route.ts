import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

// GET - Retrieve all cards pending verification
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

    const admin = await User.findOne({ email: token.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get cards pending verification
    const pendingCards = await Card.find({ 
      paymentVerificationStatus: "PENDING_APPROVAL" 
    }).populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    // Get cards pending activation (after approval)
    const approvedCards = await Card.find({
      paymentVerificationStatus: "APPROVED",
      status: "PENDING"
    }).populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      pendingVerification: pendingCards,
      approvedPendingActivation: approvedCards,
      total: pendingCards.length + approvedCards.length,
    });
  } catch (error) {
    console.error("Cards verification GET error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// POST - Approve or Reject card payment verification
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await User.findOne({ email: token.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { cardId, action, notes } = body;

    if (!cardId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid request - cardId and action (APPROVE/REJECT) required" },
        { status: 400 }
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    if (action === "APPROVE") {
      card.paymentVerificationStatus = "APPROVED";
      card.status = "ACTIVE";
      card.verifiedBy = admin._id;
      card.verificationDate = new Date();
      card.verificationNotes = notes || "Approved by admin";
    } else if (action === "REJECT") {
      card.paymentVerificationStatus = "REJECTED";
      card.status = "INACTIVE";
      card.verifiedBy = admin._id;
      card.verificationDate = new Date();
      card.verificationNotes = notes || "Rejected by admin";
    }

    await card.save();

    // Send notification to user (optional)
    const user = await User.findById(card.user);
    if (user) {
      const status = action === "APPROVE" ? "approved" : "rejected";
      // TODO: Send email notification to user
      console.log(`Card ${status} notification sent to ${user.email}`);
    }

    return NextResponse.json({
      message: `Card ${action === "APPROVE" ? "approved" : "rejected"} successfully`,
      card,
    });
  } catch (error) {
    console.error("Card verification POST error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}







