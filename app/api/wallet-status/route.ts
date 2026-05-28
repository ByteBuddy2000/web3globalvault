import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

interface WalletStatusResponse {
  status: "pending" | "approved" | "rejected" | null;
  walletName?: string | null;
  walletType?: string;
  walletId?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

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

    // Find the wallet for the user
    const wallet = await Wallet.findOne({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    if (!wallet) {
      const response: WalletStatusResponse = {
        status: null,
        walletName: null,
      };
      return NextResponse.json(response);
    }

    const response: WalletStatusResponse = {
      status: wallet.status,
      walletName: wallet.walletName,
      walletType: wallet.walletType,
      walletId: wallet._id.toString(),
      submittedAt: wallet.submittedAt.toISOString(),
      approvedAt: wallet.approvedAt?.toISOString(),
      rejectedReason: wallet.rejectedReason,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching wallet status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
