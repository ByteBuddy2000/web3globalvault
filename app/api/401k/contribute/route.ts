import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from "@/lib/mongodb";
import K401k from '@/models/K401k';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Asset from '@/models/Asset';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, frequency = 'one-time' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!['one-time', 'monthly', 'yearly'].includes(frequency)) {
      return NextResponse.json(
        { message: 'Invalid frequency' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find user's USDT asset
    const usdtAsset = await Asset.findOne({ user: user._id, symbol: 'USDT' });

    if (!usdtAsset) {
      return NextResponse.json(
        { message: 'USDT asset not found' },
        { status: 404 }
      );
    }

    // Check USDT balance (quantity holds the spendable amount)
    const availableUsdt = usdtAsset.quantity - (usdtAsset.pendingWithdrawal || 0);

    if (availableUsdt < amount) {
      return NextResponse.json(
        { message: 'Insufficient USDT balance' },
        { status: 400 }
      );
    }

    let k401k = await K401k.findOne({ userId: user._id });

    if (!k401k) {
      k401k = new K401k({
        userId: user._id,
        totalBalance: 0,
        target: 0,
        projected: 0,
        contributions: [],
      });
    }

    // Add contribution
    const contribution = {
      amount,
      frequency,
      createdAt: new Date(),
      status: 'Completed',
    };

    k401k.contributions.push(contribution);
    k401k.totalBalance += amount;

    // Calculate projected value (10 years at 6% annual return)
    const projectedValue = (balance: number, monthlyAdd = 0, years = 10, rate = 0.06) => {
      const r = rate;
      let val = balance;
      for (let i = 0; i < years * 12; i++) {
        val = val * (1 + r / 12) + monthlyAdd;
      }
      return Math.round(val);
    };

    k401k.projected = projectedValue(k401k.totalBalance, 0, 10, 0.06);

    await k401k.save();

    // Deduct from USDT asset quantity
    usdtAsset.quantity -= amount;
    await usdtAsset.save();

    // Generate a reference code
    const reference = `401K-${user._id.toString().slice(-6).toUpperCase()}-${Date.now()}`;

    // Save transaction matching the Transaction schema
    await Transaction.create({
      user: user._id,                          // ObjectId ref to User
      type: 'Investment',                      // closest matching enum value
      amount,
      fee: 0,
      feeLabel: '',
      youReceive: amount,
      feePaid: false,
      status: 'Completed',
      reference,
      details: `401k contribution (USDT) - ${frequency}`,
      coin: 'USDT',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Contribution successful',
      totalBalance: k401k.totalBalance,
      projected: k401k.projected,
      usdtBalance: usdtAsset.quantity,
      reference,
    });
  } catch (error: any) {
    console.error('Error processing contribution:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}