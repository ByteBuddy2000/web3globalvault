'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowDownUp, ChevronDown, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Asset = {
  symbol: string;
  name: string;
  quantity: number;
  type: string;
};

type AssetPrice = {
  price: number;
};

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', type: 'crypto', icon: '₮' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', icon: '◎' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', icon: '' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', icon: '' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', icon: '' },
];

async function fetchUserAssets(): Promise<Asset[]> {
  try {
    const res = await fetch('/api/assets', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.assets || []).map((a: any) => ({
      symbol: a.symbol,
      name: a.name,
      quantity: a.quantity,
      type: a.type,
    }));
  } catch {
    return [];
  }
}

async function fetchLivePrices(symbols: string[]): Promise<Record<string, AssetPrice>> {
  const prices: Record<string, AssetPrice> = {};
  if (!symbols.length) return prices;

  try {
    const cryptoSymbols = symbols.filter((s) => ['BTC', 'ETH', 'USDT', 'SOL'].includes(s));
    if (cryptoSymbols.length) {
      const idsMap: Record<string, string> = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', SOL: 'solana' };
      const ids = cryptoSymbols.map((s) => idsMap[s]).join(',');
      try {
        const res = await fetch(`/api/coingecko?ids=${encodeURIComponent(ids)}`);
        if (res.ok) {
          const data = await res.json();
          for (const symbol of cryptoSymbols) {
            prices[symbol] = { price: Number(data[idsMap[symbol]]?.usd ?? 0) };
          }
        }
      } catch { }
      for (const symbol of cryptoSymbols) {
        if (!(symbol in prices)) prices[symbol] = { price: 0 };
      }
    }

    const stockSymbols = symbols.filter((s) => !['BTC', 'ETH', 'USDT', 'SOL'].includes(s));
    if (stockSymbols.length) {
      try {
        const res = await fetch(`/api/stock-prices?symbols=${stockSymbols.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          const results = data.result || data.quoteResponse?.result || [];
          for (const q of results) {
            prices[q.symbol] = { price: Number(q.price ?? q.regularMarketPrice ?? 0) };
          }
        }
      } catch { }
      for (const symbol of stockSymbols) {
        if (!(symbol in prices)) prices[symbol] = { price: 0 };
      }
    }
  } catch { }

  return prices;
}

function AssetTag({ type }: { type: string }) {
  const isCrypto = type === 'crypto';
  return (
    <span
      style={{
        fontSize: '10px',
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: '0.08em',
        padding: '2px 7px',
        borderRadius: '4px',
        background: isCrypto ? 'rgba(251,191,36,0.12)' : 'rgba(99,200,255,0.12)',
        color: isCrypto ? '#fbbf24' : '#63c8ff',
        border: `1px solid ${isCrypto ? 'rgba(251,191,36,0.25)' : 'rgba(99,200,255,0.25)'}`,
      }}
    >
      {isCrypto ? 'CRYPTO' : 'STOCK'}
    </span>
  );
}

function AssetSelector({
  label,
  value,
  onChange,
  balance,
  price,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  balance?: number;
  price?: number;
}) {
  const [open, setOpen] = useState(false);
  const asset = SUPPORTED_ASSETS.find((a) => a.symbol === value);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          fontSize: '10px',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.12em',
          color: '#6b7280',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(251,191,36,0.3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#fbbf24',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {asset?.icon || asset?.symbol?.[0]}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#f9fafb', fontSize: '15px' }}>
              {value}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{asset?.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {asset && <AssetTag type={asset.type} />}
          <ChevronDown
            size={14}
            color="#6b7280"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#111318',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 50,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {SUPPORTED_ASSETS.map((a) => (
            <button
              key={a.symbol}
              onClick={() => { onChange(a.symbol); setOpen(false); }}
              style={{
                width: '100%',
                padding: '11px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: a.symbol === value ? 'rgba(251,191,36,0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (a.symbol !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (a.symbol !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', width: '20px', textAlign: 'center', color: '#fbbf24', fontFamily: 'monospace' }}>
                  {a.icon}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#f9fafb', fontSize: '13px' }}>
                  {a.symbol}
                </span>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>{a.name}</span>
              </div>
              <AssetTag type={a.type} />
            </button>
          ))}
        </div>
      )}

      {/* Balance / rate row */}
      {(balance !== undefined || price !== undefined) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            padding: '0 4px',
          }}
        >
          {balance !== undefined && (
            <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: "'DM Mono', monospace" }}>
              Balance:{' '}
              <span style={{ color: '#fbbf24' }}>
                {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {value}
              </span>
            </span>
          )}
          {price !== undefined && price > 0 && (
            <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: "'DM Mono', monospace" }}>
              ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function SwapPage() {
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [assetPrices, setAssetPrices] = useState<Record<string, AssetPrice>>({});
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const assets = await fetchUserAssets();
        setUserAssets(assets);
        const symbolSet = new Set<string>();
        assets.forEach((a) => symbolSet.add(a.symbol));
        SUPPORTED_ASSETS.forEach((s) => symbolSet.add(s.symbol));
        const livePrices = await fetchLivePrices(Array.from(symbolSet));
        const prices: Record<string, AssetPrice> = {};
        Array.from(symbolSet).forEach((sym) => {
          prices[sym] = { price: Number(livePrices[sym]?.price ?? 0) };
        });
        setAssetPrices(prices);
      } catch {
        toast.error('Failed to load assets or prices');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const userFromBalance = userAssets.find((a) => a.symbol === fromAsset)?.quantity ?? 0;
  const fromPrice = assetPrices[fromAsset]?.price ?? 0;
  const toPrice = assetPrices[toAsset]?.price ?? 0;
  const usdEquivalent = amount && !isNaN(Number(amount)) ? Number(amount) * fromPrice : 0;
  const conversionResult = fromPrice && toPrice && amount ? (Number(amount) * fromPrice) / toPrice : 0;
  const rate = fromPrice && toPrice ? fromPrice / toPrice : 0;

  const validateSwap = useCallback(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Enter a valid amount';
    if (fromAsset === toAsset) return 'Choose different assets';
    if (Number(amount) > userFromBalance) return 'Insufficient balance';
    if (fromPrice === 0 || toPrice === 0) return 'Price unavailable';
    return null;
  }, [amount, fromAsset, toAsset, userFromBalance, fromPrice, toPrice]);

  const handleFlip = () => {
    setFlipping(true);
    setAmount('');
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setTimeout(() => setFlipping(false), 400);
  };

  const performSwap = async () => {
    const err = validateSwap();
    if (err) { toast.error(err); return; }
    setSwapping(true);
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAsset, toAsset, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.message || 'Swap failed'); return; }

      const toAmountFormatted = data.data?.toAmount
        ? Number(data.data.toAmount).toLocaleString(undefined, { maximumFractionDigits: 8 })
        : conversionResult.toLocaleString(undefined, { maximumFractionDigits: 8 });

      toast.success(`Swapped ${amount} ${fromAsset} → ${toAmountFormatted} ${toAsset}`);
      const assets = await fetchUserAssets();
      setUserAssets(assets);
      setAmount('');
      const symbolSet = new Set<string>();
      assets.forEach((a) => symbolSet.add(a.symbol));
      SUPPORTED_ASSETS.forEach((s) => symbolSet.add(s.symbol));
      setAssetPrices(await fetchLivePrices(Array.from(symbolSet)));
    } catch {
      toast.error('Server error');
    } finally {
      setSwapping(false);
    }
  };

  const validationError = validateSwap();
  const canSwap = !validationError && !swapping;
  const pctOfBalance = userFromBalance > 0 && Number(amount) > 0
    ? Math.min((Number(amount) / userFromBalance) * 100, 100)
    : 0;

  if (loading) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '2px solid rgba(251,191,36,0.15)',
              borderTopColor: '#fbbf24',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ fontFamily: "'DM Mono', monospace", color: '#4b5563', fontSize: '12px', letterSpacing: '0.1em' }}>
            LOADING ASSETS...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes flipIn {
          0%   { transform: rotateX(0deg); }
          50%  { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
        }

        .swap-card { animation: fadeUp 0.4s ease both; }
        .swap-card input[type=number]::-webkit-inner-spin-button,
        .swap-card input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .swap-card input[type=number] { -moz-appearance: textfield; }

        .flip-btn:hover .flip-icon { transform: rotate(180deg); }
        .flip-icon { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .cta-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(251,191,36,0.35) !important;
        }
        .cta-btn:not(:disabled):active { transform: translateY(0); }
        .cta-btn { transition: all 0.2s ease; }

        .quick-pct:hover { background: rgba(251,191,36,0.12) !important; color: #fbbf24 !important; border-color: rgba(251,191,36,0.3) !important; }
      `}</style>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          fontFamily: "'DM Mono', monospace",
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }} className="swap-card">

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '28px', height: '28px',
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Zap size={14} color="#fbbf24" />
              </div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: '26px',
                  color: '#f9fafb',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Swap
              </h1>
            </div>
            <p style={{ color: '#4b5563', fontSize: '12px', margin: 0, letterSpacing: '0.04em' }}>
              Instant cross-asset exchange · 1% fee
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: 'rgba(17,19,24,0.9)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* FROM */}
            <AssetSelector
              label="From"
              value={fromAsset}
              onChange={setFromAsset}
              balance={userFromBalance}
              price={fromPrice}
            />

            {/* Amount Input */}
            <div style={{ margin: '16px 0' }}>
              <div
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: '#6b7280',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Amount
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="any"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${Number(amount) > userFromBalance && amount ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    color: '#f9fafb',
                    fontSize: '22px',
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.06)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      Number(amount) > userFromBalance && amount
                        ? 'rgba(239,68,68,0.4)'
                        : 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {usdEquivalent > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    ≈ ${usdEquivalent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Quick % buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    className="quick-pct"
                    onClick={() => setAmount(String(((userFromBalance * pct) / 100)))}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      fontSize: '10px',
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#4b5563',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Balance bar */}
              {pctOfBalance > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      height: '2px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pctOfBalance}%`,
                        background: pctOfBalance >= 100 ? '#ef4444' : '#fbbf24',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease, background 0.2s',
                      }}
                    />
                  </div>
                  {pctOfBalance >= 100 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                      <AlertCircle size={11} color="#ef4444" />
                      <span style={{ fontSize: '11px', color: '#ef4444' }}>Insufficient balance</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flip Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <button
                onClick={handleFlip}
                className="flip-btn"
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251,191,36,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(251,191,36,0.08)')}
                aria-label="Flip assets"
              >
                <ArrowDownUp size={15} color="#fbbf24" className="flip-icon" />
              </button>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* TO */}
            <AssetSelector
              label="To"
              value={toAsset}
              onChange={setToAsset}
              price={toPrice}
            />

            {/* You receive */}
            {conversionResult > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  background: 'rgba(251,191,36,0.05)',
                  border: '1px solid rgba(251,191,36,0.12)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '0.1em', marginBottom: '3px' }}>
                    YOU RECEIVE
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24', letterSpacing: '-0.01em' }}>
                    {conversionResult.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '6px' }}>{toAsset}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '0.1em', marginBottom: '3px' }}>
                    RATE
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    1 {fromAsset} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toAsset}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={performSwap}
              disabled={!canSwap}
              className="cta-btn"
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: 'none',
                cursor: canSwap ? 'pointer' : 'not-allowed',
                background: canSwap
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: canSwap ? '#111' : '#4b5563',
                fontSize: '14px',
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: canSwap ? '0 4px 20px rgba(251,191,36,0.25)' : 'none',
              }}
            >
              {swapping ? (
                <>
                  <div
                    style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(17,19,24,0.3)',
                      borderTopColor: '#111',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  EXECUTING...
                </>
              ) : (
                <>
                  <Zap size={15} />
                  {validationError ? validationError.toUpperCase() : 'SWAP NOW'}
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <TrendingUp size={11} color="#374151" />
            <span style={{ fontSize: '11px', color: '#374151', letterSpacing: '0.04em' }}>
              Live market data · Powered by CoinGecko & Finnhub
            </span>
          </div>
        </div>
      </main>
    </>
  );
}