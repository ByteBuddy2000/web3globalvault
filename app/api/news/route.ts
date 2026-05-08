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
          `https://newsapi.org/v2/everything?q=crypto+OR+banking+OR+finance&sortBy=publishedAt&language=en&pageSize=6`,
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
      } catch (error) {
        console.warn("NewsAPI fetch failed, falling back to mock data:", error);
      }
    }

    // Fallback: Return mock news data
    const mockNews = [
      {
        id: "1",
        title: "Bitcoin Reaches New All-Time High as Institutional Adoption Accelerates",
        description:
          "Bitcoin surged past $70,000 as major financial institutions continue to increase their holdings and integrate cryptocurrency into their portfolios.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "Crypto News Daily",
        url: "https://cryptonewsdaily.com",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "Fed Signals Possible Interest Rate Cuts in 2025",
        description:
          "Federal Reserve officials hinted at potential interest rate reductions, signaling a shift in monetary policy direction to support economic growth.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "Financial Times",
        url: "https://ft.com",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Ethereum Upgrade Improves Network Efficiency by 40%",
        description:
          "The latest Ethereum network upgrade rolled out successfully, delivering significant improvements to transaction throughput and reducing gas fees.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "Blockchain Insider",
        url: "https://blockchaininsider.com",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        title: "Goldman Sachs Opens New Digital Banking Division",
        description:
          "Goldman Sachs announced the launch of its new digital-first banking division, targeting millennial and Gen Z customers with modern financial products.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "Banking News",
        url: "https://bankingnews.com",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        title: "Global Remittance Market Grows 15% YoY with Blockchain Technology",
        description:
          "International money transfers via blockchain platforms have surged, offering faster and cheaper alternatives to traditional banking channels.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "FinTech Today",
        url: "https://fintechtoday.com",
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        title: "Stock Market Reaches Record High as Tech Stocks Lead Rally",
        description:
          "Major iFederal Reservees closed at record highs, driven by strong earnings reports from technology companies and positive economic iFederal Reserveators.",
        image: "https://via.placeholder.com/400x200.png?text=News+Image",
        source: "Market Watch",
        url: "https://marketwatch.com",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
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
