import { NextRequest, NextResponse } from "next/server";

const CACHE_DURATION = 60 * 1000; // 60 seconds (increased)
let cryptoCache: Record<string, { usd: number; timestamp: number }> = {};
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second between requests

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  try {
    const idArray = ids
      .split(",")
      .map((id) => id.trim().toLowerCase())
      .filter((id) => id.length > 0);

    if (idArray.length === 0) {
      return NextResponse.json({});
    }

    const now = Date.now();
    const result: Record<string, any> = {};

    // Check cached values first
    const uncachedIds = idArray.filter((id) => {
      const cached = cryptoCache[id];
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        result[id] = { usd: cached.usd };
        return false;
      }
      return true;
    });

    if (uncachedIds.length > 0) {
      // Rate limiting: wait if needed
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < REQUEST_DELAY) {
        await new Promise((resolve) =>
          setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest)
        );
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${uncachedIds.join(
          ","
        )}&vs_currencies=usd&x_cg_pro_api_key=${process.env.COINGECKO_API_KEY || ""}`;

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "Web3GlobalVault/1.0",
          },
        });

        lastRequestTime = Date.now();
        clearTimeout(timeout);

        if (!res.ok) {
          if (res.status === 429) {
            console.warn("CoinGecko rate limited, returning cached data");
            // Return cached or fallback to 0
            for (const id of uncachedIds) {
              result[id] = { usd: cryptoCache[id]?.usd ?? 0 };
            }
          } else {
            throw new Error(`CoinGecko error: ${res.status}`);
          }
        } else {
          const data = await res.json();
          for (const id of uncachedIds) {
            const price = data[id]?.usd ?? 0;
            if (price > 0) {
              cryptoCache[id] = { usd: price, timestamp: now };
              result[id] = { usd: price };
            } else {
              result[id] = { usd: cryptoCache[id]?.usd ?? 0 };
            }
          }
        }
      } catch (error) {
        console.error("CoinGecko fetch error:", error);
        // Return cached values
        for (const id of uncachedIds) {
          result[id] = { usd: cryptoCache[id]?.usd ?? 0 };
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("CoinGecko route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency prices" },
      { status: 500 }
    );
  }
}
