'use client';

import { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, SendHorizontal, Repeat,
  Copy, Check, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Activity, BarChart2, Clock, CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import StockDashboard from './components/StockDashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Asset = {
  _id: string; name: string; symbol: string; type: string;
  quantity: number; price?: number; change?: number; changePercent?: number;
};
type Transaction = {
  _id: string; type: string; asset: string;
  amount: number; status: string; date: string;
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Tag({ type }: { type: string }) {
  const isCrypto = type === 'crypto' || type === 'Crypto';
  return (
    <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border
      ${isCrypto ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25' : 'bg-sky-400/10 text-sky-400 border-sky-400/25'}`}>
      {isCrypto ? 'CRYPTO' : 'STOCK'}
    </span>
  );
}

function StatCard({ title, value, change, icon, delay = 0 }: {
  title: string; value: string; change?: string; icon: React.ReactNode; delay?: number;
}) {
  const positive = !change || change.startsWith('+');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex-1 min-w-0 bg-[#111318]/80 border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] tracking-widest text-gray-600 uppercase font-mono leading-tight">{title}</span>
        <div className="w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/15 flex items-center justify-center text-yellow-400 shrink-0">{icon}</div>
      </div>
      <div className="text-lg font-bold text-gray-100 font-mono tracking-tight break-all">{value}</div>
      {change && <div className={`mt-1 text-[11px] font-mono ${positive ? 'text-green-400' : 'text-red-400'}`}>{change}</div>}
    </motion.div>
  );
}

function QBtn({ icon, label, onClick, color }: {
  icon: React.ReactNode; label: string; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 px-2 flex-1 min-w-[60px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-yellow-400/25 rounded-2xl transition-all outline-none cursor-pointer"
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-400 font-mono tracking-wide whitespace-nowrap">{label}</span>
    </button>
  );
}

function SideCard({ title, onViewAll, delay = 0, children }: {
  title: string; onViewAll?: () => void; delay?: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#111318]/80 border border-white/[0.07] rounded-2xl p-4 sm:p-5 backdrop-blur-md"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-100 font-mono">{title}</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="flex items-center gap-0.5 text-[10px] text-yellow-400 hover:text-yellow-300 font-mono tracking-wide outline-none bg-transparent border-none cursor-pointer">
            ALL <ChevronRight size={10} />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function AssetsWidget({ assets, marketPrices }: { assets: Asset[]; marketPrices: Record<string, number> }) {
  if (!assets.length) return <p className="text-xs text-gray-700 text-center py-4 font-mono">No assets yet.</p>;
  return (
    <div className="flex flex-col gap-0.5">
      {assets.slice(0, 6).map(a => {
        const price = marketPrices[a.symbol] ?? a.price ?? 0;
        const value = price * (a.quantity ?? 0);
        return (
          <div key={a._id} className="flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-yellow-400/[0.04] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg shrink-0 bg-yellow-400/10 border border-yellow-400/15 flex items-center justify-center text-[11px] font-bold text-yellow-400 font-mono">
                {a.symbol?.[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-100 font-mono">{a.symbol}</div>
                <div className="text-[10px] text-gray-600 font-mono">{a.quantity?.toLocaleString(undefined, { maximumFractionDigits: 4 })} units</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-100 font-mono mb-0.5">${fmt(value)}</div>
              <Tag type={a.type} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TransactionsWidget({ transactions, limit = 10 }: { transactions: Transaction[]; limit?: number }) {
  if (!transactions.length) return <p className="text-xs text-gray-700 text-center py-4 font-mono">No transactions yet.</p>;
  return (
    <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
      {transactions.slice(0, limit).map(tx => {
        const s = String(tx.status ?? '').toLowerCase().trim();
        const isCompleted = s === 'completed', isPending = s === 'pending';
        const statusColor = isCompleted ? 'text-green-400' : isPending ? 'text-yellow-400' : 'text-red-400';
        const statusBg = isCompleted ? 'bg-green-400/10 border-green-400/20' : isPending ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-red-400/10 border-red-400/20';
        const date = tx.date ? new Date(tx.date) : null;
        const dateStr = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '--';
        return (
          <div key={tx._id} className="flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg shrink-0 bg-white/[0.04] flex items-center justify-center text-gray-400">
                <Clock size={11} />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-100 font-mono">{tx.type}</div>
                <div className="text-[10px] text-gray-600 font-mono">{tx.asset} · {dateStr}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-semibold text-gray-100 font-mono mb-0.5">${tx.amount?.toLocaleString()}</div>
              <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border ${statusColor} ${statusBg}`}>
                {String(tx.status ?? '').toUpperCase()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#111318] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md relative shadow-2xl font-mono"
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4 sm:hidden" />
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/[0.06] border border-white/10 rounded-lg text-gray-400 hover:text-white cursor-pointer outline-none">×</button>
        <h2 className="text-lg font-extrabold text-gray-100 mb-5 tracking-tight">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

function CryptoDeposit() {
  const wallets: Record<string, string> = {
    BTC: 'bc1qpycmsxnlarnay4jgwa3y535m802qevq7ffnp5x',
    USDT: '0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3',
  };
  const [coin, setCoin] = useState<'BTC' | 'USDT'>('BTC');
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallets[coin]);
    setCopied(true); toast.success(`${coin} address copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-xs text-gray-500 leading-relaxed">Select an asset and send your deposit to the address below.</p>
      <div className="flex gap-2">
        {(['BTC', 'USDT'] as const).map(c => (
          <button key={c} onClick={() => setCoin(c)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all outline-none cursor-pointer border
              ${coin === c ? 'bg-yellow-400/10 border-yellow-400/35 text-yellow-400' : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-3.5">
        <span className="text-[11px] text-gray-400 break-all flex-1 font-mono">{wallets[coin]}</span>
        <button onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer border
            ${copied ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-yellow-400/10 border-yellow-400/25 text-yellow-400'}`}>
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-[10px] text-gray-700 tracking-wider">SUPPORTED: {Object.keys(wallets).join(' · ')}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function DashboardContent() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assetSummary, setAssetSummary] = useState<{ totalBalance: number } | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [marketLoading, setMarketLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const u = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    u(); const id = setInterval(u, 1000); return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(setUserData).catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/assets?summary=1', { credentials: 'include' })
      .then(r => r.json()).then(setAssetSummary).catch(() => { });
  }, []);

  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then(r => r.json()).then(d => setAssets(d.assets || [])).catch(() => { });
  }, []);

  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then(r => r.json()).then(d => setTransactions(d.transactions || [])).catch(() => { });
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
      } catch { } finally { if (mounted) setMarketLoading(false); }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, [assets]);

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
      } catch { } finally { if (mounted) setMarketLoading(false); }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, [assets]);

  const handleCopyAccount = async () => {
    if (userData?.accountNumber) {
      await navigator.clipboard.writeText(userData.accountNumber);
      setCopiedAcct(true); toast.success('Account number copied!');
      setTimeout(() => setCopiedAcct(false), 2000);
    }
  };

  const totalInvestmentNumber = userData?.totalInvestment ?? 0;
  const assetBalance = assetSummary?.totalBalance ?? 0;
  const totalValueNumber = assetBalance + (userData?.balance ?? 0);
  const investmentReturns = userData?.returnRate ?? 0;
  const returnRatePercent = userData?.returnRateChange ?? '+0.00%';

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="py-4 flex flex-col gap-4 animate-pulse">
        <div className="h-32 bg-white/[0.04] rounded-2xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex-1 h-16 bg-white/[0.04] rounded-xl" />)}
        </div>
        {/* Mobile: 1 stat, Desktop: 3 */}
        <div className="flex gap-3">
          <div className="flex-1 h-20 bg-white/[0.04] rounded-2xl" />
          <div className="flex-1 h-20 bg-white/[0.04] rounded-2xl hidden sm:block" />
          <div className="flex-1 h-20 bg-white/[0.04] rounded-2xl hidden sm:block" />
        </div>
        <div className="h-56 bg-white/[0.04] rounded-2xl hidden md:block" />
      </div>
    );
  }

  return (
    <div className="py-4 font-mono">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">

        {/* ══ MAIN COLUMN ══ */}
        <div className="flex flex-col gap-4">

          {/* ── Balance Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl border border-yellow-400/15 bg-gradient-to-br from-yellow-400/[0.08] to-[#111318]/90 p-5 sm:p-6"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-yellow-400/[0.08] blur-2xl" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <div className="text-[10px] tracking-[0.14em] text-gray-600 uppercase mb-2">Total Balance</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-100 tracking-tight leading-none">
                  ${fmt(totalValueNumber)}
                </div>
                <div className="mt-2 text-xs text-green-400">{userData?.totalValueChange || '+0.00%'} today</div>
              </div>

              <div>
                <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-1.5">Account</div>
                <div className="flex items-center gap-2">
                  {/* truncate long account numbers on mobile */}
                  <span className="text-[11px] text-gray-400 max-w-[140px] truncate sm:max-w-none">
                    {userData?.accountNumber ?? '—'}
                  </span>
                  <button onClick={handleCopyAccount} className="shrink-0 px-2 py-1 bg-white/[0.06] border border-white/10 rounded-md text-gray-400 hover:text-green-400 transition-colors outline-none cursor-pointer">
                    {copiedAcct ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>

          {/* ── Quick Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            <QBtn icon={<ArrowDownLeft size={15} />} label="Deposit" color="#4ade80" onClick={() => setShowDeposit(true)} />
            <QBtn icon={<ArrowUpRight size={15} />} label="Withdraw" color="#f87171" onClick={() => router.push('/dashboard/withdraw')} />
            <QBtn icon={<TrendingUp size={15} />} label="Invest" color="#60a5fa" onClick={() => router.push('/dashboard/my-investment')} />
            <QBtn icon={<Repeat size={15} />} label="Swap" color="#fbbf24" onClick={() => router.push('/dashboard/swap')} />
            <QBtn icon={<SendHorizontal size={15} />} label="Transfer" color="#a78bfa" onClick={() => router.push('/dashboard/transfer-money')} />
          </motion.div>

          {/* ── Stat Cards
               Mobile:  1 card (Total Value only)
               sm+:     all 3 cards             ── */}
          {/* Mobile: only Market Value (no Portfolio Growth, no Inv. Returns) */}
          <div className="flex gap-3 sm:hidden">
            <StatCard delay={0.15} title="Market Value" value={marketLoading ? '...' : `$${fmt(assetBalance)}`} change="+0.00%" icon={<Activity size={12} />} />
          </div>

          {/* Desktop sm+: all 3 cards */}
          <div className="hidden sm:flex gap-3">
            <StatCard delay={0.15} title="Portfolio Growth" value={`${userData?.portfolioGrowth ?? '0.00'}%`} change={userData?.portfolioGrowthChange ?? '+0.00%'} icon={<TrendingUp size={12} />} />
            <StatCard delay={0.2} title="Market Value" value={marketLoading ? '...' : `$${fmt(assetBalance)}`} change="+0.00%" icon={<Activity size={12} />} />
            <StatCard delay={0.25} title="Inv. Returns" value={`$${fmt(investmentReturns)}`} change={returnRatePercent} icon={<BarChart2 size={12} />} />
          </div>

          {/* ── Mobile: compact top-3 recent transactions ── */}
          {/* ── Mobile: assets + recent transactions ── */}
          <div className="flex flex-col gap-4 sm:hidden">
            <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
              <AssetsWidget assets={assets} marketPrices={marketPrices} />
            </SideCard>
            <SideCard title="Recent Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
              <TransactionsWidget transactions={transactions} limit={3} />
            </SideCard>
          </div>

          {/* ── Chart (hidden on mobile) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="hidden sm:block bg-[#111318]/80 border border-white/[0.07] rounded-2xl p-4 sm:p-5 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-100">Portfolio Value</h3>
              <span className="text-[9px] text-gray-700 tracking-widest">LIVE CHART</span>
            </div>
            <StockDashboard />
          </motion.div>

          {/* ── Tablet: assets + transactions below chart (md, hidden on xl where right col shows them) ── */}
          <div className="grid xl:hidden grid-cols-1 md:grid-cols-2 gap-4 max-sm:hidden">
            <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
              <AssetsWidget assets={assets} marketPrices={marketPrices} />
            </SideCard>
            <SideCard title="Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
              <TransactionsWidget transactions={transactions} />
            </SideCard>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR — xl+ only ══ */}
        <div className="hidden xl:flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-[#111318]/80 border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md"
          >
            <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-2.5">Total Investment</div>
            <div className="text-2xl font-extrabold text-gray-100 tracking-tight">${fmt(totalInvestmentNumber)}</div>
            <div className="mt-1.5 text-xs text-green-400">{userData?.totalInvestmentChange || '+0.00%'}</div>
          </motion.div>

          <SideCard title="Assets" onViewAll={() => router.push('/dashboard/assets')} delay={0.2}>
            <AssetsWidget assets={assets} marketPrices={marketPrices} />
          </SideCard>

          <SideCard title="Recent Transactions" onViewAll={() => router.push('/dashboard/transactions')} delay={0.25}>
            <TransactionsWidget transactions={transactions} />
          </SideCard>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showDeposit && <DashModal title="Deposit Crypto" onClose={() => setShowDeposit(false)}><CryptoDeposit /></DashModal>}
      </AnimatePresence>
      <AnimatePresence>
        {showWithdraw && <DashModal title="Withdraw Funds" onClose={() => setShowWithdraw(false)}>
          <p className="text-xs text-gray-500">Withdraw form coming soon.</p>
        </DashModal>}
      </AnimatePresence>
    </div>
  );
}