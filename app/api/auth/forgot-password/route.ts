import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

/**
 * POST /api/auth/forgot-password
 * Accepts email and generates a reset token with expiry.
 * In production, this would send an email to the user with a reset link.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiry to 1 hour from now
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    let nextAuthUrl = process.env.NEXTAUTH_URL;
    if (!nextAuthUrl) {
      if (process.env.VERCEL_URL) {
        nextAuthUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        nextAuthUrl = "http://localhost:3000";
      }
    }
    const resetLink = `${nextAuthUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;

    try {
      const { sendEmail } = await import("@/lib/mailer");
      await sendEmail({
        to: email,
        subject: "Genesis Bank Password Reset",
        text: `You requested a password reset. Click the link to reset your password: ${resetLink} \n\nIf you didn't request this, ignore this email.`,
        html: `
          <p>You requested a password reset for your Genesis Bank account.</p>
          <p><a href="${resetLink}" style="color:#fbbf24;">Click here to reset your password</a></p>
          <p>If this was not you, you can ignore this email.</p>
        `,
      });
      console.log(`[EMAIL] Password reset email sent to ${email}`);
    } catch (notifyError) {
      console.error("Failed to send reset email", notifyError);
      // continue and still return success message, to avoid exposing existence
    }

    // For development, log the token (remove in production)
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
