'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

interface CryptoPriceTickerProps {
  /**
   * Array of crypto symbols to display
   * @default ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']
   */
  symbols?: string[];

  /**
   * Scroll speed in milliseconds
   * @default 30000
   */
  scrollSpeed?: number;

  /**
   * API endpoint to fetch prices
   * @default '/api/coingecko'
   */
  apiEndpoint?: string;

  /**
   * Custom class name for container
   */
  className?: string;
}

export default function CryptoPriceTicker({
  symbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE'],
  scrollSpeed = 30000,
  apiEndpoint = '/api/coingecko',
  className = '',
}: CryptoPriceTickerProps) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Symbol -> CoinGecko ID mapping
        const coinMap: Record<string, string> = {
          BTC: 'bitcoin',
          ETH: 'ethereum',
          XRP: 'ripple',
          SOL: 'solana',
          ADA: 'cardano',
          DOGE: 'dogecoin',
          USDT: 'tether',
          TON: 'the-open-network',
        };

        // Convert symbols to CoinGecko IDs
        const ids = symbols
          .map((symbol) => coinMap[symbol.toUpperCase()])
          .filter(Boolean);

        if (ids.length === 0) {
          throw new Error('No valid coin IDs');
        }

        const url = `${apiEndpoint}?ids=${ids.join(',')}`;

        console.log('Fetching:', url);

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

        console.log('Price data:', data);

        const transformed: CryptoData[] = symbols.map((symbol) => {
          const coinId = coinMap[symbol.toUpperCase()];

          return {
            symbol,
            price: data[coinId]?.usd || 0,
            change24h: 0,
            changePercent24h: 0,
          };
        });

        setCryptos(transformed);
      } catch (err) {
        console.error('Crypto ticker error:', err);
        setError('Failed to load crypto prices');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, [apiEndpoint, symbols]);

  if (error) {
    return (
      <div
        className={`flex items-center px-3 py-2 rounded-lg text-xs font-mono ${className}`}
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger-400)',
        }}
      >
        {error}
      </div>
    );
  }

  if (loading || cryptos.length === 0) {
    return (
      <div
        className={`flex items-center px-3 py-2 rounded-lg text-xs font-mono ${className}`}
        style={{ color: 'var(--text-300)' }}
      >
        Loading prices...
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes crypto-scroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .crypto-ticker-scroll {
          animation: crypto-scroll ${scrollSpeed}ms linear infinite;
          width: max-content;
        }

        .crypto-ticker-container:hover .crypto-ticker-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className={`crypto-ticker-container flex items-center overflow-hidden rounded-lg px-3 py-2 ${className}`}
        style={{
          background: 'rgba(123, 47, 255, 0.05)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <div className="crypto-ticker-scroll flex gap-6 whitespace-nowrap">
          {[...cryptos, ...cryptos].map((crypto, idx) => (
            <div
              key={`${crypto.symbol}-${idx}`}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--brand-400)',
                }}
              >
                {crypto.symbol[0]}
              </div>

              <span
                className="text-xs font-bold tracking-widest"
                style={{ color: 'var(--text-100)' }}
              >
                {crypto.symbol}
              </span>

              <span
                className="text-xs font-mono"
                style={{ color: 'var(--text-200)' }}
              >
                $
                {crypto.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              <div className="flex items-center gap-1">
                {crypto.changePercent24h >= 0 ? (
                  <>
                    <TrendingUp
                      size={12}
                      style={{ color: 'var(--success-400)' }}
                    />

                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: 'var(--success-400)' }}
                    >
                      +{crypto.changePercent24h.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown
                      size={12}
                      style={{ color: 'var(--danger-400)' }}
                    />

                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: 'var(--danger-400)' }}
                    >
                      {crypto.changePercent24h.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}