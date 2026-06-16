'use client';

import { Wallet, TrendingUp, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  userData: any;
  totalInvestment: number | undefined;
};

export default function HeroSection({
  userData,
  totalInvestment,
}: Props) {
  const isVerified = userData?.kycStatus === 'approved' || userData?.isVerified;

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

          {/* KYC STATUS BADGE */}
          {isVerified ? (
            <div
              className="
                mt-3 inline-flex items-center gap-1.5
                rounded-lg border border-emerald-500/20
                bg-emerald-500/10
                px-3 py-1
                text-xs font-semibold text-emerald-400
              "
            >
              <BadgeCheck size={14} />
              Identity Verified
            </div>
          ) : (
            <div
              className="
                mt-3 inline-flex items-center gap-1.5
                rounded-lg border border-amber-500/20
                bg-amber-500/10
                px-3 py-1
                text-xs font-semibold text-amber-400
              "
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              KYC Pending
            </div>
          )}

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