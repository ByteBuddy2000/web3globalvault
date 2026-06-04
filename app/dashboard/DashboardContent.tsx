'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/* Sections */
import HeroSection from './sections/HeroSection';
import KPISection from './sections/KPISection';
import DashboardTabs from './sections/DashboardTabs';
import StockDashboard from './components/StockDashboard';
import CryptoDashboard from './components/CryptoDashboard';
import CardsWidget from './sections/CardsWidget';
import QuickActionsSection from './sections/QuickActions';

/* Types */
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

export default function DashboardContent() {
  const router = useRouter();

  /* ─── State ───────────────────────────── */
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assetSummary, setAssetSummary] = useState<{ totalBalance: number } | null>(null);

  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [marketLoading, setMarketLoading] = useState(false);

  const [cards, setCards] = useState<any>(null);

  /* ─── Fetch user ─────────────────────── */
  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then((r) => r.json())
      .then(setUserData)
      .catch(() => setUserData(null))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Fetch assets summary ───────────── */
  useEffect(() => {
    fetch('/api/assets?summary=1', { credentials: 'include' })
      .then((r) => r.json())
      .then(setAssetSummary)
      .catch(() => {});
  }, []);

  /* ─── Fetch assets ────────────────────── */
  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setAssets(d.assets || []))
      .catch(() => {});
  }, []);

  /* ─── Fetch transactions ──────────────── */
  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions || []))
      .catch(() => {});
  }, []);

  /* ─── Fetch cards ──────────────────────── */
  useEffect(() => {
    fetch('/api/cards', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCards(d.cards?.[0] || null))
      .catch(() => {});
  }, []);

  /* ─── Market prices ───────────────────── */
  useEffect(() => {
    let mounted = true;

    async function fetchPrices() {
      setMarketLoading(true);

      try {
        const symbols = assets.length
          ? Array.from(new Set(assets.map((a) => a.symbol))).slice(0, 20)
          : ['AAPL', 'TSLA', 'AMZN'];

        const res = await fetch(
          `/api/stock-prices?symbols=${encodeURIComponent(symbols.join(','))}`
        );

        const data = await res.json();

        const map: Record<string, number> = {};

        if (Array.isArray(data?.result)) {
          for (const item of data.result) {
            if (item?.symbol && typeof item.price === 'number') {
              map[item.symbol] = item.price;
            }
          }
        }

        if (mounted) setMarketPrices((p) => ({ ...p, ...map }));
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setMarketLoading(false);
      }
    }

    fetchPrices();
    const id = setInterval(fetchPrices, 60000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [assets]);

  /* ─── Loading ────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        {[120, 80, 200, 300].map((h, i) => (
          <div key={i} className="skeleton rounded-xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  const assetBalance = assetSummary?.totalBalance ?? 0;

  /* ─── UI ─────────────────────────────── */
  return (
    <div className="flex flex-col gap-6">

      {/* ── ROW 1: HERO + CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        <div className="lg:col-span-2">
          <HeroSection
            userData={userData}
            totalInvestment={assetBalance}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="dashboard-card h-full">
            <div className="dashboard-title mb-4">
              Your Card
            </div>

            <CardsWidget card={cards} />
          </div>
        </div>

      </div>

      {/* ── ROW 2: QUICK ACTIONS ── */}
      <QuickActionsSection />

      {/* ── ROW 3: KPI ── */}
      <KPISection
        userData={userData}
        assetBalance={assetBalance}
        investmentReturns={0}
        returnRatePercent={0}
        marketLoading={marketLoading}
      />

      {/* ── ROW 4: CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="dashboard-card">
          <div className="dashboard-title mb-4">
            Performance
          </div>
          <StockDashboard />
        </div>

        <div className="dashboard-card">
          <div className="dashboard-title mb-4">
            Market
          </div>
          <CryptoDashboard />
        </div>

      </div>

      {/* ── ROW 5: TABS ── */}
      <DashboardTabs
        active={activeTab}
        setActive={setActiveTab}
        assets={assets}
        transactions={transactions}
        marketPrices={marketPrices}
      />

    </div>
  );
}