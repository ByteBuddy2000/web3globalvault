import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from "@/lib/mongodb";
import K401k from '@/models/K401k';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let k401k = await K401k.findOne({ userId: user._id });

    if (!k401k) {
      // Create a new 401k account if it doesn't exist
      k401k = new K401k({
        userId: user._id,
        totalBalance: 0,
        target: 0,
        projected: 0,
        contributions: [],
      });
      await k401k.save();
    }

    return NextResponse.json({
      totalBalance: k401k.totalBalance,
      target: k401k.target || 0,
      projected: k401k.projected || 0,
      contributions: k401k.contributions || [],
    });
  } catch (error: any) {
    console.error('Error fetching 401k data:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
