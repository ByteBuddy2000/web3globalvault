'use client';

import Image from 'next/image';
import { ArrowUpRight, TrendingUp, ArrowDownLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const previewAssets = assets.slice(0, PREVIEW_LIMIT);
  const previewTxns   = transactions.slice(0, PREVIEW_LIMIT);

  // Responsive grid columns
  const assetGridCols = isMobile 
    ? '1fr' 
    : isTablet 
    ? '1fr 80px 100px' 
    : '1fr 100px 120px 90px';
  
  const txnGridCols = isMobile 
    ? '1fr' 
    : isTablet 
    ? '1fr 100px' 
    : '1fr 110px 120px 100px';

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Header bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 0,
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
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {(['assets', 'transactions'] as const).map((tab) => {
            const isActive = active === tab;
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 14px',
                  borderRadius: 8,
                  fontSize: isMobile ? 10 : 11,
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
                  flex: isMobile ? 1 : 'auto',
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
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: 5,
            fontSize: isMobile ? 11 : 12,
            fontWeight: 600,
            color: 'var(--brand-400)',
            background: isMobile ? 'var(--surface-200)' : 'transparent',
            border: isMobile ? '1px solid var(--border-subtle)' : 'none',
            borderRadius: isMobile ? 8 : 0,
            cursor: 'pointer',
            letterSpacing: '0.03em',
            transition: 'opacity var(--duration-fast) var(--ease-out)',
            fontFamily: 'var(--font-body)',
            padding: isMobile ? '8px 14px' : '0',
            width: isMobile ? '100%' : 'auto',
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
                display: isMobile ? 'none' : 'grid',
                gridTemplateColumns: assetGridCols,
                padding: isTablet ? '8px 12px' : '10px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-300)',
              }}
            >
              {isMobile ? null : (
                <>
                  {(isTablet ? ['Asset', 'Type', 'Value'] : ['Asset', 'Type', 'Value', 'Qty']).map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: isTablet ? 9 : 10,
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
                </>
              )}
            </div>

            {previewAssets.length === 0 ? (
              <EmptyState label="No holdings yet" />
            ) : (
              <>
                {previewAssets.map((asset, i) => {
                  const value = asset.quantity * (marketPrices[asset.symbol] || asset.price || 0);
                  
                  if (isMobile) {
                    return (
                      <div
                        key={asset._id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: i < previewAssets.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          transition: 'background var(--duration-fast) var(--ease-out)',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-white-xs)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <AssetIcon symbol={asset.symbol} />
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: 0,
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                            }}>
                              {asset.name}
                            </p>
                            <p style={{
                              margin: '2px 0 0 0',
                              fontSize: 10,
                              color: 'var(--text-300)',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {asset.symbol}
                            </p>
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--text-0)',
                          }}>
                            ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: 4,
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
                          }}>
                            {asset.type || 'N/A'}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--text-200)',
                          }}>
                            {asset.quantity} {asset.symbol}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={asset._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: assetGridCols,
                        alignItems: 'center',
                        padding: isTablet ? '12px 12px' : '14px 20px',
                        borderBottom: i < previewAssets.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        transition: 'background var(--duration-fast) var(--ease-out)',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-white-xs)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Asset name + symbol */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <AssetIcon symbol={asset.symbol} />
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: isTablet ? 12 : 13,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '-0.01em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
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
                          fontSize: isTablet ? 8 : 9,
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
                          fontSize: isTablet ? 12 : 13,
                          fontWeight: 600,
                          color: 'var(--text-0)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>

                      {/* Qty - hidden on tablet */}
                      {!isTablet && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            color: 'var(--text-200)',
                          }}
                        >
                          {asset.quantity} <span style={{ color: 'var(--text-300)', fontSize: 10 }}>{asset.symbol}</span>
                        </span>
                      )}
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
                display: isMobile ? 'none' : 'grid',
                gridTemplateColumns: txnGridCols,
                padding: isTablet ? '8px 12px' : '10px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-300)',
              }}
            >
              {isMobile ? null : (
                <>
                  {(isTablet ? ['Transaction', 'Amount'] : ['Transaction', 'Type', 'Amount', 'Status']).map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: isTablet ? 9 : 10,
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
                </>
              )}
            </div>

            {previewTxns.length === 0 ? (
              <EmptyState label="No transactions yet" />
            ) : (
              <>
                {previewTxns.map((txn, i) => {
                  const IconComp = typeIconMap[txn.type.toLowerCase()]?.icon || Clock;
                  const iconColor = typeIconMap[txn.type.toLowerCase()]?.color || 'var(--text-300)';
                  
                  if (isMobile) {
                    return (
                      <div
                        key={txn._id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: i < previewTxns.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          transition: 'background var(--duration-fast) var(--ease-out)',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-white-xs)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: 'var(--glass-white-xs)',
                          }}>
                            <IconComp size={16} style={{ color: iconColor }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: 0,
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                            }}>
                              {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                            </p>
                            <p style={{
                              margin: '2px 0 0 0',
                              fontSize: 10,
                              color: 'var(--text-300)',
                            }}>
                              {txn.date ? new Date(txn.date).toLocaleDateString() : '—'}
                            </p>
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--text-0)',
                          }}>
                            ${typeof txn.amount === 'number' ? txn.amount.toFixed(2) : txn.amount}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <StatusBadge status={txn.status} />
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'var(--text-300)',
                          }}>
                            {txn.asset || 'N/A'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={txn._id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: txnGridCols,
                        alignItems: 'center',
                        padding: isTablet ? '12px 12px' : '14px 20px',
                        borderBottom: i < previewTxns.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        transition: 'background var(--duration-fast) var(--ease-out)',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-white-xs)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Transaction description */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: 'var(--glass-white-xs)',
                            flexShrink: 0,
                          }}
                        >
                          <IconComp size={16} style={{ color: iconColor }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: isTablet ? 12 : 13,
                              fontWeight: 600,
                              color: 'var(--text-0)',
                              fontFamily: 'var(--font-display)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)} - {txn.asset || 'N/A'}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 10,
                              color: 'var(--text-300)',
                              marginTop: 2,
                            }}
                          >
                            {txn.date ? new Date(txn.date).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Type - hidden on tablet */}
                      {!isTablet && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            justifyContent: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: iconColor,
                              fontFamily: 'var(--font-display)',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {txn.type.slice(0, 3)}
                          </span>
                        </div>
                      )}

                      {/* Amount */}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: isTablet ? 12 : 13,
                          fontWeight: 600,
                          color: 'var(--text-0)',
                        }}
                      >
                        ${typeof txn.amount === 'number' ? txn.amount.toFixed(2) : txn.amount}
                      </span>

                      {/* Status - hidden on tablet */}
                      {!isTablet && <StatusBadge status={txn.status} />}
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