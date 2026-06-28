import { NextResponse } from "next/server";

const MEDBED_USD_PRICE = 10000;

async function getCurrentXrpAmount() {
  let xrpPrice: number | null = null;

  // CoinGecko
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
      {
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      xrpPrice = Number(data?.ripple?.usd);
    }
  } catch {}

  // Fallback to CryptoCompare
  if (!xrpPrice || xrpPrice <= 0) {
    try {
      const response = await fetch(
        "https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=USD",
        {
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        xrpPrice = Number(data?.USD);
      }
    } catch {}
  }

  if (!xrpPrice || xrpPrice <= 0) {
    throw new Error("Unable to fetch XRP price.");
  }

  return {
    usdAmount: MEDBED_USD_PRICE,
    xrpPrice,
    amountXrp: Number(
      (MEDBED_USD_PRICE / xrpPrice).toFixed(6)
    ),
  };
}

export async function GET() {
  try {
    const result = await getCurrentXrpAmount();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch price.",
      },
      {
        status: 500,
      }
    );
  }
}