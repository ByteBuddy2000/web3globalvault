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
          className={b.up ? 'bg-emerald-500/60' : 'bg-red-400/60'}
          style={{ width: 3, height: b.h, borderRadius: 1 }}
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
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1 font-sans">
            Crypto Market
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-white leading-none font-sans">
            Live Prices
          </h1>
        </div>

        <div className="flex items-center gap-3 pb-0.5">
          {lastUpdated && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/30 font-sans">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSortAsc((s) => !s)}
            className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-white/40 hover:text-white/80 transition border border-white/10 hover:border-white/20 rounded px-3 py-1.5 font-sans"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortAsc ? 'Price ASC' : 'Price DESC'}
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {!loading && !error && cryptoData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/8 border border-white/8 rounded-lg overflow-hidden mb-5">
          {[
            {
              label: 'Advancing',
              value: gainers,
              cls: 'text-emerald-400',
            },
            {
              label: 'Declining',
              value: losers,
              cls: 'text-red-400',
            },
            {
              label: 'Avg Move',
              value: avgMove !== null
                ? `${avgMove >= 0 ? '+' : ''}${avgMove.toFixed(2)}%`
                : '—',
              cls: avgMove !== null && avgMove >= 0 ? 'text-emerald-400' : 'text-red-400',
            },
            {
              label: 'Top Gainer',
              value: topGainer?.symbol ?? '—',
              cls: 'text-sky-400 text-xl tracking-wide',
            },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-white/[0.03] px-5 py-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2 font-sans">{label}</p>
              <p className={`text-2xl font-medium ${cls}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="border border-white/8 rounded-lg overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-sans">Fetching prices</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-[11px] tracking-widest uppercase font-sans">{error}</span>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.025]">
                  {['#', 'Symbol', 'Name', 'Price (USD)', 'Change', '% Move'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2.5 px-4 text-[10px] tracking-[0.2em] uppercase text-white/30 font-normal font-sans ${i >= 3 ? 'text-right' : 'text-left'} ${i === 0 ? 'w-10' : ''}`}
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
                      className="border-t border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* # */}
                      <td className="py-3.5 px-4 text-[11px] text-white/20">{i + 1}</td>

                      {/* Symbol */}
                      <td className="py-3.5 px-4">
                        <span className="text-[14px] font-medium tracking-wider text-white">{c.symbol}</span>
                      </td>

                      {/* Name + sparkbar */}
                      <td className="py-3.5 px-4">
                        <span className="text-[12px] text-white/40 font-sans block">{c.name}</span>
                        <SparkBars id={c.id} />
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[14px] font-medium text-white tabular-nums">
                          {formatPrice(c.price)}
                        </span>
                      </td>

                      {/* Change $ */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`text-[12px] tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sign}{c.change.toFixed(2)}
                        </span>
                      </td>

                      {/* % Move pill */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums px-2 py-1 rounded ${
                            up
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
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
                    className="flex items-center justify-between px-4 py-3.5 border-t border-white/[0.05] first:border-t-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/20 w-4 shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-[14px] font-medium text-white tracking-wider">{c.symbol}</p>
                        <p className="text-[11px] text-white/30 font-sans">{c.name}</p>
                        <SparkBars id={c.id} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium text-white tabular-nums">{formatPrice(c.price)}</p>
                      <span
                        className={`inline-flex items-center justify-end gap-1 text-[11px] font-medium tabular-nums mt-1 px-2 py-0.5 rounded ${
                          up
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
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
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/6 bg-white/[0.02]">
              <span className="text-[10px] tracking-[0.15em] uppercase text-white/25 font-sans">
                {cryptoData.length} assets
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-white/25 font-sans flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live · 60s interval
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom rule ── */}
      <div className="mt-5 pt-3.5 border-t border-white/6 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/20 font-sans">
          CoinGecko API
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/20 font-sans">
          USD · Real-time market data
        </span>
      </div>

    </div>
  );
}