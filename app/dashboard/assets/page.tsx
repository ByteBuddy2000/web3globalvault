'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Search, RefreshCw, Wallet, BarChart2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Asset = {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  price?: number;
  change?: number;
  changePercent?: number;
};

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'SOL'];

const CRYPTO_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', SOL: '◎',
};

async function fetchLivePrices(assets: Asset[]): Promise<Record<string, { price: number; change: number; changePercent: number }>> {
  const result: Record<string, { price: number; change: number; changePercent: number }> = {};

  const cryptos = assets.filter(a => CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase()));
  const stocks  = assets.filter(a => !CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase()));

  await Promise.allSettled([
    // Crypto prices
    (async () => {
      if (!cryptos.length) return;
      const idsMap: Record<string, string> = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', SOL: 'solana' };
      const ids = cryptos.map(a => idsMap[a.symbol]).filter(Boolean).join(',');
      const res = await fetch(`/api/coingecko?ids=${encodeURIComponent(ids)}`);
      if (!res.ok) return;
      const data = await res.json();
      for (const a of cryptos) {
        const id = idsMap[a.symbol];
        if (data[id]?.usd) {
          result[a.symbol] = { price: data[id].usd, change: 0, changePercent: 0 };
        }
      }
    })(),

    // Stock prices
    (async () => {
      if (!stocks.length) return;
      const syms = stocks.map(a => a.symbol).join(',');
      const res = await fetch(`/api/stock-prices?symbols=${encodeURIComponent(syms)}`);
      if (!res.ok) return;
      const data = await res.json();
      for (const item of data.result || []) {
        result[item.symbol] = {
          price: item.price ?? 0,
          change: item.change ?? 0,
          changePercent: item.changePercent ?? 0,
        };
      }
    })(),
  ]);

  return result;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; change: number; changePercent: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, sCryptoilter] = useState<'all' | 'crypto' | 'stock'>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/assets', { credentials: 'include' });
      const data = await res.json();
      const fetched: Asset[] = data.assets || [];
      setAssets(fetched);

      if (fetched.length) {
        const prices = await fetchLivePrices(fetched);
        setLivePrices(prices);
      }

      setLastUpdated(new Date());
    } catch {
      //
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Derived
  const filteredAssets = assets.filter(a => {
    const matchesType =
      filter === 'all' ? true :
      filter === 'crypto' ? CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase()) :
      !CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase());
    const matchesSearch =
      !search ||
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalValue = assets.reduce((sum, a) => {
    const p = livePrices[a.symbol]?.price ?? a.price ?? 0;
    return sum + p * (a.quantity ?? 0);
  }, 0);

  const totalCryptoValue = assets
    .filter(a => CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase()))
    .reduce((sum, a) => sum + (livePrices[a.symbol]?.price ?? a.price ?? 0) * (a.quantity ?? 0), 0);

  const totalStockValue = assets
    .filter(a => !CRYPTO_SYMBOLS.includes(a.symbol.toUpperCase()))
    .reduce((sum, a) => sum + (livePrices[a.symbol]?.price ?? a.price ?? 0) * (a.quantity ?? 0), 0);

  function fmt(n: number, digits = 2) {
    return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  }

  const isCrypto = (symbol: string) => CRYPTO_SYMBOLS.includes(symbol.toUpperCase());

  /* ── Skeleton ── */
  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
          @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .sk { background: linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%);
            background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 10px; }
        `}</style>
        <div style={{ padding: '28px', fontFamily: "'DM Mono', monospace" }}>
          <div className="sk" style={{ height: 36, width: 220, marginBottom: 28 }} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {[1,2,3].map(i => <div key={i} className="sk" style={{ flex: 1, height: 88 }} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="sk" style={{ height: 64 }} />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .asset-row:hover { background: rgba(251,191,36,0.04) !important; border-color: rgba(251,191,36,0.1) !important; }
        .filter-btn:hover { border-color: rgba(251,191,36,0.25) !important; color: #fbbf24 !important; }
        .refresh-btn:hover { background: rgba(255,255,255,0.07) !important; color: #f9fafb !important; }
      `}</style>

      <div style={{ padding: '28px 0', fontFamily: "'DM Mono', monospace" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f9fafb', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
              My Assets
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#4b5563', letterSpacing: '0.06em' }}>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading prices...'}
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            className="refresh-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#6b7280', fontSize: 11, cursor: 'pointer',
              outline: 'none', transition: 'all 0.18s',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </motion.div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { title: 'Total Portfolio', value: `$${fmt(totalValue)}`, icon: <Wallet size={13} />, delay: 0.05 },
            { title: 'Crypto Holdings', value: `$${fmt(totalCryptoValue)}`, icon: <BarChart2 size={13} />, delay: 0.1 },
            { title: 'Stock Holdings',  value: `$${fmt(totalStockValue)}`,  icon: <ArrowUpRight size={13} />, delay: 0.15 },
          ].map(card => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay, duration: 0.35 }}
              style={{
                background: 'rgba(17,19,24,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '18px 20px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {card.title}
                </span>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fbbf24',
                }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter + Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
          style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}
        >
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'crypto', 'stock'] as const).map(f => (
              <button
                key={f}
                onClick={() => sCryptoilter(f)}
                className={filter !== f ? 'filter-btn' : ''}
                style={{
                  padding: '7px 14px', borderRadius: 9,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: "'DM Mono', monospace",
                  cursor: 'pointer', outline: 'none', transition: 'all 0.18s',
                  background: filter === f ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filter === f ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: filter === f ? '#fbbf24' : '#6b7280',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{
            flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8,
            background: searchFocused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${searchFocused ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 10, padding: '0 12px', height: 36,
            transition: 'all 0.2s',
            boxShadow: searchFocused ? '0 0 0 3px rgba(251,191,36,0.06)' : 'none',
          }}>
            <Search size={12} color={searchFocused ? '#fbbf24' : '#374151'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
            <input
              type="text"
              placeholder="Search by name or symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 12, color: '#9ca3af',
                fontFamily: "'DM Mono', monospace",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>

          <span style={{ fontSize: 10, color: '#374151', letterSpacing: '0.06em', flexShrink: 0 }}>
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Table header */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '8px 16px', marginBottom: 6,
          }}
        >
          {['Asset', 'Type', 'Holdings', 'Price', 'Value'].map(h => (
            <span key={h} style={{ fontSize: 9, color: '#374151', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </motion.div>

        {/* Asset rows */}
        {filteredAssets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'rgba(17,19,24,0.5)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16, color: '#374151', fontSize: 13,
            }}
          >
            {search ? `No assets matching "${search}"` : 'No assets found.'}
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredAssets.map((asset, i) => {
              const live = livePrices[asset.symbol];
              const price = live?.price ?? asset.price ?? 0;
              const changePercent = live?.changePercent ?? asset.changePercent ?? 0;
              const change = live?.change ?? asset.change ?? 0;
              const value = price * (asset.quantity ?? 0);
              const positive = changePercent >= 0;
              const portfolioPct = totalValue > 0 ? (value / totalValue) * 100 : 0;
              const crypto = isCrypto(asset.symbol);

              return (
                <motion.div
                  key={asset._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className="asset-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: 'rgba(17,19,24,0.7)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 14,
                    transition: 'all 0.18s',
                    cursor: 'default',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* Asset info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: 'rgba(251,191,36,0.08)',
                      border: '1px solid rgba(251,191,36,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: crypto ? 16 : 13, fontWeight: 700,
                      color: '#fbbf24',
                    }}>
                      {CRYPTO_ICONS[asset.symbol] || asset.symbol?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb', letterSpacing: '0.02em' }}>
                        {asset.symbol}
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  {/* Type badge */}
                  <div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                      padding: '3px 8px', borderRadius: 5,
                      background: crypto ? 'rgba(251,191,36,0.1)' : 'rgba(99,200,255,0.1)',
                      color: crypto ? '#fbbf24' : '#63c8ff',
                      border: `1px solid ${crypto ? 'rgba(251,191,36,0.2)' : 'rgba(99,200,255,0.2)'}`,
                    }}>
                      {crypto ? 'CRYPTO' : 'STOCK'}
                    </span>
                  </div>

                  {/* Holdings */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb' }}>
                      {asset.quantity?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                      {asset.symbol}
                    </div>
                  </div>

                  {/* Price + change */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb' }}>
                      {price > 0 ? `$${fmt(price)}` : '--'}
                    </div>
                    {changePercent !== 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 3, marginTop: 2,
                        fontSize: 10, color: positive ? '#4ade80' : '#f87171',
                      }}>
                        {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {positive ? '+' : ''}{changePercent.toFixed(2)}%
                      </div>
                    )}
                  </div>

                  {/* Value + portfolio % */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>
                      ${fmt(value)}
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', width: 80 }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(portfolioPct, 100)}%`,
                          background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                          borderRadius: 2,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <div style={{ fontSize: 9, color: '#4b5563', marginTop: 2, letterSpacing: '0.06em' }}>
                        {portfolioPct.toFixed(1)}% of portfolio
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 10, color: '#1f2937', letterSpacing: '0.06em' }}>
          Prices update every 60s · Powered by CoinGecko & Finnhub
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}