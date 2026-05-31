import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import KYC from "@/models/Kyc";
import User from "@/models/User";

interface KYCActionRequest {
  kycId: string;
  action: "approve" | "reject";
  remarks?: string;
  rejectionReason?: string;
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

    // Check if user is admin
    const admin = await User.findOne({ email: session.user.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total count
    const total = await KYC.countDocuments({ status });

    // Get KYCs with user info, excluding duplicate rejected records from same user
    // Get the most recent KYC per user for each status to avoid showing duplicates
    const kycRecords = await KYC.find({ status })
      .populate("user", "email fullName accountNumber")
      .populate("verifiedBy", "email fullName")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: kycRecords,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching KYCs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    // Check if user is admin
    const admin = await User.findOne({ email: session.user.email });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { kycId, action, remarks, rejectionReason }: KYCActionRequest = await req.json();

    if (!kycId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return NextResponse.json(
        { error: "KYC record not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      kyc.status = "verified";
      kyc.verifiedAt = new Date();
      kyc.verifiedBy = admin._id;
      kyc.remarks = remarks || "";

      // Update user's kycVerified status
      await User.findByIdAndUpdate(kyc.user, { kycVerified: true });

      // Clean up rejected and pending KYC records for this user
      await KYC.deleteMany({
        user: kyc.user,
        _id: { $ne: kyc._id },
        status: { $in: ["rejected", "pending"] },
      });
    } else if (action === "reject") {
      if (!rejectionReason?.trim()) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }
      kyc.status = "rejected";
      kyc.rejectionReason = rejectionReason;
      kyc.remarks = remarks || "";
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    await kyc.save();

    return NextResponse.json({
      success: true,
      message: `KYC ${action}ed successfully`,
      kyc,
    });
  } catch (error) {
    console.error("Error updating KYC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
