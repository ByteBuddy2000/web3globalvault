import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import MedbedRegistration from "@/models/MedbedRegistration";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: token.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get pending medbed verifications
    const pendingRegistrations = await MedbedRegistration.find({
      verificationStatus: "pending",
      status: "paid",
    })
      .populate("userId", "fullName email")
      .sort({ confirmedAt: 1 });

    return NextResponse.json(
      {
        success: true,
        registrations: pendingRegistrations,
        count: pendingRegistrations.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Medbed verification list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: token.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { registrationId, action, notes } = await request.json();

    if (!registrationId || !action) {
      return NextResponse.json(
        { error: "Missing registrationId or action" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const registration = await MedbedRegistration.findOne({ registrationId });
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Update verification status
    registration.verificationStatus = action === "approve" ? "approved" : "rejected";
    registration.verificationNotes = notes || "";
    registration.verifiedBy = user._id;
    registration.verifiedAt = new Date();

    if (action === "approve") {
      registration.status = "verified";
    } else {
      registration.status = "rejected";
    }

    await registration.save();

    // Send notification email to user
    const emailSubject =
      action === "approve"
        ? `Medbed Registration Approved: ${registrationId}`
        : `Medbed Registration Rejected: ${registrationId}`;

    const emailText =
      action === "approve"
        ? `Medbed Registration Approved\n\nDear ${registration.name},\n\nYour medbed registration has been verified and approved by our admin team.\n\nRegistration ID: ${registrationId}\nBed Color: ${registration.color}\n\nYour medbed will be set up shortly. You will receive further instructions via email.\n\nThank you for choosing our medbed service!`
        : `Medbed Registration Status Update\n\nDear ${registration.name},\n\nYour medbed registration (ID: ${registrationId}) has been reviewed.\n\nStatus: Rejected\n${notes ? `Reason: ${notes}` : ""}\n\nPlease contact our support team for more information.`;

    const emailHtml =
      action === "approve"
        ? `
          <h2>Medbed Registration Approved! ✓</h2>
          <p>Dear ${registration.name},</p>
          <p>Your medbed registration has been verified and approved by our admin team.</p>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
          <p><strong>Bed Color:</strong> ${registration.color}</p>
          <p>Your medbed will be set up shortly. You will receive further instructions via email.</p>
          <p>Thank you for choosing our medbed service!</p>
        `
        : `
          <h2>Medbed Registration Status Update</h2>
          <p>Dear ${registration.name},</p>
          <p>Your medbed registration (ID: ${registrationId}) has been reviewed.</p>
          <p><strong>Status:</strong> Rejected</p>
          ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ""}
          <p>Please contact our support team for more information.</p>
        `;

    try {
      await sendEmail({
        to: registration.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
    } catch (emailError) {
      console.warn("Email notification failed:", emailError);
    }

    // Notify admin/support
    const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@GlobalVaultbank.com";
    try {
      const supportText = `Medbed Registration ${action === "approve" ? "Approved" : "Rejected"}\n\nRegistration ID: ${registrationId}\nName: ${registration.name}\nEmail: ${registration.email}\nAction: ${action === "approve" ? "APPROVED" : "REJECTED"}\nVerified By: ${user.fullName || user.email}\n${notes ? `Notes: ${notes}` : ""}`;
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `Medbed Registration ${action === "approve" ? "Approved" : "Rejected"}: ${registrationId}`,
        text: supportText,
        html: `
          <h2>Medbed Registration ${action === "approve" ? "Approved" : "Rejected"}</h2>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
          <p><strong>Name:</strong> ${registration.name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Action:</strong> ${action === "approve" ? "APPROVED" : "REJECTED"}</p>
          <p><strong>Verified By:</strong> ${user.fullName || user.email}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        `,
      });
    } catch (emailError) {
      console.warn("Support notification failed:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Registration ${action === "approve" ? "approved" : "rejected"} successfully`,
        registrationId,
        verificationStatus: registration.verificationStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Medbed verification update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
