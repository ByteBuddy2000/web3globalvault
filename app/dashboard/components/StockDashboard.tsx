'use client';

import { Activity, SortAsc, SortDesc, Loader2, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'NFLX', name: 'NCryptolix' },
];

export default function StockDashboard() {
  const [stockData, setStockData] = useState<any[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }
      } catch (err: any) {
        console.error('Stock fetch error:', err);
        setError('Unable to load stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const sortedData = [...stockData].sort((a, b) =>
    sortAsc ? a.price - b.price : b.price - a.price
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-8 card rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-accent flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" /> Live Stock Market
        </h2>
        <button type="button" className="px-3 py-2 bg-black/20 border border-white/6 rounded-xl text-sm text-white transition" onClick={() => setSortAsc((s) => !s)}>
          {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />} Sort by Price
        </button>
      </div>

      {/* Table / Loader / Error */}
      <div className="card rounded-xl shadow-lg overflow-x-auto p-2 sm:p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-accent" /> Loading live stock prices...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8 text-red-400">
            <AlertCircle className="w-6 h-6 mr-2" /> {error}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="w-full text-left text-white border-collapse hidden sm:table">
              <thead>
                <tr className="bg-black/20 text-sm text-muted">
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Price (USD)</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">% Change</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="border-t border-white/6 hover:bg-white/4 transition"
                  >
                    <td className="py-3 px-4 font-semibold">{stock.symbol}</td>
                    <td className="py-3 px-4">{stock.name}</td>
                    <td className="py-3 px-4">${stock.price.toFixed(2)}</td>
                    <td
                      className={`py-3 px-4 ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stock.change.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stock.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden grid gap-3">
              {sortedData.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-3 bg-gray-700/30 rounded-lg border border-gray-600 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">${stock.price.toFixed(2)}</div>
                    <div
                      className={`text-sm ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
