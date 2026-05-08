import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import * as bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email: token.email }).select("fullName email accountNumber phone address").lean() as any;
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ 
      fullName: user.fullName, 
      email: user.email, 
      accountNumber: user.accountNumber,
      phone: user.phone,
      address: user.address
    });
  } catch (err: any) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { fullName, email, phone, address, currentPassword, newPassword } = body;

    const user = await User.findOne({ email: token.email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // update fullName
    if (typeof fullName === "string" && fullName.trim() !== "" && fullName !== user.fullName) {
      user.fullName = fullName.trim();
    }

    // update phone
    if (typeof phone === "string" && phone !== user.phone) {
      user.phone = phone.trim();
    }

    // update address
    if (typeof address === "string" && address !== user.address) {
      user.address = address.trim();
    }

    // update email (ensure not used by another account)
    if (typeof email === "string" && email.trim() !== "" && email !== user.email) {
      const exists = await User.findOne({ email: email.trim() });
      if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 400 });
      user.email = email.trim();
    }

    // update password: require currentPassword to match
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ message: "Current password required" }, { status: 400 });
      const match = await bcrypt.compare(String(currentPassword), user.passwordHash);
      if (!match) return NextResponse.json({ message: "Current password incorrect" }, { status: 401 });
      if (String(newPassword).length < 8) return NextResponse.json({ message: "New password too short" }, { status: 400 });
      const hashed = await bcrypt.hash(String(newPassword), 10);
      user.passwordHash = hashed;
    }

    await user.save();
    return NextResponse.json({ 
      message: "Profile updated", 
      fullName: user.fullName, 
      email: user.email,
      phone: user.phone,
      address: user.address
    });
  } catch (err: any) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}