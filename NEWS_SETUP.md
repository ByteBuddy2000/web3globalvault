# Real-Time News Section Setup

The homepage now displays real-time financial and crypto market news.

## Features

- **Real-time News Feed**: Displays the latest articles from financial and crypto markets
- **6 Article Grid**: Shows curated news articles with images, summaries, and sources
- **Auto-Refresh**: News refreshes every 30 minutes automatically
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **External Links**: Click articles to read full stories from original sources
- **Time Display**: Shows relative time (e.g., "2h ago", "Just now")
- **Loading & Error States**: Handles API failures gracefully with fallback mock data

## Integration Options

### Option 1: Free Mock Data (Default)
The API endpoint serves curated mock news articles by default. No setup required - works immediately.

### Option 2: Real NewsAPI Integration
To use real-time news from [NewsAPI.org](https://newsapi.org):

1. **Get Free API Key**:
   - Visit https://newsapi.org
   - Sign up for a free account
   - Copy your API key from the dashboard

2. **Add Environment Variable**:
   ```bash
   # .env.local
   NEWSAPI_KEY=your_api_key_here
   ```

3. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

The API will automatically fetch real articles when the key is provided, or fall back to mock data if the API is unavailable.

## Files Created/Modified

- **`app/api/news/route.ts`** - News API endpoint (NewsAPI integration + mock fallback)
- **`app/components/NewsSection.tsx`** - News display component with grid layout
- **`app/page.jsx`** - Updated homepage to include NewsSection

## API Endpoint

```
GET /api/news
```

**Response**:
```json
{
  "articles": [
    {
      "id": "article-1",
      "title": "Bitcoin Reaches New All-Time High...",
      "description": "Bitcoin surged past $70,000...",
      "image": "https://...",
      "source": "Crypto News Daily",
      "url": "https://...",
      "publishedAt": "2025-12-08T10:00:00Z"
    }
  ],
  "source": "newsapi" | "mock"
}
```

## Caching

- NewsAPI responses are cached for 1 hour to avoid rate limits (100 requests/day on free tier)
- Frontend auto-refreshes every 30 minutes
- Mock data always available as fallback

## Customization

### Change News Keywords
Edit `app/api/news/route.ts` line 17:
```typescript
const response = await fetch(
  `https://newsapi.org/v2/everything?q=YOUR_KEYWORDS&sortBy=publishedAt...`
)
```

### Change Refresh Interval
Edit `app/components/NewsSection.tsx` line 42:
```typescript
const interval = setInterval(fetchNews, 30 * 60 * 1000); // Change 30 to desired minutes
```

### Change Number of Articles
Edit the query parameter in `app/api/news/route.ts`:
```typescript
pageSize=6 // Change 6 to desired count
```

## Notes

- The news section is fully responsive and uses the app's theme tokens (`.card`, `.text-muted`, etc.)
- Images are lazy-loaded for performance
- External links open in new tabs
- Graceful fallback to mock data if real API fails
