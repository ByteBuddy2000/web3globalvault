import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Asset from "@/models/Asset";
import Swap from "@/models/Swap";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

/* ---------------- HELPERS ---------------- */

function getAssetType(symbol: string): "Crypto" | "Stock" {
  const cryptoSymbols = ["BTC", "ETH", "USDT", "SOL"];
  return cryptoSymbols.includes(symbol.toUpperCase()) ? "Crypto" : "Stock";
}

/* ---------------- PRICE FETCHER ---------------- */

let priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds

async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, "");
    const now = Date.now();

    // Check cache first
    const cached = priceCache[cleanSymbol];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.price;
    }

    const cryptoMap: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      SOL: "solana",
    };

    // ---- CRYPTO ----
    if (cryptoMap[cleanSymbol]) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[cleanSymbol]}&vs_currencies=usd`,
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
        console.error(`CoinGecko API error for ${cleanSymbol}: ${res.status}`);
        return cached?.price ?? null;
      }

      const data = await res.json();
      const price = data?.[cryptoMap[cleanSymbol]]?.usd;

      if (price && price > 0) {
        priceCache[cleanSymbol] = { price, timestamp: now };
        return price;
      }

      return cached?.price ?? null;
    }

    // ---- STOCK ----
    if (!process.env.FINNHUB_KEY) {
      console.error("FINNHUB_KEY not configured");
      return cached?.price ?? null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${process.env.FINNHUB_KEY}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Finnhub API error for ${cleanSymbol}: ${res.status}`);
      return cached?.price ?? null;
    }

    const data = await res.json();
    const price = data?.c;

    if (price && price > 0) {
      priceCache[cleanSymbol] = { price, timestamp: now };
      return price;
    }

    return cached?.price ?? null;
  } catch (err) {
    console.error("Price fetch error for", symbol, ":", err);
    const cached = priceCache[symbol.toUpperCase().replace(/[^A-Z]/g, "")];
    return cached?.price ?? null;
  }
}

/* ---------------- SWAP API ---------------- */

export async function POST(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { fromAsset, toAsset, amount } = await req.json();

  if (!fromAsset || !toAsset || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  if (fromAsset === toAsset) {
    return NextResponse.json(
      { message: "Cannot swap same asset" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email: token.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const from = await Asset.findOne({
      user: user._id,
      symbol: fromAsset,
    }).session(session);

    if (!from) throw new Error(`You don't own ${fromAsset}`);
    if (from.quantity < amount) throw new Error("Insufficient balance");

    const [fromPrice, toPrice] = await Promise.all([
      fetchLivePrice(fromAsset),
      fetchLivePrice(toAsset),
    ]);

    if (!fromPrice || !toPrice) {
      throw new Error("Price fetch failed");
    }

    const usdValue = amount * fromPrice;
    const feeUSD = usdValue * 0.01;
    const netUsd = usdValue - feeUSD;
    const toAmount = netUsd / toPrice;

    from.quantity -= amount;
    await from.save({ session });

    let to = await Asset.findOne({
      user: user._id,
      symbol: toAsset,
    }).session(session);

    if (!to) {
      const [created] = await Asset.create(
        [
          {
            user: user._id,
            symbol: toAsset,
            name: toAsset,
            type: getAssetType(toAsset),
            quantity: toAmount,
          },
        ],
        { session }
      );
      to = created;
    } else {
      to.quantity += toAmount;
      await to.save({ session });
    }

    await Swap.create(
      [
        {
          user: user._id,
          fromAsset,
          toAsset,
          fromType: getAssetType(fromAsset),
          toType: getAssetType(toAsset),
          fromAmount: amount,
          toAmount,
          fromPriceUSD: fromPrice,
          toPriceUSD: toPrice,
          usdValue,
          feeUSD,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      data: {
        fromAsset,
        toAsset,
        fromAmount: amount,
        toAmount,
      },
    });
  } catch (err: any) {
    await session.abortTransaction();
    console.error("Swap error:", err.message);
    return NextResponse.json(
      { message: err.message || "Swap failed" },
      { status: 400 }
    );
  } finally {
    session.endSession();
  }
}