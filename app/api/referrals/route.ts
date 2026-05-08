import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Referral from "@/models/Referral";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find user by email to get their ID
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get referrals where this user is the referrer
    const referrals = await Referral.find({ referrerId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Format for frontend
    const formattedReferrals = referrals.map((ref: any) => ({
      id: (ref as any)._id.toString(),
      name: ref.referredName || ref.referredEmail.split('@')[0],
      email: ref.referredEmail,
      status: ref.status,
      reward: `$${ref.reward}`,
      date: ref.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({ referrals: formattedReferrals });
  } catch (err) {
    console.error('Error fetching referrals:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    await connectDB();

    // Find user by email
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if referral already exists for this email
    const existingReferral = await Referral.findOne({
      referrerId: user._id,
      referredEmail: email
    });

    if (existingReferral) {
      return NextResponse.json({ message: 'Referral already sent to this email' }, { status: 400 });
    }

    // Create new referral
    const newReferral = new Referral({
      referrerId: user._id,
      referredEmail: email,
      referredName: email.split('@')[0],
      status: 'Pending',
      reward: 0,
    });

    await newReferral.save();

    // Format for response
    const formattedReferral = {
      id: newReferral._id.toString(),
      name: newReferral.referredName,
      email: newReferral.referredEmail,
      status: newReferral.status,
      reward: `$${newReferral.reward}`,
      date: newReferral.createdAt.toISOString().split('T')[0],
    };

    return NextResponse.json({ referral: formattedReferral }, { status: 201 });
  } catch (err) {
    console.error('Error creating referral:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
