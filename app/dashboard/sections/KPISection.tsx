'use client';

import { TrendingUp, Activity, BarChart2 } from 'lucide-react';
import KPICard from '../components/KPICard';

type Props = {
  userData: any;
  assetBalance: number;
  investmentReturns?: number;
  returnRatePercent?: number;
  marketLoading: boolean;
};

export default function KPISection({
  userData,
  assetBalance,
  investmentReturns,
  returnRatePercent,
  marketLoading,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      
      <KPICard
        label="Growth"
        value={`${userData?.portfolioGrowth ?? 0}%`}
        sub="vs last month"
        icon={<TrendingUp size={14} />}
        delta={parseFloat(userData?.portfolioGrowthChange ?? '0')}
        accent="#6366f1"
      />

      <KPICard
        label="Market Value"
        value={marketLoading ? '···' : `$${assetBalance.toLocaleString()}`}
        sub="live"
        icon={<Activity size={14} />}
        delta={0.8}
        accent="#10b981"
      />

      <KPICard
        label="Returns"
        value={`$${(investmentReturns ?? 0).toLocaleString()}`}
        sub="all time"
        icon={<BarChart2 size={14} />}
        delta={returnRatePercent ?? 0}
        accent="#f59e0b"
      />

    </div>
  );
}