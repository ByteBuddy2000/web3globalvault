import { NextRequest, NextResponse } from "next/server";

const CACHE_DURATION = 60 * 1000; // 60 seconds
const REQUEST_DELAY = 1000; // 1 second between requests

let cryptoCache: Record<
  string,
  { usd: number; timestamp: number }
> = {};

let lastRequestTime = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const ids = searchParams.get("ids");

    // Validate ids
    if (!ids) {
      return NextResponse.json(
        { error: "No IDs provided" },
        { status: 400 }
      );
    }

    // Convert ids into array
    const idArray = ids
      .split(",")
      .map((id) => id.trim().toLowerCase())
      .filter((id) => id.length > 0);

    if (idArray.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs" },
        { status: 400 }
      );
    }

    const now = Date.now();

    const result: Record<string, { usd: number }> = {};

    // Check cache first
    const uncachedIds = idArray.filter((id) => {
      const cached = cryptoCache[id];

      if (
        cached &&
        now - cached.timestamp < CACHE_DURATION
      ) {
        result[id] = { usd: cached.usd };
        return false;
      }

      return true;
    });

    // Fetch uncached prices
    if (uncachedIds.length > 0) {
      // Prevent hitting rate limits
      const timeSinceLastRequest =
        now - lastRequestTime;

      if (timeSinceLastRequest < REQUEST_DELAY) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            REQUEST_DELAY - timeSinceLastRequest
          )
        );
      }

      try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 15000);

        // Proper CoinGecko URL
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          uncachedIds.join(",")
        )}&vs_currencies=usd`;

        console.log("Fetching:", apiUrl);

        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "Web3GlobalVault/1.0",
            ...(process.env.COINGECKO_API_KEY && {
              "x-cg-pro-api-key":
                process.env.COINGECKO_API_KEY,
            }),
          },

          // Helps Next.js caching
          next: {
            revalidate: 60,
          },
        });

        clearTimeout(timeout);

        lastRequestTime = Date.now();

        // Handle API errors
        if (!res.ok) {
          console.error(
            "CoinGecko Error:",
            res.status,
            res.statusText
          );

          // Rate limit fallback
          if (res.status === 429) {
            for (const id of uncachedIds) {
              result[id] = {
                usd: cryptoCache[id]?.usd ?? 0,
              };
            }

            return NextResponse.json(result);
          }

          return NextResponse.json(
            {
              error: `CoinGecko responded with ${res.status}`,
            },
            { status: res.status }
          );
        }

        const data = await res.json();

        console.log("CoinGecko Response:", data);

        // Save data
        for (const id of uncachedIds) {
          const price = data[id]?.usd;

          if (typeof price === "number") {
            cryptoCache[id] = {
              usd: price,
              timestamp: now,
            };

            result[id] = { usd: price };
          } else {
            // fallback to cache or 0
            result[id] = {
              usd: cryptoCache[id]?.usd ?? 0,
            };
          }
        }
      } catch (fetchError) {
        console.error(
          "CoinGecko Fetch Error:",
          fetchError
        );

        // Return cached values on failure
        for (const id of uncachedIds) {
          result[id] = {
            usd: cryptoCache[id]?.usd ?? 0,
          };
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Route Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch cryptocurrency prices",
      },
      { status: 500 }
    );
  }
}