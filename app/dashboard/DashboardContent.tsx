'use client';

import { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, SendHorizontal, Repeat,
  Copy, Check, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Activity, BarChart2, Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import StockDashboard from './components/StockDashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─────────────────────────────────────────────────── */
type Asset = {
  _id: string; name: string; symbol: string; type: string;
  quantity: number; price?: number; change?: number; changePercent?: number;
};
type Transaction = {
  _id: string; type: string; asset: string;
  amount: number; status: string; date: string;
};

/* ─── Helpers ───────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/* ─── Asset type tag ────────────────────────────────────────── */
function Tag({ type }: { type: string }) {
  const isCrypto = type === 'crypto' || type === 'Crypto';
  return (
    <span
      className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border"
      style={{
        background: isCrypto ? 'rgba(255,184,0,0.10)' : 'rgba(0,229,255,0.10)',
        color:      isCrypto ? 'var(--amber-500)'      : 'var(--cyan-500)',
        borderColor: isCrypto ? 'rgba(255,184,0,0.25)' : 'rgba(0,229,255,0.25)',
      }}
    >
      {isCrypto ? 'CRYPTO' : 'STOCK'}
    </span>
  );
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({
  title, value, change, icon, delay = 0,
}: {
  title: string; value: string; change?: string; icon: React.ReactNode; delay?: number;
}) {
  const positive = !change || change.startsWith('+');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex-1 min-w-0 rounded-2xl p-4"
      style={{
        background: 'rgba(123,47,255,0.07)',
        border: '1px solid var(--surface-border)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[10px] tracking-widest uppercase font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </span>
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(123,47,255,0.14)',
            border: '1px solid rgba(123,47,255,0.28)',
            color: 'var(--vio-300)',
          }}
        >
          {icon}
        </div>
      </div>
      <div
        className="text-lg font-bold font-mono tracking-tight break-all"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </div>
      {change && (
        <div
          className="mt-1 text-[11px] font-mono"
          style={{ color: positive ? 'var(--green-500)' : 'var(--mag-500)' }}
        >
          {change}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Quick action button ───────────────────────────────────── */
function QBtn({
  icon, label, onClick, color,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 px-2 flex-1 min-w-[60px] rounded-2xl transition-all outline-none cursor-pointer"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--surface-border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(123,47,255,0.10)';
        e.currentTarget.style.borderColor = 'rgba(123,47,255,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--surface-1)';
        e.currentTarget.style.borderColor = 'var(--surface-border)';
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}35`,
          color,
        }}
      >
        {icon}
      </div>
      <span
        className="text-[10px] font-mono tracking-wide"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Section card wrapper ──────────────────────────────────── */
function SideCard({
  title, onViewAll, delay = 0, children,
}: {
  title: string; onViewAll?: () => void; delay?: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-4 sm:p-5"
    >
      <div className="flex justify-between items-center mb-3">
        <h3
          className="text-sm font-bold font-mono"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-[10px] font-mono tracking-wide outline-none bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: 'var(--cyan-500)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan-300)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--cyan-500)')}
          >
            ALL <ChevronRight size={10} />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Assets list ───────────────────────────────────────────── */
function AssetsWidget({
  assets, marketPrices,
}: {
  assets: Asset[]; marketPrices: Record<string, number>;
}) {
  if (!assets.length) return (
    <p className="text-xs text-center py-4 font-mono" style={{ color: 'var(--text-muted)' }}>
      No assets yet.
    </p>
  );

  return (
    <div className="flex flex-col gap-0.5">
      {assets.slice(0, 6).map(a => {
        const price = marketPrices[a.symbol] ?? a.price ?? 0;
        const value = price * (a.quantity ?? 0);
        return (
          <div
            key={a._id}
            className="flex items-center justify-between px-2 py-2.5 rounded-xl transition-colors cursor-pointer"
            style={{ background: 'rgba(123,47,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123,47,255,0.09)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(123,47,255,0.04)')}
          >
            {/* Symbol avatar */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold font-mono"
                style={{
                  background: 'rgba(123,47,255,0.13)',
                  border: '1px solid rgba(123,47,255,0.28)',
                  color: 'var(--vio-300)',
                }}
              >
                {a.symbol?.[0]}
              </div>
              <div>
                <div className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {a.symbol}
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {a.quantity?.toLocaleString(undefined, { maximumFractionDigits: 4 })} units
                </div>
              </div>
            </div>

            {/* Value + type tag */}
            <div className="text-right">
              <div
                className="text-xs font-semibold font-mono mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                ${fmt(value)}
              </div>
              <Tag type={a.type} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Transactions list ─────────────────────────────────────── */
function TransactionsWidget({
  transactions, limit = 10,
}: {
  transactions: Transaction[]; limit?: number;
}) {
  if (!transactions.length) return (
    <p className="text-xs text-center py-4 font-mono" style={{ color: 'var(--text-muted)' }}>
      No transactions yet.
    </p>
  );

  return (
    <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
      {transactions.slice(0, limit).map(tx => {
        const s = String(tx.status ?? '').toLowerCase().trim();
        const isCompleted = s === 'completed';
        const isPending   = s === 'pending';
        const statusColor = isCompleted
          ? 'var(--green-500)'
          : isPending
          ? 'var(--amber-500)'
          : 'var(--mag-500)';

        const date    = tx.date ? new Date(tx.date) : null;
        const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';

        return (
          <div
            key={tx._id}
            className="flex items-center justify-between px-2 py-2.5 rounded-xl transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123,47,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
              >
                <Clock size={11} />
              </div>
              <div>
                <div className="text-xs font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {tx.type}
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {tx.asset} · {dateStr}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-semibold font-mono mb-0.5" style={{ color: 'var(--text-primary)' }}>
                ${tx.amount?.toLocaleString()}
              </div>
              <span
                className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border"
                style={{
                  color: statusColor,
                  background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${statusColor} 35%, transparent)`,
                }}
              >
                {String(tx.status ?? '').toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Modal shell ───────────────────────────────────────────── */
function DashModal({
  title, children, onClose,
}: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(3,2,10,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md relative shadow-2xl font-mono"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--surface-border)',
          boxShadow: 'var(--glow-vio)',
        }}
      >
        {/* Mobile drag handle */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden"
          style={{ background: 'var(--surface-border)' }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer outline-none transition-colors text-lg"
          style={{ background: 'var(--input)', color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ×
        </button>

        <h2
          className="text-lg font-extrabold mb-5 tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Crypto deposit ────────────────────────────────────────── */
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
    <div className="flex flex-col gap-4">
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Select an asset and send your deposit to the address below.
      </p>

      {/* Coin selector */}
      <div className="flex gap-2">
        {(['BTC', 'USDT'] as const).map(c => (
          <button
            key={c}
            onClick={() => setCoin(c)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all outline-none cursor-pointer border"
            style={{
              background:   coin === c ? 'rgba(123,47,255,0.14)' : 'rgba(255,255,255,0.03)',
              borderColor:  coin === c ? 'rgba(123,47,255,0.45)' : 'var(--surface-border)',
              color:        coin === c ? 'var(--vio-300)'         : 'var(--text-muted)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Address row */}
      <div
        className="flex items-center gap-2.5 rounded-xl p-3.5"
        style={{
          background: 'rgba(123,47,255,0.05)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <span
          className="text-[11px] break-all flex-1 font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          {wallets[coin]}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer border"
          style={{
            background:  copied ? 'rgba(0,255,136,0.10)' : 'rgba(123,47,255,0.12)',
            borderColor: copied ? 'rgba(0,255,136,0.30)' : 'rgba(123,47,255,0.35)',
            color:       copied ? 'var(--green-500)'      : 'var(--vio-300)',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? ' Copied' : ' Copy'}
        </button>
      </div>

      <p className="text-[10px] tracking-wider" style={{ color: 'var(--text-faint)' }}>
        SUPPORTED: {Object.keys(wallets).join(' · ')}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function DashboardContent() {
  const [userData,     setUserData]     = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [assets,       setAssets]       = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assetSummary, setAssetSummary] = useState<{ totalBalance: number } | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [marketLoading, setMarketLoading] = useState(false);
  const [showDeposit,  setShowDeposit]  = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [copiedAcct,   setCopiedAcct]   = useState(false);
  const [currentTime,  setCurrentTime]  = useState('');
  const router = useRouter();

  /* Live clock */
  useEffect(() => {
    const tick = () =>
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Fetch user */
  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(setUserData).catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, []);

  /* Fetch asset summary */
  useEffect(() => {
    fetch('/api/assets?summary=1', { credentials: 'include' })
      .then(r => r.json()).then(setAssetSummary).catch(() => {});
  }, []);

  /* Fetch assets */
  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAssets(d.assets || []))
      .catch(() => {});
  }, []);

  /* Fetch transactions */
  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTransactions(d.transactions || []))
      .catch(() => {});
  }, []);

  /* Live market prices — polls every 60s */
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
      } catch {
        // silent
      } finally {
        if (mounted) setMarketLoading(false);
      }
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

  const totalInvestmentNumber = userData?.totalInvestment  ?? 0;
  const assetBalance          = assetSummary?.totalBalance  ?? 0;
  const totalValueNumber      = assetBalance + (userData?.balance ?? 0);
  const investmentReturns     = userData?.returnRate        ?? 0;
  const returnRatePercent     = userData?.returnRateChange  ?? '+0.00%';

  /* ── Skeleton ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="py-4 flex flex-col gap-4 animate-pulse">
        <div className="h-32 rounded-2xl" style={{ background: 'rgba(123,47,255,0.06)' }} />
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-1 h-16 rounded-xl" style={{ background: 'rgba(123,47,255,0.06)' }} />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-20 rounded-2xl" style={{ background: 'rgba(123,47,255,0.06)' }} />
          <div className="flex-1 h-20 rounded-2xl hidden sm:block" style={{ background: 'rgba(123,47,255,0.06)' }} />
          <div className="flex-1 h-20 rounded-2xl hidden sm:block" style={{ background: 'rgba(123,47,255,0.06)' }} />
        </div>
        <div className="h-56 rounded-2xl hidden md:block" style={{ background: 'rgba(123,47,255,0.06)' }} />
      </div>
    );
  }

  /* ── Main render ───────────────────────────────────────────── */
  return (
    <div className="py-4 font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">

        {/* ══ MAIN COLUMN ══════════════════════════════════════ */}
        <div className="flex flex-col gap-4">

          {/* ── Balance hero card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(123,47,255,0.12) 0%, rgba(0,229,255,0.04) 60%, rgba(13,11,24,0.92) 100%)',
              border: '1px solid rgba(123,47,255,0.28)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* ambient glow orb */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 w-52 h-52 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(123,47,255,0.14) 0%, transparent 70%)', filter: 'blur(24px)' }}
            />
            {/* cyan corner accent */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 w-36 h-36 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)', filter: 'blur(20px)' }}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 relative">
              {/* Balance */}
              <div>
                <div
                  className="text-[10px] tracking-[0.14em] uppercase mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total Balance
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-gradient">
                  ${fmt(totalValueNumber)}
                </div>
                <div className="mt-2 text-xs" style={{ color: 'var(--green-500)' }}>
                  {userData?.totalValueChange || '+0.00%'} today
                </div>
              </div>

              {/* Account number */}
              <div>
                <div
                  className="text-[10px] tracking-widest uppercase mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Account
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] max-w-[140px] truncate sm:max-w-none"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {userData?.accountNumber ?? '—'}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="shrink-0 px-2 py-1 rounded-md outline-none cursor-pointer transition-colors"
                    style={{
                      background: 'rgba(123,47,255,0.10)',
                      border: '1px solid var(--surface-border)',
                      color: 'var(--text-muted)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-500)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {copiedAcct ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>

                {/* Live clock pill */}
                <div
                  className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider"
                  style={{
                    background: 'rgba(0,229,255,0.07)',
                    border: '1px solid rgba(0,229,255,0.20)',
                    color: 'var(--cyan-300)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--green-500)', boxShadow: '0 0 5px var(--green-500)' }}
                  />
                  {currentTime}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Quick actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <QBtn icon={<ArrowDownLeft size={15} />} label="Deposit"  color="var(--green-500)" onClick={() => setShowDeposit(true)} />
            <QBtn icon={<ArrowUpRight  size={15} />} label="Withdraw" color="var(--mag-500)"   onClick={() => router.push('/dashboard/withdraw')} />
            <QBtn icon={<TrendingUp    size={15} />} label="Invest"   color="var(--cyan-500)"  onClick={() => router.push('/dashboard/my-investment')} />
            <QBtn icon={<Repeat        size={15} />} label="Swap"     color="var(--amber-500)" onClick={() => router.push('/dashboard/swap')} />
            <QBtn icon={<SendHorizontal size={15}/>} label="Transfer" color="var(--vio-300)"   onClick={() => router.push('/dashboard/transfer-money')} />
          </motion.div>

          {/* ── Stat cards — mobile: 1, sm+: 3 ── */}
          <div className="flex gap-3 sm:hidden">
            <StatCard
              delay={0.15}
              title="Market Value"
              value={marketLoading ? '…' : `$${fmt(assetBalance)}`}
              change="+0.00%"
              icon={<Activity size={12} />}
            />
          </div>
          <div className="hidden sm:flex gap-3">
            <StatCard delay={0.15} title="Portfolio Growth"
              value={`${userData?.portfolioGrowth ?? '0.00'}%`}
              change={userData?.portfolioGrowthChange ?? '+0.00%'}
              icon={<TrendingUp size={12} />} />
            <StatCard delay={0.2}  title="Market Value"
              value={marketLoading ? '…' : `$${fmt(assetBalance)}`}
              change="+0.00%"
              icon={<Activity size={12} />} />
            <StatCard delay={0.25} title="Inv. Returns"
              value={`$${fmt(investmentReturns)}`}
              change={returnRatePercent}
              icon={<BarChart2 size={12} />} />
          </div>

          {/* ── Mobile: assets + recent txns ── */}
          <div className="flex flex-col gap-4 sm:hidden">
            <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
              <AssetsWidget assets={assets} marketPrices={marketPrices} />
            </SideCard>
            <SideCard title="Recent Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
              <TransactionsWidget transactions={transactions} limit={3} />
            </SideCard>
          </div>

          {/* ── Chart (hidden mobile) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="hidden sm:block card p-4 sm:p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Portfolio Value
              </h3>
              <span
                className="badge badge-cyan"
                style={{ fontSize: '9px' }}
              >
                LIVE
              </span>
            </div>
            <StockDashboard />
          </motion.div>

          {/* ── Tablet: assets + txns below chart ── */}
          <div className="grid xl:hidden grid-cols-1 md:grid-cols-2 gap-4 max-sm:hidden">
            <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
              <AssetsWidget assets={assets} marketPrices={marketPrices} />
            </SideCard>
            <SideCard title="Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
              <TransactionsWidget transactions={transactions} />
            </SideCard>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR — xl only ══════════════════════════ */}
        <div className="hidden xl:flex flex-col gap-4">

          {/* Total investment tile */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="stat-tile"
          >
            <div
              className="text-[10px] tracking-widest uppercase mb-2.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Total Investment
            </div>
            <div className="stat-value">${fmt(totalInvestmentNumber)}</div>
            <div className="mt-1.5 text-xs" style={{ color: 'var(--green-500)' }}>
              {userData?.totalInvestmentChange || '+0.00%'}
            </div>
          </motion.div>

          <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
            <AssetsWidget assets={assets} marketPrices={marketPrices} />
          </SideCard>

          <SideCard title="Recent Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
            <TransactionsWidget transactions={transactions} />
          </SideCard>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeposit && (
          <DashModal title="Deposit Crypto" onClose={() => setShowDeposit(false)}>
            <CryptoDeposit />
          </DashModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWithdraw && (
          <DashModal title="Withdraw Funds" onClose={() => setShowWithdraw(false)}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Withdraw form coming soon.
            </p>
          </DashModal>
        )}
      </AnimatePresence>
    </div>
  );
}