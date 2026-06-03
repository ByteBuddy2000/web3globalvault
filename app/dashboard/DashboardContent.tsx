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
import { CardDisplay } from './components/CardDisplay';
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
  const stockSymbolMap: Record<string, string> = {
    'NFLX': 'netflix', 'AMZN': 'amazon', 'MSFT': 'microsoft', 'TSLA': 'tesla',
    'V': 'visa', 'BABA': 'alibaba', 'GOOGL': 'google', 'IN': 'intel',
    'DIS': 'disney', 'amd': 'amd', 'me': 'meta', 'APPL': 'apple',
  };
  if (isCrypto) return `/asset/crypto/${symbol.toLowerCase()}.png`;
  const filename = stockSymbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  return `/asset/stock/${filename}.png`;
}

/* ─── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ positive = true }: { positive?: boolean }) {
  const pts = [40, 45, 42, 55, 50, 60, 58, 70, 65, 80, 75, 85];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map(p => 100 - ((p - min) / (max - min)) * 80 - 10);
  const path = norm.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 100},${y}`).join(' ');
  const fill = `${path} L100,100 L0,100 Z`;
  const color = positive ? '#10b981' : '#f43f5e';
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-7" preserveAspectRatio="none">
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
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, padding: '12px 10px', borderRadius: 12, cursor: 'pointer', outline: 'none',
        background: hov ? `${accent}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? `${accent}40` : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.2s ease', minWidth: 60, flex: 1,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accent}15`, border: `1px solid ${accent}30`, color: accent,
        transition: 'transform 0.2s ease',
        transform: hov ? 'scale(1.1)' : 'scale(1)',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </button>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────── */
function KPICard({ label, value, sub, icon, accent = '#6366f1', delta, delay = 0 }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  accent?: string; delta?: number; delay?: number;
}) {
  const isPos = !delta || delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: '14px 16px', borderRadius: 14,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', right: -12, top: -12, width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}25, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accent}18`, border: `1px solid ${accent}35`, color: accent,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            {delta !== undefined && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 10, fontWeight: 700,
                color: isPos ? '#10b981' : '#f43f5e',
              }}>
                {isPos ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
                {Math.abs(delta).toFixed(2)}%
              </span>
            )}
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{sub}</span>
          </div>
        )}
      </div>
    </motion.div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', overflow: 'hidden', width: 36, height: 36, flexShrink: 0, borderRadius: 9 }}>
          {!imgErr ? (
            <Image
              src={imagePath} alt={a.name} width={36} height={36}
              className="object-cover" onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', borderRadius: 9 }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.2))',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {a.symbol?.[0]}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{a.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            {a.quantity?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {a.symbol}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkline positive={isPos} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>${fmt(value)}</div>
          <Tag type={a.type} />
        </div>
      </div>
    </div>
  );
}

/* ─── Transaction Row ───────────────────────────────────────── */
function TxRow({ tx }: { tx: Transaction }) {
  const s = String(tx.status ?? '').toLowerCase().trim();
  const isCompleted = s === 'completed';
  const isPending = s === 'pending';
  const statusColor = isCompleted ? '#10b981' : isPending ? '#f59e0b' : '#f43f5e';
  const date = tx.date ? new Date(tx.date) : null;
  const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';
  const isCredit = tx.type?.toLowerCase().includes('deposit') || tx.type?.toLowerCase().includes('receive');
  return (
    <div className="dashboard-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCredit ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.10)',
          border: `1px solid ${isCredit ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          color: isCredit ? '#10b981' : '#f43f5e', flexShrink: 0,
        }}>
          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{tx.type}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{tx.asset} · {dateStr}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isCredit ? '#10b981' : '#fff', marginBottom: 2 }}>
          {isCredit ? '+' : '-'}${tx.amount?.toLocaleString()}
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 5px',
          borderRadius: 3, textTransform: 'uppercase', color: statusColor,
          background: `${statusColor}15`, border: `1px solid ${statusColor}30`,
        }}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}

/* ─── Crypto Deposit ────────────────────────────────────────── */
function CryptoDeposit() {
  const wallets: Record<string, string> = {
    BTC: 'bc1qpycmsxnlarnay4jgwa3y535m802qevq7ffnp5x',
    USDT: '0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3',
  };
  const [coin, setCoin] = useState<'BTC' | 'USDT'>('BTC');
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
  const [activeTab,     setActiveTab]     = useState<'assets' | 'transactions'>('assets');
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
        const res = await fetch(`/api/stock-prices?symbols=${encodeURIComponent(symbols.join(','))}`);
        const data = await res.json();
        const map: Record<string, number> = {};
        if (Array.isArray(data?.result)) {
          for (const item of data.result) {
            if (item?.symbol && typeof item.price === 'number') map[item.symbol] = item.price;
          }
        }
        if (mounted) setMarketPrices(p => ({ ...p, ...map }));
      } catch { }
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
      {[80, 56, 280, 240].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     LAYOUT ARCHITECTURE — Unified Responsive Grid
     ─────────────────────────────────────────────────────────
     DESKTOP (≥1024px):
       Row 1:    [Hero (1.5fr) | CardDisplay (1fr)]
       Row 2:    Quick Actions (full width)
       Row 3:    [Charts (60%) | KPI Stack (40%)]
       Row 4:    Holdings + Transactions (full width, tabbed)

     TABLET (768–1023px):
       Row 1:    Hero (full width)
       Row 2:    CardDisplay (full width)
       Row 3:    Quick Actions (full width)
       Row 4:    KPI 2x2 grid
       Row 5:    Charts (full width)
       Row 6:    Holdings + Transactions (tabbed)

     MOBILE (<768px):
       Row 1:    Hero (full width, compact)
       Row 2:    CardDisplay (full width)
       Row 3:    Quick Actions (scrollable)
       Row 4:    KPI 2-col grid
       Row 5:    Charts (full width)
       Row 6:    Holdings + Transactions (tabbed)
  ════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">

      {/* ══════════════════════════════════════════════════════
          ROW 1: HERO + INVESTMENT + CARD DISPLAY
      ══════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-4 gap-4 md:gap-5">
        {/* Hero Balance Card - 2/4 on lg */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 dashboard-hero p-4 md:p-6"
        >
          {/* Ambient orbs */}
          <div className="absolute top--40 right--40 w-44 h-44 rounded-full bg-gradient-radial from-indigo-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -bottom-5 left-16 w-32 h-32 rounded-full bg-gradient-radial from-emerald-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

          <div className="relative space-y-4 md:space-y-6">
            {/* Top row: Balance + Daily change + Time */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="text-xs font-bold tracking-widest text-white/40 uppercase mb-2">Total Portfolio Value</div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                    {showBalance ? `$${fmt(totalValueNumber)}` : '●●●●●●'}
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 w-fit">
                  <ArrowUp size={10} /> {userData?.totalValueChange || '+0.00%'} today
                </div>
              </div>

              {/* Time + Account */}
              <div className="flex flex-col gap-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/40 tabular-nums">{currentTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 px-2 py-1 rounded-lg text-xs text-white/40 font-mono">
                  <span className="truncate max-w-[100px]">{userData?.accountNumber ?? '—'}</span>
                  <button
                    onClick={handleCopyAccount}
                    className={`transition-colors ${copiedAcct ? 'text-emerald-400' : 'text-white/30 hover:text-white/50'}`}
                  >
                    {copiedAcct ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[
                { label: 'Market Value', value: marketLoading ? '···' : `$${fmt(assetBalance)}` },
                { label: 'Total Invested', value: `$${fmt(totalInvestmentNumber)}` },
                { label: 'Returns', value: `$${fmt(investmentReturns)}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs font-bold tracking-wider text-white/35 uppercase mb-1">{label}</div>
                  <div className="text-lg md:text-xl font-bold text-white/85 tabular-nums">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Investment Portfolio - 1/4 on lg */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1"
        >
          <div className="dashboard-card h-full">
            <div style={{
              padding: '14px 16px', borderRadius: 14,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              position: 'relative', overflow: 'hidden', height: '100%',
            }}>
              <div style={{
                position: 'absolute', right: -12, top: -12, width: 60, height: 60, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25), transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(167, 139, 250, 0.18)', border: '1px solid rgba(167, 139, 250, 0.35)', color: '#a78bfa',
              }}>
                <PieChart size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Investment
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  ${fmt(totalInvestmentNumber)}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: 'rgba(167, 139, 250, 0.8)', marginTop: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
                }}>
                  <ArrowUp size={8} /> Portfolio
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Display - 1/4 on lg */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-1"
        >
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Your Card</span>
              <button
                onClick={() => router.push('/dashboard/cards')}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase transition-colors"
              >
                Manage <ChevronRight size={10} />
              </button>
            </div>
            <CardDisplay />
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 2: QUICK ACTIONS
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        <Action icon={<ArrowDownLeft size={14} />} label="Deposit" accent="#10b981" onClick={() => router.push('/dashboard/deposit')} />
        <Action icon={<ArrowUpRight size={14} />} label="Withdraw" accent="#f43f5e" onClick={() => router.push('/dashboard/withdraw')} />
        <Action icon={<TrendingUp size={14} />} label="Invest" accent="#6366f1" onClick={() => router.push('/dashboard/my-investment')} />
        <Action icon={<Repeat size={14} />} label="Swap" accent="#f59e0b" onClick={() => router.push('/dashboard/swap')} />
        <Action icon={<TriangleAlert size={14} />} label="FBI" accent="#a78bfa" onClick={() => router.push('/dashboard/fbi')} />
        <Action icon={<BedDouble size={14} />} label="Medbed" accent="#a78bfa" onClick={() => router.push('/dashboard/medbed')} />
        <Action icon={<SendHorizontal size={14} />} label="Transfer" accent="#a78bfa" onClick={() => router.push('/dashboard/transfer-money')} />
        <Action icon={<Wallet size={14} />} label="Cards" accent="#6366f1" onClick={() => router.push('/dashboard/cards')} />
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          ROW 3: KPI METRICS (2x2 on md, 1x3 on lg)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <KPICard
          delay={0.15} label="Growth" accent="#6366f1"
          value={`${userData?.portfolioGrowth ?? '0.00'}%`}
          sub="vs last month" delta={parseFloat(userData?.portfolioGrowthChange ?? '0') || 0}
          icon={<TrendingUp size={14} />}
        />
        <KPICard
          delay={0.2} label="Mkt Value" accent="#10b981"
          value={marketLoading ? '···' : `$${fmt(assetBalance)}`}
          sub="live" delta={0.85}
          icon={<Activity size={14} />}
        />
        <KPICard
          delay={0.25} label="Returns" accent="#f59e0b"
          value={`$${fmt(investmentReturns)}`}
          sub="all time" delta={returnRatePercent}
          icon={<BarChart2 size={14} />}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 4: CHARTS (side-by-side on lg, stacked on mobile)
      ══════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="dashboard-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="dashboard-title">Performance</span>
            <span className="dashboard-badge dashboard-badge-success">LIVE</span>
          </div>
          <StockDashboard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="dashboard-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="dashboard-title">Market</span>
            <span className="dashboard-badge dashboard-badge-warning">LIVE</span>
          </div>
          <CryptoDashboard />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ROW 5: HOLDINGS + TRANSACTIONS (TABBED)
      ══════════════════════════════════════════════════════ */}
      <div className="dashboard-card">
        {/* Tab buttons */}
        <div className="flex gap-2 mb-4 bg-white/3 p-1 rounded-lg w-fit border border-white/6">
          {(['assets', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-400/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab === 'assets' ? 'Holdings' : 'Transactions'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-1">
          {activeTab === 'assets' ? (
            <>
              {assets.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-8">No assets yet.</p>
              ) : (
                assets.map(a => (
                  <AssetRow
                    key={a._id}
                    a={a}
                    price={marketPrices[a.symbol] ?? a.price ?? 0}
                    value={(marketPrices[a.symbol] ?? a.price ?? 0) * (a.quantity ?? 0)}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {transactions.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-8">No transactions yet.</p>
              ) : (
                transactions.map(tx => <TxRow key={tx._id} tx={tx} />)
              )}
            </>
          )}
        </div>

        {/* View All button */}
        <button
          onClick={() => router.push(activeTab === 'assets' ? '/dashboard/assets' : '/dashboard/transactions')}
          className="mt-4 w-full py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase transition-colors"
        >
          View All →
        </button>
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
          