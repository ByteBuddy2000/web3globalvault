"use client";

import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  description: string;
  image: string | null;
  source: string;
  url: string;
  publishedAt: string;
}

export default function NewsSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/news");

        if (!res.ok) {
          throw new Error(`Failed to fetch news: ${res.status}`);
        }

        const data = await res.json();

        if (!cancelled) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load news");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <p className="text-sm text-muted-foreground">Loading news...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <p className="text-sm text-red-500">Couldn't load news: {error}</p>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <p className="text-sm text-muted-foreground">No news articles available right now.</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Latest News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
          >
            {article.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                {article.source} · {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{article.title}</h3>
              {article.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {article.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}