import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Asset from "@/models/Asset";

const FINNHUB_KEY = process.env.FINNHUB_KEY;

/* ============================
   GLOBAL PRICE MEMORY (SAFE)
============================ */
let LAST_PRICES: Record<string, number> = {};
let LAST_FETCH = 0;
const CACHE_TTL = 60_000; // 60 seconds

const normalizeSymbol = (s?: string) =>
  s?.trim().toUpperCase();

/* ============================
   FETCH LIVE PRICES (SAFE)
============================ */
async function fetchLivePrices(symbols: string[]) {
  const now = Date.now();

  // Use cache to prevent instability
  if (now - LAST_FETCH < CACHE_TTL && Object.keys(LAST_PRICES).length) {
    return Object.fromEntries(
      symbols.map(s => [s, { price: LAST_PRICES[s] ?? 0 }])
    );
  }

  const prices: Record<string, any> = {};
  const uniqueSymbols = [...new Set(symbols)];

  const cryptoSymbols = uniqueSymbols.filter(s =>
    ["BTC", "ETH", "USDT", "SOL"].includes(s)
  );
  const stockSymbols = uniqueSymbols.filter(s =>
    !cryptoSymbols.includes(s)
  );

  /* ===== CRYPTO (CoinGecko) ===== */
  for (const symbol of cryptoSymbols) {
    try {
      const idsMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        SOL: "solana",
      };

      const id = idsMap[symbol];
      if (!id) continue;

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      const data = await res.json();
      const fetchedPrice = Number(data[id]?.usd ?? 0);

      if (fetchedPrice > 0) {
        prices[symbol] = { price: fetchedPrice };
        LAST_PRICES[symbol] = fetchedPrice;
      } else {
        prices[symbol] = { price: LAST_PRICES[symbol] ?? 0 };
      }
    } catch {
      prices[symbol] = { price: LAST_PRICES[symbol] ?? 0 };
    }
  }

  /* ===== STOCKS (Finnhub) ===== */
  for (const symbol of stockSymbols) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
      );
      const data = await res.json();
      const fetchedPrice = Number(data.c ?? 0);

      if (fetchedPrice > 0) {
        prices[symbol] = { price: fetchedPrice };
        LAST_PRICES[symbol] = fetchedPrice;
      } else {
        prices[symbol] = { price: LAST_PRICES[symbol] ?? 0 };
      }
    } catch {
      prices[symbol] = { price: LAST_PRICES[symbol] ?? 0 };
    }
  }

  LAST_FETCH = now;
  return prices;
}

/* ============================
   API HANDLER
============================ */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const assets = await Asset.find({ user: user._id });

    const url = new URL(req.url);
    const isSummary =
      url.searchParams.get("summary") === "1" ||
      url.searchParams.get("summary") === "true";

    const symbols = assets
      .map(a => normalizeSymbol(a.symbol))
      .filter(Boolean) as string[];

    const livePrices = await fetchLivePrices(symbols);

    /* ===== SUMMARY MODE ===== */
    if (isSummary) {
      const total = assets.reduce((acc, asset: any) => {
        const symbol = normalizeSymbol(asset.symbol);
        const qty = Number(asset.quantity ?? 0);
        const price = symbol
          ? (livePrices[symbol]?.price ??
            LAST_PRICES[symbol] ??
            0)
          : 0;

        return acc + qty * price;
      }, 0);

      return NextResponse.json({
        totalBalance: Number(total.toFixed(2)),
      });
    }

    /* ===== FULL ASSETS MODE ===== */
    const assetsWithPrices = assets.map(asset => {
      const symbol = normalizeSymbol(asset.symbol);
      const price = symbol
        ? (livePrices[symbol]?.price ??
          LAST_PRICES[symbol] ??
          0)
        : 0;

      return {
        ...asset.toObject(),
        livePrice: price,
      };
    });

    return NextResponse.json({ assets: assetsWithPrices });
  } catch (error) {
    console.error("Assets API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
