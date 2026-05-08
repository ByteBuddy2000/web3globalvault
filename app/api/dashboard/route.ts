import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";  // ✅ Correct import
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import "@/models/Investment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email })
      .populate("investments")
      .populate("assets");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const totalInvestment =
      user.investments?.reduce(
        (sum: number, inv: any) => sum + (inv.amount || 0),
        0
      ) || 0;

    const portfolio =
      user.investments?.reduce((acc: any, inv: any) => {
        const idx = acc.findIndex((i: any) => i.name === inv.planName);
        if (idx > -1) {
          acc[idx].value += inv.amount;
        } else {
          acc.push({ name: inv.planName, value: inv.amount });
        }
        return acc;
      }, []) || [];

    const marketValue = totalInvestment * 1.05;
    const returnRate = marketValue - totalInvestment;

    const assets = user.assets ?? [];

    const totalCurrentValue = assets.reduce((sum: number, a: any) => {
      return sum + (a.price ?? 0) * (a.quantity ?? 0);
    }, 0);

    const totalCostBasis = assets.reduce((sum: number, a: any) => {
      return sum + (a.purchasePrice ?? a.price ?? 0) * (a.quantity ?? 0);
    }, 0);

    const rawGrowth =
      totalCostBasis > 0
        ? ((totalCurrentValue - totalCostBasis) / totalCostBasis) * 100
        : 0;

    const portfolioGrowth = rawGrowth.toFixed(2);
    const portfolioGrowthChange =
      rawGrowth >= 0 ? `+${portfolioGrowth}%` : `${portfolioGrowth}%`;

    return NextResponse.json({
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
      totalValue: marketValue,
      totalValueChange: "+5.00%",
      marketValue,
      marketValueChange: "+5.00%",
      returnRate,
      returnRateChange: "+5.00%",
      totalInvestment,
      totalInvestmentChange: "+5.00%",
      portfolioGrowth,
      portfolioGrowthChange,
      portfolio,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
