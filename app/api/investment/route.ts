import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Investment from "@/models/Investment";
import Asset from "@/models/Asset";
import axios from "axios";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import crypto from "crypto";

// --- Plan Configuration ---
const PLANS = {
  Gold: { minAmount: 10000, durationWeeks: 8,  expectedReturn: 5 },
  Silver: { minAmount: 5000,  durationWeeks: 14, expectedReturn: 8 },
  Diamond: { minAmount: 20000, durationWeeks: 23, expectedReturn: 12 },
};

// --- Price Caching ---
const cryptoCache = new Map<string, { price: number; expiry: number }>();
const stockCache = new Map<string, { price: number; expiry: number }>();
const CACHE_TTL = 30000; // 30 seconds

// --- Helper: Get Live Prices ---
async function getCryptoPrice(symbol: string): Promise<number> {
  try {
    const now = Date.now();
    const cached = cryptoCache.get(symbol);
    if (cached && cached.expiry > now) return cached.price;

    const mapping: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      SOL: "solana",
      TON: "the-open-network",
    };

    const id = mapping[String(symbol).toUpperCase()];
    if (!id) return 0;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`CoinGecko error for ${symbol}: ${res.status}`);
      return cached?.price ?? 0;
    }

    const data = await res.json();
    const price = Number(data[id]?.usd ?? 0) || 0;

    if (price > 0) {
      cryptoCache.set(symbol, { price, expiry: now + CACHE_TTL });
    }

    return price > 0 ? price : cached?.price ?? 0;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    const cached = cryptoCache.get(symbol);
    return cached?.price ?? 0;
  }
}

async function getStockPrice(symbol: string): Promise<number> {
  try {
    const now = Date.now();
    const cached = stockCache.get(symbol);
    if (cached && cached.expiry > now) return cached.price;

    const apiKey = process.env.FINNHUB_KEY;
    if (!apiKey) return 0;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Finnhub error for ${symbol}: ${res.status}`);
      return cached?.price ?? 0;
    }

    const data = await res.json();
    const price = Number(data.c ?? 0) || 0;

    if (price > 0) {
      stockCache.set(symbol, { price, expiry: now + CACHE_TTL });
    }

    return price > 0 ? price : cached?.price ?? 0;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    const cached = stockCache.get(symbol);
    return cached?.price ?? 0;
  }
}

type AssetLike = {
  _id?: any;
  symbol: string;
  type?: string;
  name?: string;
  quantity?: number;
  livePrice?: number;
  toObject?: () => any;
};

async function getLivePrice(asset: AssetLike): Promise<number> {
  const type = asset?.type?.toLowerCase();
  if (type === "crypto") return await getCryptoPrice(asset.symbol);
  if (type === "stock") return await getStockPrice(asset.symbol);
  return 0;
}

function makeReference() {
  return crypto.randomBytes(8).toString("hex");
}

// Map common lowercase/variant type names to the project's Transaction enum values
function mapTransactionType(preferred: string) {
  const key = String(preferred || "").toLowerCase();
  switch (key) {
    case "investment":
    case "invest":
      return "Investment";
    case "withdrawal":
    case "withdraw":
      return "Withdraw";
    case "deposit":
    case "credit":
      return "Deposit";
    case "dividend":
      return "Dividend";
    default:
      // fallback to Investment for safety
      return "Investment";
  }
}

// --- GET (fetch investments + assets) ---
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // populate user assets only, then query investments separately and populate their asset refs
    const user = await User.findOne({ email: token.email }).populate("assets");

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    // fetch investments for this user and populate the `asset` reference on Investment
    const investments = await Investment.find({ user: user._id }).populate("asset");

    const assetsWithPrices = await Promise.all(
      (user.assets || []).map(async (a: any) => ({
        ...a.toObject(),
        livePrice: await getLivePrice(a as AssetLike),
      }))
    );

    return NextResponse.json({
      investments: investments || [],
      assets: assetsWithPrices,
    });
  } catch (err) {
    console.error("GET /api/investment error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// --- POST (create investment) ---
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body: any = await req.json();
    const { planName, amount, assetSymbol }:
      { planName?: string; amount?: number | string; assetSymbol?: string } = body || {};

    if (!planName || !amount || !assetSymbol)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const plan = (PLANS as Record<string, { minAmount: number; durationWeeks: number; expectedReturn: number }>)[
      String(planName)
    ];
    if (!plan)
      return NextResponse.json({ message: "Invalid plan selected" }, { status: 400 });

    const investAmount = Number(amount);

    // Comprehensive validation
    if (isNaN(investAmount) || investAmount <= 0)
      return NextResponse.json(
        { message: "Invalid investment amount" },
        { status: 400 }
      );

    if (investAmount < plan.minAmount)
      return NextResponse.json(
        {
          message: `Minimum investment for ${planName} is $${plan.minAmount}`,
          criteria: { minAmount: plan.minAmount },
        },
        { status: 400 }
      );

    if (investAmount > 1000000) // Max safety limit
      return NextResponse.json(
        { message: "Investment amount exceeds maximum limit of $1,000,000" },
        { status: 400 }
      );

    const user = await User.findOne({ email: token.email })
      .populate("assets")
      .populate("investments");

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const asset = (user.assets || []).find((a: any) =>
      String(a.symbol).toUpperCase() === String(assetSymbol).toUpperCase()
    );
    if (!asset)
      return NextResponse.json(
        {
          message: "Asset not found in your portfolio",
          availableAssets: user.assets.map((a:any) => a.symbol),
        },
        { status: 404 }
      );

    const livePrice = await getLivePrice(asset);
    if (!livePrice || livePrice <= 0)
      return NextResponse.json(
        { message: "Unable to fetch current asset price. Please try again." },
        { status: 503 }
      );

    const requiredShares = Number((investAmount / livePrice).toFixed(8));
    if ((asset.quantity ?? 0) < requiredShares)
      return NextResponse.json(
        {
          message: `Insufficient ${assetSymbol} balance`,
          details: {
            required: requiredShares,
            available: asset.quantity,
            livePrice: livePrice,
          },
        },
        { status: 400 }
      );

    // Start atomic transaction
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Deduct from asset
     await Asset.findByIdAndUpdate(
  asset._id,
  {
    $inc: { quantity: -requiredShares },
    $set: { price: livePrice, purchasePrice: livePrice },
  },
  { session }
);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationWeeks * 7);

      const reference = makeReference();
      const projectedReturns = +(
        investAmount * (1 + plan.expectedReturn / 100) ** plan.durationWeeks
      ).toFixed(2);

      const created = await Investment.create(
        [
          {
            user: user._id,
            planName,
            amount: investAmount,
            assetSymbol,
            startDate,
            endDate,
            asset: asset._id,
            sharesDeducted: requiredShares,
            assetPriceAtPurchase: livePrice,
            expectedAnnualReturn: plan.expectedReturn,
            status: "Active",
            reference,
            projectedReturns,
          },
        ],
        { session }
      );

      const newInvestment = created[0];

      // populate the created investment's asset before returning
      const populatedInvestment = await Investment.findById(newInvestment._id).populate("asset");

      // Log transaction (map to Transaction model enum)
      const txType = mapTransactionType("investment");
      await Transaction.create(
        [
          {
            user: user._id,
            type: txType,
            amount: investAmount,
            assetSymbol,
            status: "Completed",
            reference,
            details: `${planName} Investment Plan - ${plan.durationWeeks} weeks @ ${plan.expectedReturn}% return`,
          },
        ],
        { session }
      );

      user.investments.push(newInvestment._id);
      await user.save({ session });

      await session.commitTransaction();

      // Fetch updated assets with live prices
      const updatedAssets = await Promise.all(
        (user.assets || []).map(async (a: any) => ({
          ...a.toObject(),
          livePrice: await getLivePrice(a as AssetLike),
        }))
      );

      return NextResponse.json(
        {
          message: "Investment created successfully",
          investment: populatedInvestment,
          confirmation: {
            planName,
            investmentAmount: investAmount,
            assetSymbol,
            sharesAllocated: requiredShares,
            assetPrice: livePrice,
            duration: `${plan.durationWeeks} weeks`,
            expectedReturn: `${plan.expectedReturn}%`,
            projectedFinalAmount: projectedReturns,
            maturityDate: endDate.toISOString(),
            reference,
          },
          assets: updatedAssets,
        },
        { status: 201 }
      );
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  } catch (err) {
    console.error("POST /api/investment error:", err);
    return NextResponse.json({ message: "Failed to create investment. Please try again." }, { status: 500 });
  }
}

// --- PATCH (withdraw investment) ---
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body: any = await req.json().catch(() => ({}));
    const { action, investmentId }:
      { action?: string; investmentId?: string } = body || {};
    if (action !== "withdraw" || !investmentId)
      return NextResponse.json({ message: "Missing action or investmentId" }, { status: 400 });

    const user = await User.findOne({ email: token.email }).populate("assets");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const investment = await Investment.findById(investmentId).populate("asset");
    if (!investment) return NextResponse.json({ message: "Investment not found" }, { status: 404 });

    if (investment.user.toString() !== user._id.toString())
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    if (investment.status !== "Active")
      return NextResponse.json({
        message: `Cannot withdraw. Investment status: ${investment.status}`,
        status: investment.status,
      }, { status: 400 });

    // Minimum hold period check (24 hours)
    const holdMinutes = (Date.now() - new Date(investment.startDate).getTime()) / (1000 * 60);
    if (holdMinutes < 24 * 60) {
      const remainingHours = Math.ceil((24 * 60 - holdMinutes) / 60);
      return NextResponse.json({
        message: `Minimum hold period not met`,
        criteria: {
          minimumHoldDays: 1,
          timeHeld: `${Math.floor(holdMinutes / 60)} hours`,
          remainingTime: `${remainingHours} hours`,
          withdrawalDate: new Date(investment.startDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }, { status: 400 });
    }

    // Get current live price
    const assetData = investment.asset || {
      symbol: investment.assetSymbol,
      type: "stock",
    };

    const livePrice = await getLivePrice(assetData);
    if (!livePrice || livePrice <= 0)
      return NextResponse.json(
        { message: "Unable to fetch current price. Please try again later." },
        { status: 503 }
      );

    const shares = Number(investment.sharesDeducted || 0);
    const originalInvestment = Number(investment.amount || 0);
    const currentValue = +(shares * livePrice).toFixed(2);
    const gains = +(currentValue - originalInvestment).toFixed(2);
    const gainPercentage = originalInvestment > 0 ? +((gains / originalInvestment) * 100).toFixed(2) : 0;

    // Calculate fees (0.5% withdrawal fee)
    const withdrawalFeePercentage = 0.005;
    const withdrawalFee = +(currentValue * withdrawalFeePercentage).toFixed(2);
    const netProceeds = +(currentValue - withdrawalFee).toFixed(2);

    // Atomic transaction for withdrawal
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Return shares to user asset or create new
      let userAsset = (user.assets || []).find((a: any) =>
        String(a.symbol).toUpperCase() === String(investment.assetSymbol).toUpperCase()
      );

      if (userAsset) {
        await Asset.findByIdAndUpdate(
          userAsset._id,
          { $inc: { quantity: shares } },
          { session }
        );
      } else {
        const newAsset = await Asset.create(
  [
    {
      user: user._id,
      type: assetData.type || "stock",
      name: assetData.name || investment.assetSymbol,
      symbol: investment.assetSymbol,
      quantity: shares,
      price: livePrice,
      purchasePrice: livePrice,
    },
  ],
  { session }
);
        user.assets.push(newAsset[0]._id);
      }

      // Mark investment as completed
      investment.status = "Withdrawn";
      investment.withdrawalDate = new Date();
      investment.withdrawalPrice = livePrice;
      investment.currentValue = currentValue;
      investment.gains = gains;
      investment.gainPercentage = gainPercentage;
      await investment.save({ session });

      // Log withdrawal transaction (map to Transaction model enum)
      const reference = makeReference();
      const txType = mapTransactionType("withdrawal");
      await Transaction.create(
        [
          {
            user: user._id,
            type: txType,
            amount: netProceeds,
            assetSymbol: investment.assetSymbol,
            status: "Completed",
            reference,
            details: `Withdrawal from ${investment.planName} plan - Proceeds: $${netProceeds} (Gains: $${gains}, Fee: $${withdrawalFee})`,
          },
        ],
        { session }
      );

      await user.save({ session });
      await session.commitTransaction();

      // Fetch updated assets
      const updatedAssets = await Promise.all(
        (user.assets || []).map(async (a: any) => ({
          ...a.toObject(),
          livePrice: await getLivePrice(a as AssetLike),
        }))
      );

      return NextResponse.json({
        message: "Withdrawal completed successfully",
        breakdown: {
          originalInvestment,
          currentMarketValue: currentValue,
          gains,
          gainPercentage: `${gainPercentage}%`,
          withdrawalFee,
          withdrawalFeePercentage: `${(withdrawalFeePercentage * 100).toFixed(2)}%`,
          netProceeds,
          withdrawalPrice: livePrice,
          sharesReturned: shares,
          holdingPeriod: `${Math.floor(holdMinutes / 60 / 24)} days`,
        },
        investment: investment.toObject(),
        reference,
        assets: updatedAssets,
      });
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  } catch (err) {
    console.error("PATCH /api/investment error:", err);
    return NextResponse.json({ message: "Withdrawal failed. Please try again." }, { status: 500 });
  }
}
