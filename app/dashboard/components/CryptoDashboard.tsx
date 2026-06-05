'use client';

import { TrendingUp, TrendingDown, ArrowUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const CRYPTOS = [
  { id: 'bitcoin',  name: 'Bitcoin',  symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana',   name: 'Solana',   symbol: 'SOL' },
  { id: 'ripple',   name: 'Ripple',   symbol: 'XRP' },
  { id: 'cardano',  name: 'Cardano',  symbol: 'ADA' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
];

type Crypto = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

function formatPrice(n: number): string {
  if (n >= 1000)
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

/* Deterministic mini sparkbar — visual only, no real data */
function SparkBars({ id }: { id: string }) {
  const seed = id.charCodeAt(0) + id.charCodeAt(1);
  const bars = Array.from({ length: 8 }, (_, i) => {
    const h = 4 + ((seed * (i + 3) * 7) % 16);
    const up = (seed + i) % 3 !== 0;
    return { h, up };
  });
  return (
    <div className="flex items-end gap-[2px] h-5 mt-1">
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: b.h,
            borderRadius: 1,
            backgroundColor: b.up
              ? 'rgba(34, 197, 94, 0.6)'
              : 'rgba(239, 68, 68, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData]   = useState<Crypto[]>([]);
  const [sortAsc, setSortAsc]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [prevPrices, setPrevPrices]   = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const ids = CRYPTOS.map((c) => c.id).join(',');
        const res  = await fetch(`/api/coingecko?ids=${ids}`);
        if (!res.ok) throw new Error(`API returned status ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const merged = CRYPTOS.map((info) => {
          const currentPrice  = data[info.id]?.usd ?? 0;
          const previousPrice = prevPrices[info.id] ?? currentPrice;
          const change        = currentPrice - previousPrice;
          const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
          return { ...info, price: currentPrice, change, changePercent };
        }).filter((item) => item.price > 0);

        setCryptoData(merged);

        const next: Record<string, number> = {};
        CRYPTOS.forEach((c) => { next[c.id] = data[c.id]?.usd ?? 0; });
        setPrevPrices(next);
        setLastUpdated(new Date());
        if (!merged.length) setError('No crypto data available');
      } catch (err: any) {
        setError(err.message ?? 'Unable to load crypto data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const iv = setInterval(fetchAll, 60_000);
    return () => clearInterval(iv);
  }, []);

  const sorted   = [...cryptoData].sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price);
  const gainers  = cryptoData.filter((c) => c.changePercent >= 0).length;
  const losers   = cryptoData.length - gainers;
  const avgMove  = cryptoData.length
    ? cryptoData.reduce((s, c) => s + c.changePercent, 0) / cryptoData.length
    : null;
  const topGainer = cryptoData.length
    ? cryptoData.reduce((a, b) => (a.changePercent > b.changePercent ? a : b))
    : null;

  return (
    <div className="w-full text-sm font-mono">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.2em] uppercase mb-1 font-sans">
            Crypto Market
          </p>
          <h1 style={{ color: 'var(--text-0)' }} className="text-3xl font-medium tracking-tight leading-none font-sans">
            Live Prices
          </h1>
        </div>

        <div className="flex items-center gap-3 pb-0.5">
          {lastUpdated && (
            <span style={{ color: 'var(--text-300)' }} className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSortAsc((s) => !s)}
            style={{
              color: 'var(--text-300)',
              borderColor: 'var(--border-subtle)',
            }}
            className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase hover:opacity-80 transition rounded px-3 py-1.5 font-sans border"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-300)')}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortAsc ? 'Price ASC' : 'Price DESC'}
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {!loading && !error && cryptoData.length > 0 && (
        <div style={{
          backgroundColor: 'var(--glass-white-sm)',
          borderColor: 'var(--border-subtle)',
        }} className="grid grid-cols-2 sm:grid-cols-4 gap-px border rounded-lg overflow-hidden mb-5">
          {[
            {
              label: 'Advancing',
              value: gainers,
              color: 'var(--success-400)',
            },
            {
              label: 'Declining',
              value: losers,
              color: 'var(--danger-400)',
            },
            {
              label: 'Avg Move',
              value: avgMove !== null
                ? `${avgMove >= 0 ? '+' : ''}${avgMove.toFixed(2)}%`
                : '—',
              color: avgMove !== null && avgMove >= 0 ? 'var(--success-400)' : 'var(--danger-400)',
            },
            {
              label: 'Top Gainer',
              value: topGainer?.symbol ?? '—',
              color: 'var(--brand-400)',
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: 'var(--glass-white-xs)' }} className="px-5 py-4">
              <p style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.2em] uppercase mb-2 font-sans">{label}</p>
              <p style={{ color }} className="text-2xl font-medium">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{
        borderColor: 'var(--border-subtle)',
      }} className="border rounded-lg overflow-hidden">

        {loading ? (
          <div style={{ color: 'var(--text-300)' }} className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 style={{ color: 'var(--brand-400)' }} className="w-5 h-5 animate-spin" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-sans">Fetching prices</span>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger-400)' }} className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[11px] tracking-widest uppercase font-sans">{error}</span>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr style={{
                  borderBottomColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--glass-white-xs)',
                }}  className="border-b">
                  {['#', 'Symbol', 'Name', 'Price (USD)', 'Change', '% Move'].map((h, i) => (
                    <th
                      key={h}
                      style={{ color: 'var(--text-300)' }}
                      className={`py-2.5 px-4 text-[10px] tracking-[0.2em] uppercase font-normal font-sans ${i >= 3 ? 'text-right' : 'text-left'} ${i === 0 ? 'w-10' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const up = c.changePercent >= 0;
                  const sign = up ? '+' : '';
                  return (
                    <tr
                      key={c.symbol}
                      style={{
                        borderTopColor: 'var(--border-subtle)',
                      }}
                      className="border-t hover:opacity-80 transition-opacity"
                    >
                      {/* # */}
                      <td style={{ color: 'var(--text-300)' }} className="py-3.5 px-4 text-[11px]">{i + 1}</td>

                      {/* Symbol */}
                      <td className="py-3.5 px-4">
                        <span style={{ color: 'var(--text-0)' }} className="text-[14px] font-medium tracking-wider">{c.symbol}</span>
                      </td>

                      {/* Name + sparkbar */}
                      <td className="py-3.5 px-4">
                        <span style={{ color: 'var(--text-300)' }} className="text-[12px] font-sans block">{c.name}</span>
                        <SparkBars id={c.id} />
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right">
                        <span style={{ color: 'var(--text-0)' }} className="text-[14px] font-medium tabular-nums">
                          {formatPrice(c.price)}
                        </span>
                      </td>

                      {/* Change $ */}
                      <td className="py-3.5 px-4 text-right">
                        <span style={{ color: up ? 'var(--success-400)' : 'var(--danger-400)' }} className="text-[12px] tabular-nums">
                          {sign}{c.change.toFixed(2)}
                        </span>
                      </td>

                      {/* % Move pill */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          style={{
                            color: up ? 'var(--success-400)' : 'var(--danger-400)',
                            backgroundColor: up ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          }}
                          className="inline-flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums px-2 py-1 rounded"
                        >
                          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {sign}{c.changePercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile list */}
            <div className="sm:hidden">
              {sorted.map((c, i) => {
                const up   = c.changePercent >= 0;
                const sign = up ? '+' : '';
                return (
                  <div
                    key={c.symbol}
                    style={{
                      borderTopColor: 'var(--border-subtle)',
                    }}
                    className="flex items-center justify-between px-4 py-3.5 border-t first:border-t-0"
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'var(--text-300)' }} className="text-[10px] w-4 shrink-0">{i + 1}</span>
                      <div>
                        <p style={{ color: 'var(--text-0)' }} className="text-[14px] font-medium tracking-wider">{c.symbol}</p>
                        <p style={{ color: 'var(--text-300)' }} className="text-[11px] font-sans">{c.name}</p>
                        <SparkBars id={c.id} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p style={{ color: 'var(--text-0)' }} className="text-[14px] font-medium tabular-nums">{formatPrice(c.price)}</p>
                      <span
                        style={{
                          color: up ? 'var(--success-400)' : 'var(--danger-400)',
                          backgroundColor: up ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        }}
                        className="inline-flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums mt-1 px-2 py-0.5 rounded"
                      >
                        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {sign}{c.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              borderTopColor: 'var(--border-subtle)',
              backgroundColor: 'var(--glass-white-xs)',
            }} className="flex items-center justify-between px-4 py-2.5 border-t">
              <span style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.15em] uppercase font-sans">
                {cryptoData.length} assets
              </span>
              <span style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.15em] uppercase font-sans flex items-center gap-2">
                <span style={{ backgroundColor: 'var(--success-500)' }} className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" />
                Live · 60s interval
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom rule ── */}
      <div style={{ borderTopColor: 'var(--border-subtle)' }} className="mt-5 pt-3.5 border-t flex items-center justify-between">
        <span style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.2em] uppercase font-sans">
          CoinGecko API
        </span>
        <span style={{ color: 'var(--text-300)' }} className="text-[10px] tracking-[0.2em] uppercase font-sans">
          USD · Real-time market data
        </span>
      </div>

    </div>
  );
}