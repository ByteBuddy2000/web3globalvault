'use client';

import { TrendingUp, TrendingDown, ArrowUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'NFLX', name: 'Netflix' },
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
        if (data.result) {
          const merged = data.result.map((item: any) => {
            const info = STOCKS.find((s) => s.symbol === item.symbol);
            return { ...item, name: info?.name || item.symbol };
          });
          setStockData(merged);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
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
      ? stockData.reduce((acc, s) => acc + s.changePercent, 0) / stockData.length
      : null;

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">
            Market Overview
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-accent flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-50" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            Live Stock Prices
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSortAsc((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 card rounded-xl text-sm text-muted hover:text-white transition border border-white/6"
          >
            <ArrowUpDown className="w-4 h-4" />
            Price {sortAsc ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && stockData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card rounded-xl p-3 sm:p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Gainers</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> {gainers}
            </p>
          </div>
          <div className="card rounded-xl p-3 sm:p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Losers</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> {losers}
            </p>
          </div>
          <div className="card rounded-xl p-3 sm:p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Avg Change</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                avgChange !== null && avgChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {avgChange !== null
                ? `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`
                : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card rounded-xl shadow-lg overflow-hidden">

        {loading ? (
          <div className="flex justify-center items-center py-16 text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-sm">Fetching live prices…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-16 text-red-400 gap-3">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full text-left text-white border-collapse hidden sm:table">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="py-3 px-5 text-xs font-semibold tracking-widest uppercase text-muted w-10">#</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-widest uppercase text-muted">Symbol</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-widest uppercase text-muted">Company</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-widest uppercase text-muted text-right">Price</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-widest uppercase text-muted text-right">Change</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-widest uppercase text-muted text-right">% Change</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((stock, i) => {
                  const isUp = stock.change >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      className="border-t border-white/6 hover:bg-white/[0.03] transition"
                    >
                      <td className="py-4 px-5 text-xs text-muted font-mono">{i + 1}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold tracking-wide text-white">{stock.symbol}</span>
                      </td>
                      <td className="py-4 px-4 text-muted text-sm">{stock.name}</td>
                      <td className="py-4 px-4 text-right font-mono font-semibold text-white">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className={`py-4 px-4 text-right font-mono text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{stock.change.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold font-mono px-2.5 py-1 rounded-lg ${
                            isUp
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-white/6">
              {sortedData.map((stock, i) => {
                const isUp = stock.change >= 0;
                return (
                  <div key={stock.symbol} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted font-mono w-4">{i + 1}</span>
                      <div>
                        <p className="font-bold text-white tracking-wide">{stock.symbol}</p>
                        <p className="text-xs text-muted">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-white">${stock.price.toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold font-mono px-2 py-0.5 rounded-md mt-0.5 ${
                          isUp
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/6">
              <span className="text-xs text-muted">{stockData.length} stocks tracked</span>
              <span className="text-xs text-muted flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Refreshes every 60s
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}