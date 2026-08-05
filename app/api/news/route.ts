import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/news
 * Fetches real-time financial and crypto news.
 * Uses NewsAPI (free tier) or falls back to mock data if API is unavailable.
 */ 
export async function GET(request: NextRequest) {
  try {
    // Try to fetch from NewsAPI (requires NEWSAPI_KEY in .env)
    const newsApiKey = process.env.NEWSAPI_KEY;

    if (newsApiKey) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=medbed+OR+crypto&sortBy=publishedAt&language=en&pageSize=6`,
          {
            headers: {
              "X-API-Key": newsApiKey,
            },
            // Cache for 1 hour to avoid rate limits
            next: { revalidate: 3600 },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const articles = data.articles?.slice(0, 6).map((article: any) => ({
            id: article.url,
            title: article.title,
            description: article.description,
            image: article.urlToImage,
            source: article.source?.name || "Unknown",
            url: article.url,
            publishedAt: article.publishedAt,
          })) || [];

          return NextResponse.json({ articles, source: "newsapi" }, { status: 200 });
        }

        const errorBody = await response.text();
        console.warn("NewsAPI returned non-ok status:", response.status, errorBody);
      } catch (error) {
        console.warn("NewsAPI fetch failed, falling back to mock data:", error);
      }
    }

    // Fallback: Return mock news data
    const mockNews = [
      {
        id: "1",
        title: "Medbed Clinics Expand Access to Regenerative Care",
        description:
          "New medbed clinics are opening nationwide, offering advanced wellness treatments aimed at improving recovery and reducing chronic pain.",
        image: "/asset/medbed1.jpeg",
        source: "HealthTech Today",
        url: "https://healthtechtoday.com/medbed-expansion",
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "Crypto Markets Stabilize After Bitcoin Rally",
        description:
          "Bitcoin and leading altcoins saw modest gains overnight as traders weighed macroeconomic data and renewed investor interest in decentralized finance.",
        image: "/asset/web3.jpg",
        source: "Crypto Pulse",
        url: "https://cryptopulse.com/market-update",
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Medbed Research Shows Promising Recovery Results",
        description:
          "Early clinical reports indicate medbed therapies may help accelerate healing times for patients recovering from surgery and injury.",
        image: "/asset/trumpmedbed.jpeg",
        source: "Wellness Journal",
        url: "https://wellnessjournal.com/medbed-recovery-study",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        title: "Ethereum ETF Flows Pick Up as Crypto Adoption Continues",
        description:
          "Institutional demand for Ethereum ETFs rose this week, supporting price momentum and confidence in the broader crypto sector.",
        image: "/asset/trend.jpg",
        source: "Market Digest",
        url: "https://marketdigest.com/ethereum-etf-flows",
        publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        title: "Medbed Wellness Retreats Attract Health-Conscious Travelers",
        description:
          "Medical wellness resorts are adding medbed sessions to their services, appealing to travelers seeking proactive health optimization.",
        image: "/asset/medbed2.jpeg",
        source: "Travel & Health",
        url: "https://travelhealth.com/medbed-retreats",
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        title: "Major Exchange Lists New Layer-2 Crypto Asset",
        description:
          "A top crypto exchange announced support for a new layer-2 token, expanding options for low-cost, high-speed decentralized transactions.",
        image: "/asset/btccoin.jpg",
        source: "Digital Asset News",
        url: "https://digitalassetnews.com/layer2-listing",
        publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(
      { articles: mockNews, source: "mock" },
      { status: 200 }
    );
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { message: "Failed to fetch news", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
