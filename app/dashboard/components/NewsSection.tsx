'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Zap, RefreshCw } from 'lucide-react';
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

/* ─── Time formatter ────────────────────────────────────────── */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1)  return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="card overflow-hidden"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div className="skeleton h-48 w-full" style={{ borderRadius: 0 }} />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div
          className="skeleton h-3 w-1/3 mt-4"
          style={{ marginTop: 'var(--space-6)' }}
        />
      </div>
    </div>
  );
}

/* ─── News card ─────────────────────────────────────────────── */
function NewsCard({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  return (
    <motion.div
      key={article.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="card h-full flex flex-col overflow-hidden"
        style={{
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          textDecoration: 'none',
          display: 'flex',
        }}
      >
        {/* ── Image ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ height: '192px', background: 'var(--surface-300)' }}
        >
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--glass-brand-xs)' }}
            >
              <Newspaper
                className="w-12 h-12"
                style={{ color: 'var(--brand-500)', opacity: 0.4 }}
              />
            </div>
          )}

          {/* gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, var(--surface-200) 0%, transparent 50%)',
            }}
          />

          {/* source badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(6,7,10,0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-brand)',
            }}
          >
            <p
              className="font-semibold"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--brand-400)',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              {article.source}
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          className="flex flex-col flex-1 p-5"
          style={{ background: 'var(--glass-white-xs)' }}
        >
          <h3
            className="font-bold mb-2 line-clamp-2 transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-0)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {article.title}
          </h3>

          <p
            className="line-clamp-2 flex-1 mb-4"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-200)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {article.description || 'No description available'}
          </p>

          {/* footer row */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div
              className="flex items-center gap-1.5"
              style={{ color: 'var(--text-300)', fontSize: 'var(--text-xs)' }}
            >
              <Clock className="w-3 h-3" />
              <span>{formatTime(article.publishedAt)}</span>
            </div>
            <ExternalLink
              className="w-4 h-4 transition-colors duration-200"
              style={{ color: 'var(--text-400)' }}
            />
          </div>
        </div>
      </a>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
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

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      className="relative z-10"
      style={{ padding: 'var(--space-16) var(--space-4)' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-2">

        {/* ── Section header ── */}
        <div className="text-center mb-14">
          {/* eyebrow */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{
              border: '1px solid var(--border-brand)',
              background: 'var(--glass-brand-sm)',
              color: 'var(--brand-300)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Live Feed
          </div>

          <h2
            className="font-bold mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-0)',
            }}
          >
            Latest{' '}
            <span className="text-gradient">Market News</span>
          </h2>

          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-200)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            Real-time financial &amp; crypto market insights
          </p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'var(--danger-glow)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <p
              className="mb-4"
              style={{ color: 'var(--danger-400)', fontSize: 'var(--text-sm)' }}
            >
              {error}
            </p>
            <button
              onClick={fetchNews}
              className="btn-secondary btn-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        )}

        {/* ── News grid ── */}
        {!loading && !error && news.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'var(--glass-brand-xs)',
                border: '1px solid var(--border-brand)',
              }}
            >
              <Newspaper
                className="w-9 h-9"
                style={{ color: 'var(--brand-500)', opacity: 0.5 }}
              />
            </div>
            <p style={{ color: 'var(--text-300)', fontSize: 'var(--text-sm)' }}>
              No news available at the moment.
            </p>
          </div>
        )}

      </div>
    </motion.section>
  );
}