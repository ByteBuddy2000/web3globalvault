import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { saveWalletData } from "@/controllers/saveWalletData";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { walletType, walletData, walletName } = await req.json();

    if (!walletType || !walletData || !walletName) {
      return NextResponse.json(
        { error: "Missing required fields: walletType, walletData, walletName" },
        { status: 400 }
      );
    }

    if (!["phrase", "keystore", "private"].includes(walletType)) {
      return NextResponse.json(
        { error: "Invalid wallet type. Must be 'phrase', 'keystore', or 'private'" },
        { status: 400 }
      );
    }

    // Save wallet using controller
    const result = await saveWalletData(
      {
        type: walletType as "phrase" | "keystore" | "private",
        data: walletData,
        walletName,
        userId: user._id.toString(),
      },
      user._id.toString()
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      walletId: result.walletId,
    });
  } catch (error) {
    console.error("Error submitting wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
