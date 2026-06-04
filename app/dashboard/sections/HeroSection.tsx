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
      className="dashboard-card p-4 md:p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">
            Portfolio
          </p>
          <h1 className="text-xl md:text-3xl font-bold text-white">
            ${(totalInvestment ?? 0).toLocaleString()}
          </h1>
        </div>

        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
          <Wallet size={16} className="text-indigo-400" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-indigo-300">
        <TrendingUp size={12} />
        <span>Live Portfolio Tracking</span>
      </div>
    </motion.div>
  );
}