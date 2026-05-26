import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FBIComplaint from "@/models/FBIComplaint";
import { sendEmail } from "@/lib/mailer";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@GlobalVaultbank.com";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, subject, message, contactEmail } =
      await request.json();

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const complaint = await FBIComplaint.create({
      fullName,
      email,
      subject,
      message,
      contactEmail: contactEmail || email,
      status: "new",
      createdAt: new Date(),
    });

    // Send confirmation to user
    try {
      await sendEmail({
        to: email,
        subject: `Complaint Received: ${subject}`,
        html: `
          <h2>Thank You for Your Report</h2>
          <p>Dear ${fullName},</p>
          <p>We have received your complaint and it has been assigned a reference number.</p>
          <p><strong>Reference Number:</strong> <code>${complaint._id}</code></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>Our team will review your complaint and respond as soon as possible.</p>
          <p>Thank you for helping us maintain a safe and secure platform.</p>
          <p>Best regards,<br>Global Vault Security Team</p>
        `,
      });
    } catch (emailError) {
      console.warn("Unable to send user confirmation:", emailError);
    }

    // Send notification to support
    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `New FBI Complaint: ${subject}`,
        html: `
          <h2>New FBI Complaint Report</h2>
          <p><strong>Reference ID:</strong> ${complaint._id}</p>
          <p><strong>Submitted by:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contact Email:</strong> ${contactEmail || email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <pre>${message}</pre>
          <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
        `,
      });
    } catch (emailError) {
      console.warn("Unable to send support notification:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your complaint has been submitted successfully",
        referenceId: complaint._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("FBI complaint submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const complaints = await FBIComplaint.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(
      {
        success: true,
        complaints,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FBI complaints retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
