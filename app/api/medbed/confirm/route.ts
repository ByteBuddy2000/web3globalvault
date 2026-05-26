import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import MedbedRegistration from "@/models/MedbedRegistration";
import { sendEmail } from "@/lib/mailer";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@GlobalVaultbank.com";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationId, txHash } = await request.json();

    if (!registrationId || !txHash) {
      return NextResponse.json(
        { error: "Missing registrationId or txHash" },
        { status: 400 }
      );
    }

    await connectDB();

    const registration = await MedbedRegistration.findOne({ registrationId });
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Update registration with payment confirmation
    registration.txHash = txHash;
    registration.paymentStatus = "received";
    registration.status = "paid";
    registration.confirmedAt = new Date();
    await registration.save();

    // Notify support and user
    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `Medbed Payment Confirmed: ${registrationId}`,
        html: `
          <h2>Medbed Payment Confirmed</h2>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
          <p><strong>Name:</strong> ${registration.name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Amount XRP:</strong> ${registration.amountXrp}</p>
          <p><strong>Transaction Hash:</strong> ${txHash}</p>
          <p><strong>Status:</strong> Awaiting admin verification</p>
        `,
      });

      await sendEmail({
        to: registration.email,
        subject: `Payment Confirmed - Medbed Registration ${registrationId}`,
        html: `
          <h2>Payment Confirmed!</h2>
          <p>Dear ${registration.name},</p>
          <p>Your medbed registration payment has been received and confirmed.</p>
          <p><strong>Transaction Hash:</strong> <code>${txHash}</code></p>
          <p>Your registration is now pending admin verification. You will receive an email once it has been verified.</p>
          <p>Thank you for choosing our medbed service!</p>
        `,
      });
    } catch (emailError) {
      console.warn("Email notification failed:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment confirmed. Awaiting admin verification.",
        registrationId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Medbed confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
