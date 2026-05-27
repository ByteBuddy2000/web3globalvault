'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  logoUrl: string;
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
        const coinMap: Record<string, { id: string; logo: string }> = {
          BTC: { id: 'bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
          ETH: { id: 'ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
          XRP: { id: 'ripple', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp.png' },
          SOL: { id: 'solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
          ADA: { id: 'cardano', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
          DOGE: { id: 'dogecoin', logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
          USDT: { id: 'tether', logo: 'https://assets.coingecko.com/coins/images/325/small/tether.png' },
          TON: { id: 'the-open-network', logo: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png' },
        };

        // Convert symbols to CoinGecko IDs
        const ids = symbols
          .map((symbol) => coinMap[symbol.toUpperCase()]?.id)
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
          const coinData = coinMap[symbol.toUpperCase()];

          return {
            symbol,
            price: data[coinData?.id]?.usd || 0,
            change24h: 0,
            changePercent24h: 0,
            logoUrl: coinData?.logo || '',
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
          background: 'transparent',
        }}
      >
        <div className="crypto-ticker-scroll flex gap-6 whitespace-nowrap">
          {[...cryptos, ...cryptos].map((crypto, idx) => (
            <div
              key={`${crypto.symbol}-${idx}`}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {crypto.logoUrl ? (
                <Image
                  src={crypto.logoUrl}
                  alt={crypto.symbol}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full flex-shrink-0 object-contain"
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'var(--brand-400)',
                  }}
                >
                  {crypto.symbol[0]}
                </div>
              )}

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