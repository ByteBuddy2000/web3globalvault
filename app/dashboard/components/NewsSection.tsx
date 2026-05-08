'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Zap } from 'lucide-react';
import Image from 'next/image';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  url: string;
  publishedAt: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        const data = await response.json();

        if (response.ok) {
          setNews(data.articles || []);
        } else {
          setError(data.message || 'Failed to load news');
        }
      } catch (err) {
        setError('Error fetching news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.section
      className="py-16 px-4 bg-gradient-to-b from-black via-gray-900 to-black"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Latest <span className="text-yellow-400">Market News</span>
            </h2>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-gray-300 text-lg">
            Stay updated with real-time financial and crypto market insights
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-spin" style={{ opacity: 0.2 }}></div>
              <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && news.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-0 overflow-hidden h-full flex flex-col hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-black/40">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-transparent">
                        <Newspaper className="w-12 h-12 text-yellow-400/50" />
                      </div>
                    )}
                    {/* Source Badge */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-3 py-1 rounded-full">
                      <p className="text-xs font-semibold text-yellow-400">{article.source}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-sm md:text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                      {article.description || 'No description available'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/6">
                      <div className="flex items-center gap-1 text-muted text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(article.publishedAt)}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-yellow-400/30 mx-auto mb-4" />
            <p className="text-gray-400">No news available at the moment.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
