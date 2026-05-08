import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest } from "next/server";

interface UserLookupResult {
  fullName: string;
  accountNumber: string;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const accountRaw = String(url.searchParams.get("account") || "").trim();
    if (!accountRaw) {
      return NextResponse.json({ message: "Missing account query" }, { status: 400 });
    }

    const acctDigits = accountRaw.replace(/\D/g, "");
    const queries: any[] = [
      { accountNumber: accountRaw },
      { accountNumber: { $regex: `^${escapeRegex(accountRaw)}$`, $options: "i" } },
    ];

    if (acctDigits) {
      queries.push({ accountNumber: { $regex: acctDigits + "$" } });
      queries.push({ accountNumber: { $regex: `^${acctDigits}$` } });
    }

    const user = await User.findOne({ $or: queries })
      .select("fullName accountNumber")
      .lean<UserLookupResult | null>();

    if (!user) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json(
      { found: true, name: user.fullName, accountNumber: user.accountNumber },
      { status: 200 }
    );
  } catch (err) {
    console.error("User lookup error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
