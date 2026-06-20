import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const wallets = await Wallet.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      wallets: wallets.map((wallet) => ({
        walletId: wallet._id.toString(),
        walletName: wallet.walletName,
        walletType: wallet.walletType,
        status: wallet.status,
        submittedAt: wallet.submittedAt,
        approvedAt: wallet.approvedAt || null,
        rejectedReason: wallet.rejectedReason || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching wallet status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}