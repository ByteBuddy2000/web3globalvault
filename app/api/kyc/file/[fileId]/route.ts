import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import KYC from "@/models/Kyc";
import User from "@/models/User";
import { downloadFileFromGridFS } from "@/lib/gridfs";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const objectId = new mongoose.mongo.ObjectId(fileId);

    const kyc = await KYC.findOne({
      $or: [
        { user: user._id, documentImageId: objectId },
        { user: user._id, selfieImageId: objectId },
      ],
    });

    const isAdmin = user.role === "admin";

    if (!kyc && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const fileBuffer = await downloadFileFromGridFS(
      new mongoose.Types.ObjectId(fileId)
    );

    // Convert Node Buffer to Uint8Array/ArrayBuffer for NextResponse
    const body = new Uint8Array(fileBuffer);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(body.byteLength),
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