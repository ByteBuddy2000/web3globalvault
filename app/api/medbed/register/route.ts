import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import MedbedRegistration from "@/models/MedbedRegistration";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@web3globalvaultbank.com";
const RECEIVER_ADDRESS =
  process.env.NEXT_PUBLIC_XRP_RECEIVER_ADDRESS ||
  "rp5PMThCE9FtANy7ULtN4X43fNf7oXW6mt";
const DEFAULT_XRP_AMOUNT = Number(process.env.MEDBED_XRP_AMOUNT || "4500");

function generateRegistrationId() {
  return `MED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, address, color } = await request.json();

    if (!name || !phone || !email || !address || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const registrationId = generateRegistrationId();

    const registration = await MedbedRegistration.create({
      name,
      phone,
      email,
      address,
      color,
      registrationId,
      amountXrp: DEFAULT_XRP_AMOUNT,
      receiverAddress: RECEIVER_ADDRESS,
    });

    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `New Medbed Registration: ${registrationId}`,
        text: `New medbed registration received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nBed color: ${color}\nAmount XRP: ${DEFAULT_XRP_AMOUNT}\nReceiver address: ${RECEIVER_ADDRESS}\nRegistration ID: ${registrationId}`,
        html: `
          <h2>New Medbed Registration</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Bed color:</strong> ${color}</p>
          <p><strong>Amount XRP:</strong> ${DEFAULT_XRP_AMOUNT}</p>
          <p><strong>Receiver address:</strong> ${RECEIVER_ADDRESS}</p>
          <p><strong>Registration ID:</strong> ${registrationId}</p>
        `,
      });
    } catch (emailError) {
      console.warn("Unable to send medbed support notification:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        registrationId,
        amountXrp: DEFAULT_XRP_AMOUNT,
        receiverAddress: RECEIVER_ADDRESS,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Medbed registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
