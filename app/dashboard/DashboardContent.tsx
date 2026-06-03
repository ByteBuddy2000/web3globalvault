'use client';

import { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, SendHorizontal, Repeat,
  Copy, Check, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Activity, BarChart2,
  BedDouble, TriangleAlert, Shield,
  ArrowUp, ArrowDown,
  PieChart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import StockDashboard from './components/StockDashboard';
import CryptoDashboard from './components/CryptoDashboard';
import BalanceCard from './components/BalanceCard';
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
  const color = positive ? 'var(--success-500)' : 'var(--danger-500)';
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
function Action({
  icon, label, onClick, accent = 'var(--brand-500)'
}: {
  icon: React.ReactNode; label: string; onClick: () => void; accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="action-btn"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      <div className="action-icon">{icon}</div>
      <span className="action-label">{label}</span>
    </button>
  );
}

/* ─── KPI Chip — horizontal scrollable strip ────────────────── */
function KPIChip({
  label, value, delta, icon, accent = 'var(--brand-500)'
}: {
  label: string; value: string; delta?: number; icon: React.ReactNode; accent?: string;
}) {
  const isPos = delta === undefined || delta >= 0;
  return (
    <div className="kpi-chip" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="kpi-chip-icon">{icon}</div>
      <div className="kpi-chip-body">
        <span className="kpi-chip-label">{label}</span>
        <span className="kpi-chip-value">{value}</span>
        {delta !== undefined && (
          <span className="kpi-chip-delta" style={{ color: isPos ? 'var(--success-400)' : 'var(--danger-400)' }}>
            {isPos ? <ArrowUp size={8} /> : <ArrowDown size={8} />}
            {Math.abs(delta).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Asset Row ─────────────────────────────────────────────── */
function AssetRow({ a, price, value }: { a: Asset; price: number; value: number }) {
  const [imgErr, setImgErr] = useState(false);
  const chg = a.changePercent ?? 0;
  const isPos = chg >= 0;
  const imagePath = a.image || getAssetImagePath(a.symbol, a.type);

  return (
    <div className="dashboard-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', overflow: 'hidden', width: 36, height: 36, flexShrink: 0, borderRadius: 'var(--radius-sm)' }}>
          {!imgErr ? (
            <Image
              src={imagePath} alt={a.name} width={36} height={36}
              className="object-cover" onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--glass-brand-md), var(--glass-white-sm))',
              fontSize: 12, fontWeight: 700, color: 'var(--text-0)',
            }}>
              {a.symbol?.[0]}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-0)', marginBottom: 1 }}>{a.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-300)' }}>
            {a.quantity?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {a.symbol}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkline positive={isPos} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-0)', marginBottom: 2 }}>${fmt(value)}</div>
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
  const statusColor = isCompleted ? 'var(--success-400)' : isPending ? 'var(--warning-400)' : 'var(--danger-400)';
  const statusBg = isCompleted ? 'var(--success-glow)' : isPending ? 'var(--warning-glow)' : 'var(--danger-glow)';
  const date = tx.date ? new Date(tx.date) : null;
  const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';
  const isCredit = tx.type?.toLowerCase().includes('deposit') || tx.type?.toLowerCase().includes('receive');

  return (
    <div className="dashboard-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 'var(--radius-xs)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCredit ? 'var(--success-glow)' : 'var(--danger-glow)',
          border: `1px solid ${isCredit ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: isCredit ? 'var(--success-400)' : 'var(--danger-400)', flexShrink: 0,
        }}>
          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-0)', marginBottom: 1 }}>{tx.type}</div>
          <div style={{ fontSize: 9, color: 'var(--text-400)' }}>{tx.asset} · {dateStr}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isCredit ? 'var(--success-400)' : 'var(--text-0)', marginBottom: 2 }}>
          {isCredit ? '+' : '-'}${tx.amount?.toLocaleString()}
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 5px',
          borderRadius: 'var(--radius-xs)', textTransform: 'uppercase', color: statusColor,
          background: statusBg, border: `1px solid ${statusColor}`,
          opacity: 0.9,
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
      <p style={{ fontSize: 12, color: 'var(--text-200)', lineHeight: 1.6 }}>
        Select a network and send your deposit to the wallet address below.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['BTC', 'USDT'] as const).map(c => (
          <button key={c} onClick={() => setCoin(c)} style={{
            flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
            background: coin === c ? 'var(--glass-brand-md)' : 'var(--glass-white-xs)',
            border: `1px solid ${coin === c ? 'var(--border-brand-strong)' : 'var(--border-subtle)'}`,
            color: coin === c ? 'var(--brand-300)' : 'var(--text-300)',
          }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        borderRadius: 'var(--radius-md)', background: 'var(--glass-brand-xs)',
        border: '1px solid var(--border-brand)',
      }}>
        <span style={{ fontSize: 11, flex: 1, wordBreak: 'break-all', color: 'var(--text-200)', fontFamily: 'var(--font-mono)' }}>
          {wallets[coin]}
        </span>
        <button onClick={handleCopy} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
          cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
          background: copied ? 'var(--success-glow)' : 'var(--glass-brand-md)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--border-brand)'}`,
          color: copied ? 'var(--success-400)' : 'var(--brand-300)',
        }}>
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{
        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
        background: 'var(--warning-glow)', border: '1px solid rgba(249,115,22,0.25)',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <Shield size={12} style={{ color: 'var(--warning-400)', marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 10, color: 'var(--text-200)', lineHeight: 1.6, margin: 0 }}>
          Only send <strong style={{ color: 'var(--text-0)' }}>{coin}</strong> to this address. Sending other assets may result in permanent loss.
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
      className="theme-modal-backdrop"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="theme-modal-panel"
        style={{ padding: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-0)', margin: 0, letterSpacing: 'var(--tracking-tight)', fontFamily: 'var(--font-display)' }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 'var(--radius-xs)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--glass-white-sm)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-200)', cursor: 'pointer', outline: 'none', fontSize: 16, lineHeight: 1,
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
  const [activeTab,     setActiveTab]     = useState<'assets' | 'transactions'>('assets');
  const router = useRouter();

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

  const handleTopUp    = () => router.push('/dashboard/deposit');
  const handleHistory  = () => router.push('/dashboard/transactions');

  const totalInvestmentNumber = userData?.totalInvestment ?? 0;
  const assetBalance          = assetSummary?.totalBalance ?? 0;
  const investmentReturns     = userData?.returnRate ?? 0;
  const returnRatePercent     = parseFloat(userData?.returnRateChange ?? '0') || 0;

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[120, 56, 200, 280, 240].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     LAYOUT ORDER (mobile-first, single column):
     1. Hero Balance Card            ← full width always
     2. KPI Strip                    ← horizontal scroll
     3. Quick Actions                ← horizontal scroll
     4. Holdings / Transactions      ← tabbed list
     5. Charts                       ← stacked; side-by-side lg
     6. Card Preview                 ← bottom; decorative
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Scoped styles */}
      <style>{`
        /* ── Action buttons ── */
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          outline: none;
          background: var(--glass-white-xs);
          border: 1px solid var(--border-subtle);
          transition: background var(--duration-fast) var(--ease-out),
                      border-color var(--duration-fast) var(--ease-out),
                      transform var(--duration-fast) var(--ease-spring);
          min-width: 58px;
          flex-shrink: 0;
        }
        .action-btn:hover {
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          border-color: color-mix(in srgb, var(--accent) 35%, transparent);
          transform: translateY(-2px);
        }
        .action-icon {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          color: var(--accent);
          transition: transform var(--duration-fast) var(--ease-spring);
        }
        .action-btn:hover .action-icon {
          transform: scale(1.1);
        }
        .action-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          color: var(--text-300);
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── KPI chips ── */
        .kpi-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .kpi-strip::-webkit-scrollbar { display: none; }

        .kpi-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: var(--glass-white-xs);
          border: 1px solid var(--border-subtle);
          min-width: 140px;
          position: relative;
          overflow: hidden;
          transition: border-color var(--duration-fast) var(--ease-out);
        }
        .kpi-chip::before {
          content: '';
          position: absolute;
          right: -10px; top: -10px;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
          pointer-events: none;
        }
        .kpi-chip-icon {
          width: 30px; height: 30px;
          border-radius: var(--radius-xs);
          display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--accent) 16%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          color: var(--accent);
          flex-shrink: 0;
        }
        .kpi-chip-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .kpi-chip-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-300);
        }
        .kpi-chip-value {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-0);
          letter-spacing: var(--tracking-tight);
          font-family: var(--font-mono);
          line-height: 1;
        }
        .kpi-chip-delta {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 9px;
          font-weight: 700;
        }

        /* ── Section header ── */
        .section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-300);
          margin-bottom: 10px;
        }

        /* ── Tab bar ── */
        .tab-bar {
          display: flex;
          gap: 4px;
          padding: 4px;
          border-radius: var(--radius-sm);
          background: var(--glass-white-xs);
          border: 1px solid var(--border-subtle);
          width: fit-content;
          margin-bottom: 14px;
        }
        .tab-btn {
          padding: 6px 14px;
          border-radius: calc(var(--radius-sm) - 2px);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          outline: none;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-300);
          transition: all var(--duration-fast) var(--ease-out);
        }
        .tab-btn.active {
          background: var(--glass-brand-md);
          border-color: var(--border-brand);
          color: var(--brand-300);
        }

        /* ── Chart card header ── */
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .chart-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Scroll strips ── */
        .action-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .action-strip::-webkit-scrollbar { display: none; }

        /* ── Card preview row ── */
        .card-preview-wrap {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .card-preview-wrap {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* ── Charts grid ── */
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ══════════════════════════════════════════════════════
            1. HERO BALANCE CARD — always full width
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <BalanceCard
            userData={userData}
            copiedAcct={copiedAcct}
            onCopyAccount={handleCopyAccount}
            onTopUp={handleTopUp}
            onHistory={handleHistory}
          />
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            2. KPI STRIP — scrollable chips
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          <div className="kpi-strip">
            <KPIChip
              label="Growth"
              value={`${userData?.portfolioGrowth ?? '0.00'}%`}
              delta={parseFloat(userData?.portfolioGrowthChange ?? '0') || 0}
              accent="var(--brand-500)"
              icon={<TrendingUp size={13} />}
            />
            <KPIChip
              label="Mkt Value"
              value={marketLoading ? '···' : `$${fmt(assetBalance)}`}
              delta={0.85}
              accent="var(--success-500)"
              icon={<Activity size={13} />}
            />
            <KPIChip
              label="Returns"
              value={`$${fmt(investmentReturns)}`}
              delta={returnRatePercent}
              accent="var(--warning-500)"
              icon={<BarChart2 size={13} />}
            />
            <KPIChip
              label="Portfolio"
              value={`$${fmt(totalInvestmentNumber)}`}
              accent="var(--brand-300)"
              icon={<PieChart size={13} />}
            />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            3. QUICK ACTIONS — scrollable strip
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
        >
          <div className="action-strip">
            <Action icon={<ArrowDownLeft size={13} />} label="Deposit"  accent="var(--success-500)" onClick={() => router.push('/dashboard/deposit')} />
            <Action icon={<ArrowUpRight size={13} />}  label="Withdraw" accent="var(--danger-500)"  onClick={() => router.push('/dashboard/withdraw')} />
            <Action icon={<TrendingUp size={13} />}    label="Invest"   accent="var(--brand-500)"   onClick={() => router.push('/dashboard/my-investment')} />
            <Action icon={<Repeat size={13} />}        label="Swap"     accent="var(--warning-500)" onClick={() => router.push('/dashboard/swap')} />
            <Action icon={<SendHorizontal size={13} />} label="Transfer" accent="var(--brand-300)"  onClick={() => router.push('/dashboard/transfer-money')} />
            <Action icon={<Wallet size={13} />}        label="Cards"    accent="var(--brand-500)"   onClick={() => router.push('/dashboard/cards')} />
            <Action icon={<TriangleAlert size={13} />} label="FBI"      accent="var(--danger-400)"  onClick={() => router.push('/dashboard/fbi')} />
            <Action icon={<BedDouble size={13} />}     label="Medbed"   accent="var(--brand-300)"   onClick={() => router.push('/dashboard/medbed')} />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            4. HOLDINGS / TRANSACTIONS — tabbed
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className="dashboard-card"
        >
          <div className="tab-bar">
            {(['assets', 'transactions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              >
                {tab === 'assets' ? 'Holdings' : 'Transactions'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeTab === 'assets' ? (
              assets.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-400)', textAlign: 'center', padding: '28px 0' }}>No assets yet.</p>
              ) : (
                assets.map(a => (
                  <AssetRow
                    key={a._id} a={a}
                    price={marketPrices[a.symbol] ?? a.price ?? 0}
                    value={(marketPrices[a.symbol] ?? a.price ?? 0) * (a.quantity ?? 0)}
                  />
                ))
              )
            ) : (
              transactions.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-400)', textAlign: 'center', padding: '28px 0' }}>No transactions yet.</p>
              ) : (
                transactions.map(tx => <TxRow key={tx._id} tx={tx} />)
              )
            )}
          </div>

          <button
            onClick={() => router.push(activeTab === 'assets' ? '/dashboard/assets' : '/dashboard/transactions')}
            style={{
              marginTop: 12, width: '100%', padding: '8px 0',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: 'var(--brand-300)', background: 'transparent',
              border: '1px solid var(--border-brand)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'background var(--duration-fast) var(--ease-out)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-brand-xs)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            View All →
          </button>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            5. CHARTS — stacked mobile, side-by-side lg
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="charts-grid"
        >
          <div className="dashboard-card">
            <div className="chart-header">
              <div className="chart-header-left">
                <span className="dashboard-title">Performance</span>
                <span className="dashboard-badge dashboard-badge-success">LIVE</span>
              </div>
            </div>
            <StockDashboard />
          </div>

          <div className="dashboard-card">
            <div className="chart-header">
              <div className="chart-header-left">
                <span className="dashboard-title">Market</span>
                <span className="dashboard-badge dashboard-badge-warning">LIVE</span>
              </div>
            </div>
            <CryptoDashboard />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            6. CARD PREVIEW — bottom decorative section
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.45 }}
          className="dashboard-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="dashboard-title">Your Card</span>
            <button
              onClick={() => router.push('/dashboard/cards')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: 'var(--brand-300)', background: 'transparent',
                border: 'none', cursor: 'pointer', textTransform: 'uppercase',
                transition: 'color var(--duration-fast) var(--ease-out)',
              }}
            >
              Manage <ChevronRight size={10} />
            </button>
          </div>
          <CardDisplay />
        </motion.div>

      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeposit && (
          <Modal title="Deposit Crypto" onClose={() => setShowDeposit(false)}>
            <CryptoDeposit />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}