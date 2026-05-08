import { NextRequest, NextResponse } from "next/server";

const CACHE_DURATION = 30 * 1000; // 30 seconds
let priceCache: Record<string, { price: number; timestamp: number }> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols");
  
  if (!symbols) {
    return NextResponse.json(
      { error: "No symbols provided", result: [] },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.FINNHUB_KEY;
    if (!apiKey) {
      console.error("FINNHUB_KEY not configured");
      return NextResponse.json(
        { error: "API key not configured", result: [] },
        { status: 500 }
      );
    }

    const symbolArr = symbols
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (symbolArr.length === 0) {
      return NextResponse.json({ result: [] });
    }

    const now = Date.now();

    // Fetch each symbol from Finnhub with timeout
    const results = await Promise.all(
      symbolArr.map(async (symbol) => {
        try {
          // Check cache first
          const cached = priceCache[symbol];
          if (cached && now - cached.timestamp < CACHE_DURATION) {
            return {
              symbol,
              price: cached.price,
              change: 0,
              changePercent: 0,
              previousClose: 0,
              cached: true,
            };
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
            { 
              signal: controller.signal,
              headers: {
                "Accept": "application/json",
              }
            }
          );
          clearTimeout(timeout);

          if (!res.ok) {
            console.error(`Finnhub error for ${symbol}: ${res.status}`);
            return {
              symbol,
              price: priceCache[symbol]?.price ?? 0,
              change: 0,
              changePercent: 0,
              previousClose: 0,
            };
          }

          const data = await res.json();
          const price = Number(data.c ?? 0);

          // Update cache
          if (price > 0) {
            priceCache[symbol] = { price, timestamp: now };
          }

          return {
            symbol,
            price: price > 0 ? price : priceCache[symbol]?.price ?? 0,
            change: Number(data.d ?? 0),
            changePercent: Number(data.dp ?? 0),
            previousClose: Number(data.pc ?? 0),
          };
        } catch (error) {
          console.error(`Stock price fetch error for ${symbol}:`, error);
          return {
            symbol,
            price: priceCache[symbol]?.price ?? 0,
            change: 0,
            changePercent: 0,
            previousClose: 0,
            error: true,
          };
        }
      })
    );

    return NextResponse.json({ result: results });
  } catch (error) {
    console.error("Stock prices route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock prices", result: [] },
      { status: 500 }
    );
  }
}
