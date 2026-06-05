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
import QuickActionsSection from './sections/QuickActionsSection';

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

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assetSummary, setAssetSummary] = useState<{ totalBalance: number } | null>(null);

  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [cards, setCards] = useState<any>(null);

  /* ─── Fetch user ─── */
  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(setUserData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/assets?summary=1', { credentials: 'include' })
      .then(r => r.json())
      .then(setAssetSummary);
  }, []);

  useEffect(() => {
    fetch('/api/assets', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAssets(d.assets || []));
  }, []);

  useEffect(() => {
    fetch('/api/transactions', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTransactions(d.transactions || []));
  }, []);

  useEffect(() => {
    fetch('/api/cards', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCards(d.cards?.[0] || null));
  }, []);

  const assetBalance = assetSummary?.totalBalance ?? 0;

  /* ─── Skeleton ─── */
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {/* Hero + sidebar skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="skeleton rounded-xl h-[180px] md:h-[200px]" />
            <div className="skeleton rounded-xl h-[80px]" />
          </div>
          <div className="lg:col-span-1">
            <div className="skeleton rounded-xl h-[220px]" />
          </div>
        </div>
        {/* KPI skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton rounded-xl h-[100px]" />
          ))}
        </div>
        {/* Markets skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="skeleton rounded-xl h-[300px]" />
          <div className="skeleton rounded-xl h-[300px]" />
        </div>
        {/* Tabs skeleton */}
        <div className="skeleton rounded-xl h-[200px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">

      {/* ───────── ROW 1: HERO + SIDEBAR ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">

        {/* HERO — full width on mobile/tablet, 3/4 on desktop */}
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 min-w-0">
          <HeroSection
            userData={userData}
            totalInvestment={assetBalance}
          />
          <QuickActionsSection />
        </div>

        {/* SIDEBAR — full width on mobile/tablet, 1/4 on desktop */}
        <div className="lg:col-span-1 min-w-0">
          <div className="dashboard-card h-full">
            <div className="dashboard-title mb-3">Your Card</div>
            <CardsWidget card={cards} />
          </div>
        </div>

      </div>

      {/* ───────── ROW 2: KPI ───────── */}
      <KPISection
        userData={userData}
        assetBalance={assetBalance}
        investmentReturns={0}
        returnRatePercent={0}
        marketLoading={false}
      />

      {/* ───────── ROW 3: MARKETS ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        <div className="dashboard-card min-w-0 overflow-hidden">
          <div className="dashboard-title mb-4">Stocks</div>
          {/* Scroll container prevents table/chart overflow breaking layout */}
          <div className="w-full overflow-x-auto">
            <StockDashboard />
          </div>
        </div>

        <div className="dashboard-card min-w-0 overflow-hidden">
          <div className="dashboard-title mb-4">Crypto Market</div>
          <div className="w-full overflow-x-auto">
            <CryptoDashboard />
          </div>
        </div>

      </div>

      {/* ───────── ROW 4: TABS ───────── */}
      <div className="min-w-0 overflow-hidden">
        <DashboardTabs
          active={activeTab}
          setActive={setActiveTab}
          assets={assets}
          transactions={transactions}
          marketPrices={marketPrices}
        />
      </div>

    </div>
  );
}