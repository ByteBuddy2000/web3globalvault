

'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Wallet, TrendingUp, SendHorizontal, Repeat,
  Copy, Check, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Activity, BarChart2, Clock, BedDouble,
  TriangleAlert, Eye, EyeOff, Zap, Shield, Globe,
  ArrowUp, ArrowDown, Minus, Bell, Settings, User,
  ChevronDown, MoreHorizontal, Layers, PieChart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import StockDashboard from './components/StockDashboard';
import CryptoDashboard from './components/CryptoDashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─────────────────────────────────────────────────── */
type Asset = {
  _id: string; name: string; symbol: string; type: string;
  quantity: number; price?: number; change?: number; changePercent?: number; image?: string;
};
type Transaction = {
  _id: string; type: string; asset: string;
  amount: number; status: string; date: string;
};

/* ─── Helpers ───────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function getAssetImagePath(symbol: string, type: string): string {
  const isCrypto = type === 'crypto' || type === 'Crypto';
  
  // Stock symbol to filename mapping
  const stockSymbolMap: Record<string, string> = {
    'NFLX': 'netflix',
    'AMZN': 'amazon',
    'MSFT': 'microsoft',
    'TSLA': 'tesla',
    'V': 'visa',
    'BABA': 'alibaba',
    'GOOGL': 'google',
    'IN': 'intel',
    'DIS': 'disney',
    'amd': 'amd',
    'me': 'meta',
    'APPL': 'apple'
    
  };
  
  if (isCrypto) {
    return `/asset/crypto/${symbol.toLowerCase()}.png`;
  } else {
    const filename = stockSymbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
    return `/asset/stock/${filename}.png`;
  }
}

/* ─── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ positive = true }: { positive?: boolean }) {
  const pts = [40,45,42,55,50,60,58,70,65,80,75,85];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map(p => 100 - ((p - min) / (max - min)) * 80 - 10);
  const path = norm.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 100},${y}`).join(' ');
  const fill = `${path} L100,100 L0,100 Z`;
  const color = positive ? '#10b981' : '#f43f5e';
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${positive})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Asset type tag ────────────────────────────────────────── */
function Tag({ type }: { type: string }) {
  const isCrypto = type === 'crypto' || type === 'Crypto';
  return (
    <span className={`dashboard-tag ${isCrypto ? 'dashboard-tag-crypto' : 'dashboard-tag-stock'}`}>
      {isCrypto ? 'CRYPTO' : 'STOCK'}
    </span>
  );
}


/* ─── Metric Card ───────────────────────────────────────────── */
function MetricCard({
  label, value, sub, icon, accent = '#6366f1', delta, delay = 0,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  accent?: string; delta?: number; delay?: number;
}) {
  const isPos = !delta || delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1, minWidth: 0, padding: '18px 20px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${accent}20, transparent 70%)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span className="dashboard-metric-label">
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}18`, border: `1px solid ${accent}35`, color: accent,
        }}>
          {icon}
        </div>
      </div>
      <div className="dashboard-metric-value">
        {value}
      </div>
      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {delta !== undefined && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 2,
              fontSize: 11, fontWeight: 700,
              color: isPos ? '#10b981' : '#f43f5e',
            }}>
              {isPos ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
              {Math.abs(delta).toFixed(2)}%
            </span>
          )}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Quick Action ──────────────────────────────────────────── */
function Action({ icon, label, onClick, accent = '#6366f1' }: {
  icon: React.ReactNode; label: string; onClick: () => void; accent?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 64, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, padding: '14px 8px', borderRadius: 14, cursor: 'pointer', outline: 'none',
        background: hov ? `${accent}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? `${accent}40` : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accent}15`, border: `1px solid ${accent}30`, color: accent,
        transition: 'all 0.2s ease',
        transform: hov ? 'scale(1.08)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </button>
  );
}

/* ─── Asset Row ─────────────────────────────────────────────── */
function AssetRow({ a, price, value }: { a: Asset; price: number; value: number }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const chg = a.changePercent ?? 0;
  const isPos = chg >= 0;
  const imagePath = a.image || getAssetImagePath(a.symbol, a.type);
  
  return (
    <div
      className="dashboard-row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="dashboard-asset-icon" style={{ position: 'relative', overflow: 'hidden', width: 52, height: 52, flexShrink: 0 }}>
          {!imgErr ? (
            <Image
              src={imagePath}
              alt={a.name}
              width={52}
              height={52}
              className="rounded-lg object-cover"
              onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.2))',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff'
            }}>
              {a.symbol?.[0]}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{a.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            {a.quantity?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {a.symbol}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Sparkline positive={isPos} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>${fmt(value)}</div>
          <Tag type={a.type} />
        </div>
      </div>
    </div>
  );
}

/* ─── Transaction Row ───────────────────────────────────────── */
function TxRow({ tx }: { tx: Transaction }) {
  const [hov, setHov] = useState(false);
  const s = String(tx.status ?? '').toLowerCase().trim();
  const isCompleted = s === 'completed';
  const isPending   = s === 'pending';
  const statusColor = isCompleted ? '#10b981' : isPending ? '#f59e0b' : '#f43f5e';
  const date = tx.date ? new Date(tx.date) : null;
  const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';
  const isCredit = tx.type?.toLowerCase().includes('deposit') || tx.type?.toLowerCase().includes('receive');
  return (
    <div
      className="dashboard-row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCredit ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.10)',
          border: `1px solid ${isCredit ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          color: isCredit ? '#10b981' : '#f43f5e',
        }}>
          {isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{tx.type}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{tx.asset} · {dateStr}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isCredit ? '#10b981' : '#fff', marginBottom: 3 }}>
          {isCredit ? '+' : '-'}${tx.amount?.toLocaleString()}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 6px',
          borderRadius: 4, textTransform: 'uppercase',
          color: statusColor,
          background: `${statusColor}15`,
          border: `1px solid ${statusColor}30`,
        }}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}

/* ─── Section Panel ─────────────────────────────────────────── */
function Panel({
  title, badge, onMore, delay = 0, children,
}: {
  title: string; badge?: string; onMore?: () => void; delay?: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="dashboard-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dashboard-title">{title}</span>
          {badge && (
            <span className="dashboard-badge">
              {badge}
            </span>
          )}
        </div>
        {onMore && (
          <button
            onClick={onMore}
            style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', color: '#6366f1', background: 'none', border: 'none',
              cursor: 'pointer', textTransform: 'uppercase', outline: 'none',
            }}
          >
            View all <ChevronRight size={10} />
          </button>
        )}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Crypto Deposit ────────────────────────────────────────── */
function CryptoDeposit() {
  const wallets: Record<string, string> = {
    BTC:  'bc1qpycmsxnlarnay4jgwa3y535m802qevq7ffnp5x',
    USDT: '0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3',
  };
  const [coin, setCoin]     = useState<'BTC' | 'USDT'>('BTC');
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallets[coin]);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
        Select a network and send your deposit to the wallet address below.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['BTC', 'USDT'] as const).map(c => (
          <button key={c} onClick={() => setCoin(c)} style={{
            flex: 1, padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
            background: coin === c ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${coin === c ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.08)'}`,
            color: coin === c ? '#818cf8' : 'rgba(255,255,255,0.4)',
          }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        borderRadius: 12, background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.18)',
      }}>
        <span style={{ fontSize: 11, flex: 1, wordBreak: 'break-all', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
          {wallets[coin]}
        </span>
        <button onClick={handleCopy} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          outline: 'none', transition: 'all 0.2s',
          background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.14)',
          border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'rgba(99,102,241,0.35)'}`,
          color: copied ? '#10b981' : '#818cf8',
        }}>
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <Shield size={12} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
          Only send <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{coin}</strong> to this address. Sending other assets may result in permanent loss.
        </p>
      </div>
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        alignItems: 'flex-end', justifyContent: 'center', padding: 16,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, borderRadius: 20, padding: 24,
          background: '#0d0d14', border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', outline: 'none', fontSize: 16, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function DashboardContent() {
  const [userData,      setUserData]      = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [assets,        setAssets]        = useState<Asset[]>([]);
  const [transactions,  setTransactions]  = useState<Transaction[]>([]);
  const [assetSummary,  setAssetSummary]  = useState<{ totalBalance: number } | null>(null);
  const [marketPrices,  setMarketPrices]  = useState<Record<string, number>>({});
  const [marketLoading, setMarketLoading] = useState(false);
  const [showDeposit,   setShowDeposit]   = useState(false);
  const [copiedAcct,    setCopiedAcct]    = useState(false);
  const [currentTime,   setCurrentTime]   = useState('');
  const [showBalance,   setShowBalance]   = useState(true);
  const [activeTab,     setActiveTab]     = useState<'assets'|'transactions'>('assets');
  const router = useRouter();

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(setUserData).catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/assets?summary=1', { credentials: 'include' })
      .then(r => r.json()).then(setAssetSummary).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then(r => r.json()).then(d => setAssets(d.assets || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then(r => r.json()).then(d => setTransactions(d.transactions || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchPrices() {
      setMarketLoading(true);
      try {
        const symbols = assets.length
          ? Array.from(new Set(assets.map(a => a.symbol).filter(Boolean))).slice(0, 20)
          : ['AAPL', 'TSLA', 'AMZN'];
        const res  = await fetch(`/api/stock-prices?symbols=${encodeURIComponent(symbols.join(','))}`);
        const data = await res.json();
        const map: Record<string, number> = {};
        if (Array.isArray(data?.result)) {
          for (const item of data.result) {
            if (item?.symbol && typeof item.price === 'number') map[item.symbol] = item.price;
          }
        }
        if (mounted) setMarketPrices(p => ({ ...p, ...map }));
      } catch { /* silent */ }
      finally { if (mounted) setMarketLoading(false); }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, [assets]);

  const handleCopyAccount = async () => {
    if (userData?.accountNumber) {
      await navigator.clipboard.writeText(userData.accountNumber);
      setCopiedAcct(true);
      toast.success('Account number copied!');
      setTimeout(() => setCopiedAcct(false), 2000);
    }
  };

  const totalInvestmentNumber = userData?.totalInvestment ?? 0;
  const assetBalance          = assetSummary?.totalBalance ?? 0;
  const totalValueNumber      = assetBalance + (userData?.balance ?? 0);
  const investmentReturns     = userData?.returnRate ?? 0;
  const returnRatePercent     = parseFloat(userData?.returnRateChange ?? '0') || 0;

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[180, 72, 56, 240].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );

  /* ─── CSS injected once ─────────────────────────────────── */
  // Removed inline CSS - now using globals.css

  /* ── Main render ──────────────────────────────────────────── */
  return (
    <div className="dash-root" style={{ paddingTop: 8, paddingBottom: 32 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

        {/* ══ HERO BALANCE CARD ════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="dashboard-hero"
        >
          {/* Ambient orbs */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(30px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: 40, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="dashboard-metric-label" style={{ marginBottom: 8 }}>
                  Total Portfolio Value
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="dashboard-balance-text" style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {showBalance ? `$${fmt(totalValueNumber)}` : '●●●●●●'}
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    style={{
                      padding: '6px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700,
                    color: '#10b981', background: 'rgba(16,185,129,0.10)', padding: '3px 8px',
                    borderRadius: 20, border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    <ArrowUp size={10} /> {userData?.totalValueChange || '+0.00%'} today
                  </span>
                </div>
              </div>

              {/* Right: account + live clock */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="dashboard-live-dot" />
                  <span className="dash-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{currentTime}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '6px 10px', borderRadius: 10,
                }}>
                  <span className="dash-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userData?.accountNumber ?? '—'}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    style={{
                      background: 'none', border: 'none', padding: 2, cursor: 'pointer',
                      color: copiedAcct ? '#10b981' : 'rgba(255,255,255,0.3)', outline: 'none',
                      display: 'flex', transition: 'color 0.2s',
                    }}
                  >
                    {copiedAcct ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

            {/* Mini stats row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Market Value', value: marketLoading ? '···' : `$${fmt(assetBalance)}` },
                { label: 'Total Invested', value: `$${fmt(totalInvestmentNumber)}` },
                { label: 'Returns', value: `$${fmt(investmentReturns)}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="dashboard-metric-label" style={{ marginBottom: 3 }}>{label}</div>
                  <div className="dash-mono" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══ QUICK ACTIONS ════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}
        >
          <Action icon={<ArrowDownLeft size={15} />} label="Deposit"  accent="#10b981" onClick={() => router.push('/dashboard/deposit')} />
          <Action icon={<ArrowUpRight  size={15} />} label="Withdraw" accent="#f43f5e" onClick={() => router.push('/dashboard/withdraw')} />
          <Action icon={<TrendingUp    size={15} />} label="Invest"   accent="#6366f1" onClick={() => router.push('/dashboard/my-investment')} />
          <Action icon={<Repeat        size={15} />} label="Swap"     accent="#f59e0b" onClick={() => router.push('/dashboard/swap')} />
          <Action icon={<TriangleAlert size={15} />} label="FBI"      accent="#a78bfa" onClick={() => router.push('/dashboard/fbi')} />
          <Action icon={<BedDouble     size={15} />} label="Medbed"   accent="#a78bfa" onClick={() => router.push('/dashboard/medbed')} />
          <Action icon={<SendHorizontal size={15} />} label="Transfer" accent="#a78bfa" onClick={() => router.push('/dashboard/transfer-money')} />
        </motion.div>

        {/* ══ METRIC CARDS ═════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <MetricCard
            delay={0.15} label="Portfolio Growth" accent="#6366f1"
            value={`${userData?.portfolioGrowth ?? '0.00'}%`}
            sub="vs last month" delta={parseFloat(userData?.portfolioGrowthChange ?? '0') || 0}
            icon={<TrendingUp size={13} />}
          />
          <MetricCard
            delay={0.2} label="Market Value" accent="#10b981"
            value={marketLoading ? '···' : `$${fmt(assetBalance)}`}
            sub="live" delta={0.85}
            icon={<Activity size={13} />}
          />
          <MetricCard
            delay={0.25} label="Inv. Returns" accent="#f59e0b"
            value={`$${fmt(investmentReturns)}`}
            sub="all time" delta={returnRatePercent}
            icon={<BarChart2 size={13} />}
          />
          <MetricCard
            delay={0.3} label="Total Invested" accent="#a78bfa"
            value={`$${fmt(totalInvestmentNumber)}`}
            sub={userData?.totalInvestmentChange}
            icon={<PieChart size={13} />}
          />
        </div>

        {/* ══ CHARTS ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="dashboard-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dashboard-title">Portfolio Performance</span>
              <span className="dashboard-badge dashboard-badge-success">LIVE</span>
            </div>
          </div>
          <StockDashboard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="dashboard-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dashboard-title">Market Overview</span>
              <span className="dashboard-badge dashboard-badge-warning">LIVE</span>
            </div>
          </div>
          <CryptoDashboard />
        </motion.div>

        {/* ══ ASSETS + TRANSACTIONS — tabbed on mobile ═════════ */}
        <div className="xl:hidden">
          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4, padding: 4, borderRadius: 12, marginBottom: 16,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            width: 'fit-content',
          }}>
            {(['assets', 'transactions'] as const).map(tab => (
              <button
                key={tab}
                className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'assets' ? (
            <Panel title="Holdings" onMore={() => router.push('/dashboard/assets')} delay={0.2}>
              {assets.length === 0
                ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No assets yet.</p>
                : assets.slice(0, 6).map(a => (
                    <AssetRow
                      key={a._id} a={a}
                      price={marketPrices[a.symbol] ?? a.price ?? 0}
                      value={(marketPrices[a.symbol] ?? a.price ?? 0) * (a.quantity ?? 0)}
                    />
                  ))}
            </Panel>
          ) : (
            <Panel title="Transactions" onMore={() => router.push('/dashboard/transactions')} delay={0.2}>
              {transactions.length === 0
                ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No transactions yet.</p>
                : transactions.slice(0, 8).map(tx => <TxRow key={tx._id} tx={tx} />)}
            </Panel>
          )}
        </div>

        {/* ══ SIDEBAR (XL) — inline grid on larger screens ════ */}
        <div className="hidden xl:grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Panel title="Holdings" onMore={() => router.push('/dashboard/assets')} delay={0.2}>
            {assets.length === 0
              ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No assets yet.</p>
              : assets.slice(0, 6).map(a => (
                  <AssetRow
                    key={a._id} a={a}
                    price={marketPrices[a.symbol] ?? a.price ?? 0}
                    value={(marketPrices[a.symbol] ?? a.price ?? 0) * (a.quantity ?? 0)}
                  />
                ))}
          </Panel>
          <Panel title="Recent Transactions" onMore={() => router.push('/dashboard/transactions')} delay={0.25}>
            <div className="scroll-thin" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {transactions.length === 0
                ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No transactions yet.</p>
                : transactions.slice(0, 10).map(tx => <TxRow key={tx._id} tx={tx} />)}
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeposit && (
          <Modal title="Deposit Crypto" onClose={() => setShowDeposit(false)}>
            <CryptoDeposit />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
