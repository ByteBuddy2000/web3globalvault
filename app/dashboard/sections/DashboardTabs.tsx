'use client';

import Image from 'next/image';
import { ArrowUpRight, TrendingUp, ArrowDownLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Asset = {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  price?: number;
};

type Transaction = {
  _id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  date: string;
};

type Props = {
  active: 'assets' | 'transactions';
  setActive: (v: 'assets' | 'transactions') => void;
  assets: Asset[];
  transactions: Transaction[];
  marketPrices: Record<string, number>;
};

const PREVIEW_LIMIT = 5;

const typeIconMap: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  buy:     { icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'var(--success-400)', bg: 'var(--success-glow)' },
  sell:    { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'var(--danger-400)', bg: 'var(--danger-glow)' },
  deposit: { icon: <ArrowDownLeft className="w-3.5 h-3.5" />, color: 'var(--brand-400)', bg: 'var(--brand-glow-sm)' },
  default: { icon: <Clock className="w-3.5 h-3.5" />, color: 'var(--text-300)', bg: 'rgba(255,255,255,0.05)' },
};

function AssetIcon({ symbol }: { symbol: string }) {
  const [imgErr, setImgErr] = useState(false);
  
  const imagePath = `/public/asset/stock/${symbol?.toLowerCase()}.png`;

  if (imgErr) {
    return (
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--glass-brand-sm)',
          border: '1px solid var(--border-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 800,
          color: 'var(--brand-400)',
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        {symbol?.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: '1px solid var(--border-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--glass-brand-sm)',
      }}
    >
      <Image
        src={imagePath}
        alt={symbol}
        width={36}
        height={36}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={() => setImgErr(true)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    completed: {
      color: 'var(--success-400)',
      bg: 'var(--success-glow)',
      border: 'rgba(74,222,128,0.25)',
    },
    pending: {
      color: 'var(--warning-400)',
      bg: 'var(--warning-glow)',
      border: 'rgba(251,146,60,0.25)',
    },
    failed: {
      color: 'var(--danger-400)',
      bg: 'var(--danger-glow)',
      border: 'rgba(248,113,113,0.25)',
    },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
}

export default function DashboardTabs({
  active,
  setActive,
  assets,
  transactions,
  marketPrices,
}: Props) {
  const router = useRouter();

  const previewAssets = assets.slice(0, PREVIEW_LIMIT);
  const previewTxns   = transactions.slice(0, PREVIEW_LIMIT);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Header bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        {/* Tab pills */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--surface-200)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(['assets', 'transactions'] as const).map((tab) => {
            const isActive = active === tab;
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid var(--border-brand)'
                    : '1px solid transparent',
                  background: isActive ? 'var(--glass-brand-md)' : 'transparent',
                  color: isActive ? 'var(--brand-400)' : 'var(--text-300)',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  boxShadow: isActive ? 'var(--shadow-brand-sm)' : 'none',
                }}
              >
                {tab === 'assets' ? 'Holdings' : 'Transactions'}
              </button>
            );
          })}
        </div>

        {/* See all link */}
        <button
          onClick={() =>
            router.push(active === 'assets' ? '/dashboard/assets' : '/dashboard/transactions')
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--brand-400)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            transition: 'opacity var(--duration-fast) var(--ease-out)',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          See all {active === 'assets' ? 'holdings' : 'transactions'}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Table card ── */}
      <div
        style={{
          background: 'var(--surface-200)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >

        {/* ─── ASSETS TABLE ─── */}
        {active === 'assets' && (
          <>
            {/* col headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 120px 90px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-300)',
              }}
            >
              {['Asset', 'Type', 'Value', 'Qty'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-300)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {previewAssets.length === 0 ? (
              <EmptyState label="No holdings yet" />
            ) : (
              <>
                {previewAssets.map((asset, i) => {
                  const value = asset.quantity * (marketPrices[asset.symbol] || asset.price || 0);
                  return (
                    <div
                      key={asset._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 120px 90px',
                        alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom:
                          i < previewAssets.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                        transition: 'background var(--duration-fast) var(--ease-out)',
                        cursor: 'default',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.background = 'var(--glass-white-xs)')
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      {/* Asset name + symbol */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AssetIcon symbol={asset.symbol} />
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {asset.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 10,
                              color: 'var(--text-300)',
                              fontFamily: 'var(--font-mono)',
                              letterSpacing: '0.06em',
                              marginTop: 2,
                            }}
                          >
                            {asset.symbol}
                          </p>
                        </div>
                      </div>

                      {/* Type tag */}
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 4,
                          width: 'fit-content',
                          ...(asset.type?.toLowerCase() === 'crypto'
                            ? {
                                background: 'rgba(251,191,36,0.10)',
                                color: '#fbbf24',
                                border: '1px solid rgba(251,191,36,0.22)',
                              }
                            : {
                                background: 'var(--glass-brand-sm)',
                                color: 'var(--brand-300)',
                                border: '1px solid var(--border-brand)',
                              }),
                        }}
                      >
                        {asset.type || 'N/A'}
                      </span>

                      {/* Value */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-0)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>

                      {/* Qty */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: 'var(--text-200)',
                        }}
                      >
                        {asset.quantity} <span style={{ color: 'var(--text-300)', fontSize: 10 }}>{asset.symbol}</span>
                      </span>
                    </div>
                  );
                })}

                {/* Footer */}
                {assets.length > PREVIEW_LIMIT && (
                  <TableFooter
                    label={`+${assets.length - PREVIEW_LIMIT} more holdings`}
                    onClick={() => router.push('/dashboard/assets')}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ─── TRANSACTIONS TABLE ─── */}
        {active === 'transactions' && (
          <>
            {/* col headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px 120px 100px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-300)',
              }}
            >
              {['Transaction', 'Type', 'Amount', 'Status'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-300)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {previewTxns.length === 0 ? (
              <EmptyState label="No transactions yet" />
            ) : (
              <>
                {previewTxns.map((tx, i) => {
                  const meta =
                    typeIconMap[tx.type?.toLowerCase()] ?? typeIconMap.default;
                  return (
                    <div
                      key={tx._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px 100px',
                        alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom:
                          i < previewTxns.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                        transition: 'background var(--duration-fast) var(--ease-out)',
                        cursor: 'default',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.background = 'var(--glass-white-xs)')
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      {/* Asset + date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: meta.bg,
                            border: `1px solid ${meta.color}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: meta.color,
                            flexShrink: 0,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {tx.asset}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 10,
                              color: 'var(--text-300)',
                              fontFamily: 'var(--font-mono)',
                              marginTop: 2,
                            }}
                          >
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 4,
                          width: 'fit-content',
                          color: meta.color,
                          background: meta.bg,
                          border: `1px solid ${meta.color}33`,
                        }}
                      >
                        {tx.type}
                      </span>

                      {/* Amount */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-0)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        ${tx.amount.toLocaleString()}
                      </span>

                      {/* Status */}
                      <StatusBadge status={tx.status} />
                    </div>
                  );
                })}

                {/* Footer */}
                {transactions.length > PREVIEW_LIMIT && (
                  <TableFooter
                    label={`+${transactions.length - PREVIEW_LIMIT} more transactions`}
                    onClick={() => router.push('/dashboard/transactions')}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ── Sub-components ── */

function EmptyState({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--text-300)',
        fontSize: 13,
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </div>
  );
}

function TableFooter({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-300)',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-300)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <button
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--brand-400)',
          background: 'var(--glass-brand-sm)',
          border: '1px solid var(--border-brand)',
          borderRadius: 8,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--glass-brand-md)';
          e.currentTarget.style.boxShadow = 'var(--shadow-brand-sm)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--glass-brand-sm)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        View all
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}