import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import KYC from "@/models/Kyc";
import User from "@/models/User";
import { uploadFileToGridFS, deleteFileFromGridFS } from "@/lib/gridfs";

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
  documentImage?: File; // File from FormData
  selfieImage?: File; // File from FormData
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

    // Parse FormData
    const formData = await req.formData();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const country = formData.get("country") as string;
    const documentType = formData.get("documentType") as string;
    const documentNumber = formData.get("documentNumber") as string;
    const documentImageFile = formData.get("documentImage") as File;
    const selfieImageFile = formData.get("selfieImage") as File;

    // Validate required fields
    const requiredFields = {
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      documentType,
      documentNumber,
      documentImage: documentImageFile,
      selfieImage: selfieImageFile,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate file types and sizes
    const validateFile = (file: File, maxSizeMB: number = 5) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`File must be an image. Got: ${file.type}`);
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }
    };

    validateFile(documentImageFile);
    validateFile(selfieImageFile);

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

    // Upload files to GridFS
    let documentImageId, selfieImageId;
    let documentImageFilename, selfieImageFilename;

    try {
      const documentBuffer = Buffer.from(await documentImageFile.arrayBuffer());
      documentImageFilename = documentImageFile.name;
      documentImageId = await uploadFileToGridFS(
        documentBuffer,
        `kyc_document_${user._id}_${Date.now()}`,
        {
          userId: user._id,
          type: "document_image",
          originalFilename: documentImageFilename,
        }
      );

      const selfieBuffer = Buffer.from(await selfieImageFile.arrayBuffer());
      selfieImageFilename = selfieImageFile.name;
      selfieImageId = await uploadFileToGridFS(
        selfieBuffer,
        `kyc_selfie_${user._id}_${Date.now()}`,
        {
          userId: user._id,
          type: "selfie_image",
          originalFilename: selfieImageFilename,
        }
      );
    } catch (fileError) {
      console.error("Error uploading files to GridFS:", fileError);
      // Clean up uploaded files if one fails
      if (documentImageId) {
        await deleteFileFromGridFS(documentImageId);
      }
      throw new Error("Failed to upload files");
    }

    // Create new KYC record
    const kyc = new KYC({
      user: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      documentImageId,
      documentImageFilename,
      selfieImageId,
      selfieImageFilename,
      status: "pending",
      submittedAt: new Date(),
    });

    await kyc.save();

    return NextResponse.json(
      {
        success: true,
        message: "KYC submitted successfully. Awaiting admin verification.",
        kyc: {
          id: kyc._id,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
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

    // Return KYC data without file IDs (for privacy)
    const responseData = {
      id: kyc._id,
      firstName: kyc.firstName,
      lastName: kyc.lastName,
      dateOfBirth: kyc.dateOfBirth,
      address: kyc.address,
      city: kyc.city,
      state: kyc.state,
      zipCode: kyc.zipCode,
      country: kyc.country,
      documentType: kyc.documentType,
      documentNumber: kyc.documentNumber,
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      verifiedAt: kyc.verifiedAt,
      rejectionReason: kyc.rejectionReason,
      remarks: kyc.remarks,
      // Include file info for display purposes only
      hasDocumentImage: !!kyc.documentImageId,
      hasSelfieImage: !!kyc.selfieImageId,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
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
