'use client';

import { Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  userData: any;
  totalInvestment: number | undefined;
};

export default function HeroSection({
  userData,
  totalInvestment,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card flex flex-col gap-4 p-4 md:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="dashboard-metric-label">
            Portfolio
          </p>

          <h1 className="dashboard-balance-text font-display text-2xl md:text-4xl font-bold leading-none">
            ${(totalInvestment ?? 0).toLocaleString()}
          </h1>

          {userData?.username && (
            <p className="mt-2 text-sm text-muted">
              Welcome back, {userData.username}
            </p>
          )}
        </div>

        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-xl border border-brand
            bg-brand-glass shadow-brand-sm
          "
        >
          <Wallet
            size={20}
            style={{ color: 'var(--brand-400)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-primary">
        <TrendingUp size={14} />
        <span className="font-medium">
          Live Portfolio Tracking
        </span>

        <span className="status-dot status-dot-live" />
      </div>
    </motion.div>
  );
}