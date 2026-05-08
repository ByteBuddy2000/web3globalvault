import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import bcrypt from "bcrypt";

/**
 * POST /api/auth/reset-password
 * Accepts token and newPassword to reset user's password.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash the token to match stored value
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset fields
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully. Please log in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
