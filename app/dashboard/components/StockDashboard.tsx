'use client';

import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export default function StockDashboard() {
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const symbols = STOCKS.map((s) => s.symbol).join(',');
        const res = await fetch(`/api/stock-prices?symbols=${symbols}`);

        if (!res.ok) throw new Error('Failed to fetch stock data');

        const data = await res.json();

        if (Array.isArray(data.result)) {
          const merged = data.result.map((item: any) => {
            const info = STOCKS.find((s) => s.symbol === item.symbol);
            return {
              ...item,
              name: info?.name || item.symbol,
            };
          });

          setStockData(merged);
          setLastUpdated(new Date());
        }
      } catch {
        setError('Unable to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const sortedData = [...stockData].sort((a, b) =>
    sortAsc ? a.price - b.price : b.price - a.price
  );

  const gainers = stockData.filter((s) => s.change >= 0).length;
  const losers = stockData.length - gainers;

  const avgChange =
    stockData.length > 0
      ? stockData.reduce((acc, s) => acc + s.changePercent, 0) /
        stockData.length
      : 0;

  const topGainer =
    stockData.length > 0
      ? stockData.reduce((a, b) =>
          a.changePercent > b.changePercent ? a : b
        )
      : null;

  return (
    <div className="w-full space-y-6 font-mono">

      {/* ─── HEADER ─── */}
      <div className="flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40">
            NYSE · NASDAQ
          </p>
          <h1 className="text-2xl font-bold text-white">
            Market Watch
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-white/40">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={() => setSortAsc((s) => !s)}
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50 hover:text-white transition"
          >
            <ArrowUpDown className="w-3 h-3" />
            Price {sortAsc ? 'ASC' : 'DESC'}
          </button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      {!loading && !error && stockData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <div className="dashboard-card">
            <p className="text-[10px] text-white/40 uppercase">Advancing</p>
            <p className="text-2xl font-bold text-green-400">{gainers}</p>
          </div>

          <div className="dashboard-card">
            <p className="text-[10px] text-white/40 uppercase">Declining</p>
            <p className="text-2xl font-bold text-red-400">{losers}</p>
          </div>

          <div className="dashboard-card">
            <p className="text-[10px] text-white/40 uppercase">Avg Move</p>
            <p
              className={`text-2xl font-bold ${
                avgChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {avgChange >= 0 ? '+' : ''}
              {avgChange.toFixed(2)}%
            </p>
          </div>

          <div className="dashboard-card">
            <p className="text-[10px] text-white/40 uppercase">
              Top Gainer
            </p>
            <p className="text-2xl font-bold text-indigo-400">
              {topGainer?.symbol || '—'}
            </p>
          </div>
        </div>
      )}

      {/* ─── CONTENT ─── */}
      <div className="dashboard-card overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <p className="text-xs uppercase tracking-widest">
              Fetching market data...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <p className="text-xs uppercase tracking-widest text-center">
              {error}
            </p>
          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="border-b border-white/10">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-white/40">
                    <th className="py-3 px-4">#</th>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Change</th>
                    <th className="text-right">% Change</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedData.map((stock, i) => {
                    const isUp = stock.change >= 0;

                    return (
                      <tr
                        key={stock.symbol}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-3 px-4 text-white/40 text-xs">
                          {i + 1}
                        </td>

                        <td className="font-bold text-white">
                          {stock.symbol}
                        </td>

                        <td className="text-white/50 text-xs">
                          {stock.name}
                        </td>

                        <td className="text-right font-semibold text-white tabular-nums">
                          ${stock.price.toFixed(2)}
                        </td>

                        <td
                          className={`text-right tabular-nums ${
                            isUp ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {stock.change.toFixed(2)}
                        </td>

                        <td className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              isUp ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {isUp ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isUp ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-4 text-[10px] text-white/40 border-t border-white/10 pt-3">
              <span>{stockData.length} instruments</span>

              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 animate-pulse rounded-full" />
                Live · 60s refresh
              </span>
            </div>
          </>
        )}
      </div>

      {/* ─── FOOT NOTE ─── */}
      <div className="text-[10px] text-white/30 flex justify-between">
        <span>Data delayed ~15 min</span>
        <span>USD · Market feed</span>
      </div>
    </div>
  );
}