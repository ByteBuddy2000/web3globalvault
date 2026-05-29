import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import KYC from "@/models/Kyc";
import User from "@/models/User";

interface KYCSubmissionRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentImage: string; // Base64 or URL
  selfieImage: string; // Base64 or URL
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body: KYCSubmissionRequest = await req.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "documentType",
      "documentNumber",
      "documentImage",
      "selfieImage",
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof KYCSubmissionRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if user already has a pending KYC
    const existingKyc = await KYC.findOne({
      user: user._id,
      status: "pending",
    });

    if (existingKyc) {
      return NextResponse.json(
        { error: "You already have a pending KYC submission. Please wait for verification." },
        { status: 400 }
      );
    }

    // Create new KYC record
    const kyc = new KYC({
      user: user._id,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      dateOfBirth: new Date(body.dateOfBirth),
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zipCode: body.zipCode.trim(),
      country: body.country.trim(),
      documentType: body.documentType,
      documentNumber: body.documentNumber.trim(),
      documentImage: body.documentImage,
      selfieImage: body.selfieImage,
      status: "pending",
      submittedAt: new Date(),
    });

    await kyc.save();

    return NextResponse.json(
      {
        success: true,
        message: "KYC submitted successfully. Awaiting admin verification.",
        kyc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const kyc = await KYC.findOne({ user: user._id }).populate(
      "user",
      "email fullName"
    );

    if (!kyc) {
      return NextResponse.json(
        { success: true, data: null, message: "No KYC record found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: kyc,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching KYC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
