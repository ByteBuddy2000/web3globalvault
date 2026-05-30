import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import KYC from "@/models/Kyc";
import User from "@/models/User";
import { downloadFileFromGridFS } from "@/lib/gridfs";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
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

    // Verify that the file belongs to the user's KYC submission (or user is admin)
    const kyc = await KYC.findOne({
      $or: [
        { user: user._id, documentImageId: new ObjectId(fileId) },
        { user: user._id, selfieImageId: new ObjectId(fileId) },
      ],
    });

    // Check if user is admin
    const isAdmin = user.role === "admin";

    if (!kyc && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Download file from GridFS
    const fileBuffer = await downloadFileFromGridFS(new ObjectId(fileId));

    // Determine content type
    let contentType = "application/octet-stream";
    if (fileId.includes("image")) {
      contentType = "image/jpeg"; // Default to JPEG, could be enhanced to detect type
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
