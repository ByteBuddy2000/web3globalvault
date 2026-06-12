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
      if (process.env.NEXTAUTH_URL) {
        nextAuthUrl = `https://${process.env.NEXTAUTH_URL}`;
      } else {
        nextAuthUrl = "http://localhost:3000";
      }
    }
    const resetLink = `${nextAuthUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;

    try {
      const { sendEmail } = await import("@/lib/mailer");
      await sendEmail({
        to: email,
        subject: "Web3GlobalVault Password Reset",
        text: `You requested a password reset. Click the link to reset your password: ${resetLink} \n\nIf you didn't request this, ignore this email.`,
        html: `
  <div style="background:#0b0f19;padding:40px 0;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#111827;border-radius:12px;overflow:hidden;border:1px solid #1f2937;">
      
      <!-- Header -->
      <div style="background:#0f172a;padding:20px;text-align:center;">
        <h1 style="color:#fbbf24;margin:0;font-size:20px;">
          Web3GlobalVault
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:30px;color:#e5e7eb;">
        <h2 style="margin-top:0;color:#ffffff;">Password Reset Request</h2>

        <p style="font-size:14px;line-height:1.6;color:#cbd5e1;">
          We received a request to reset your password. If this was you, click the button below to proceed.
        </p>

        <!-- Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetLink}"
            style="
              background:#fbbf24;
              color:#111827;
              padding:12px 24px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
              display:inline-block;
            ">
            Reset Password
          </a>
        </div>

        <p style="font-size:12px;color:#94a3b8;line-height:1.6;">
          This link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
        </p>

        <hr style="border:none;border-top:1px solid #1f2937;margin:20px 0;" />

        <p style="font-size:11px;color:#64748b;">
          Need help? Contact our support team anytime.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0f172a;padding:15px;text-align:center;">
        <p style="font-size:11px;color:#64748b;margin:0;">
          © ${new Date().getFullYear()} Web3GlobalVault. All rights reserved.
        </p>
      </div>
    </div>
  </div>
`
      });
      console.log(`[EMAIL] Password reset email sent to ${email}`);
    } catch (notifyError) {
      console.error("Failed to send reset email", notifyError);
      // continue and still return success message, to avoid exposing existence
    }

    // For development, log the token (remove in production)
    // console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

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
