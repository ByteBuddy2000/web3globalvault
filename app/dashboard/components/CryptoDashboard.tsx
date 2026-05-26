'use client';

import { TrendingUp, TrendingDown, ArrowUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const CRYPTOS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
];

type Crypto = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState<Crypto[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const ids = CRYPTOS.map((c) => c.id).join(',');
        const res = await fetch(`/api/coingecko?ids=${ids}`);
        if (!res.ok) throw new Error(`API returned status ${res.status}`);

        const data = await res.json();
        console.log('Crypto API response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Transform API response to component format
        const merged = CRYPTOS.map((cryptoInfo) => {
          const priceData = data[cryptoInfo.id];
          const currentPrice = priceData?.usd || 0;
          const previousPrice = prevPrices[cryptoInfo.id] || currentPrice;
          const change = currentPrice - previousPrice;
          const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

          return {
            id: cryptoInfo.id,
            name: cryptoInfo.name,
            symbol: cryptoInfo.symbol,
            price: currentPrice,
            change,
            changePercent,
          };
        }).filter(item => item.price > 0); // Only show cryptos with prices

        setCryptoData(merged);
        
        // Update previous prices for next comparison
        const newPrevPrices: Record<string, number> = {};
        CRYPTOS.forEach(c => {
          newPrevPrices[c.id] = data[c.id]?.usd || 0;
        });
        setPrevPrices(newPrevPrices);
        setLastUpdated(new Date());

        if (merged.length === 0) {
          setError('No crypto data available');
        }
      } catch (err: any) {
        console.error('Crypto fetch error:', err);
        setError(`Error: ${err.message || 'Unable to load crypto data. Please try again later.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const sortedData = [...cryptoData].sort((a, b) =>
    sortAsc ? a.price - b.price : b.price - a.price
  );

  const gainers = cryptoData.filter((c) => c.change >= 0).length;
  const losers = cryptoData.length - gainers;
  const avgChange =
    cryptoData.length > 0
      ? cryptoData.reduce((acc, c) => acc + c.changePercent, 0) / cryptoData.length
      : null;
  const topGainer = cryptoData.length > 0
    ? cryptoData.reduce((a, b) => a.changePercent > b.changePercent ? a : b)
    : null;

  return (
    <div className="w-full max-w-350 mx-auto px-4 sm:px-8 py-8 font-mono">

      {/* ── Top bar ── */}
      <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-2">
            Crypto Market
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-none">
            Live Prices
          </h1>
        </div>
        <div className="flex items-center gap-6 pb-0.5">
          {lastUpdated && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSortAsc((s) => !s)}
            className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-muted hover:text-white transition border-b border-transparent hover:border-white/30 pb-0.5"
          >
            <ArrowUpDown className="w-3 h-3" />
            Price {sortAsc ? 'ASC' : 'DESC'}
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {!loading && !error && cryptoData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/6 border border-white/6 mb-8">
          <div className="bg-black/40 px-5 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Advancing</p>
            <p className="text-3xl font-bold text-green-400">{gainers}</p>
          </div>
          <div className="bg-black/40 px-5 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Declining</p>
            <p className="text-3xl font-bold text-red-400">{losers}</p>
          </div>
          <div className="bg-black/40 px-5 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Avg Move</p>
            <p className={`text-3xl font-bold ${avgChange !== null && avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgChange !== null ? `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—'}
            </p>
          </div>
          <div className="bg-black/40 px-5 py-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Top Gainer</p>
            <p className="text-3xl font-bold text-accent truncate">
              {topGainer ? topGainer.symbol : '—'}
            </p>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="border border-white/6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-[11px] tracking-widest uppercase">Fetching prices</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span className="text-[11px] tracking-widest uppercase">{error}</span>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="py-3 px-5 text-left text-[10px] tracking-[0.2em] uppercase text-muted font-normal w-12">#</th>
                  <th className="py-3 px-4 text-left text-[10px] tracking-[0.2em] uppercase text-muted font-normal">Symbol</th>
                  <th className="py-3 px-4 text-left text-[10px] tracking-[0.2em] uppercase text-muted font-normal">Name</th>
                  <th className="py-3 px-4 text-right text-[10px] tracking-[0.2em] uppercase text-muted font-normal">Price (USD)</th>
                  <th className="py-3 px-4 text-right text-[10px] tracking-[0.2em] uppercase text-muted font-normal">Change</th>
                  <th className="py-3 px-5 text-right text-[10px] tracking-[0.2em] uppercase text-muted font-normal">% Change</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((crypto, i) => {
                  const isUp = crypto.change >= 0;
                  return (
                    <tr
                      key={crypto.symbol}
                      className="border-t border-white/4 hover:bg-white/2.5 transition-colors"
                    >
                      <td className="py-4 px-5 text-[11px] text-muted">{i + 1}</td>
                      <td className="py-4 px-4">
                        <span className="text-[15px] font-bold tracking-wide text-white">{crypto.symbol}</span>
                      </td>
                      <td className="py-4 px-4 text-[13px] text-muted">{crypto.name}</td>
                      <td className="py-4 px-4 text-right text-[14px] font-semibold text-white tabular-nums">
                        ${crypto.price.toFixed(2)}
                      </td>
                      <td className={`py-4 px-4 text-right text-[13px] tabular-nums ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{crypto.change.toFixed(2)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className={`inline-flex items-center justify-end gap-1.5 text-[12px] font-semibold tabular-nums ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isUp
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />
                          }
                          {isUp ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="sm:hidden">
              {sortedData.map((crypto, i) => {
                const isUp = crypto.change >= 0;
                return (
                  <div
                    key={crypto.symbol}
                    className="flex items-center justify-between px-4 py-3.5 border-t border-white/4 first:border-t-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted w-4 shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-[14px] font-bold text-white tracking-wide">{crypto.symbol}</p>
                        <p className="text-[11px] text-muted">{crypto.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-white tabular-nums">${crypto.price.toFixed(2)}</p>
                      <p className={`text-[11px] font-semibold tabular-nums flex items-center justify-end gap-1 mt-0.5 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/6 bg-black/20">
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted">
                {cryptoData.length} assets
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent animate-pulse inline-block" />
                Live · 60s interval
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom rule ── */}
      <div className="mt-6 pt-4 border-t border-white/6 flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted/50">
          CoinGecko API
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted/50">
          USD · Real-time market data
        </span>
      </div>

    </div>
  );
