'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Repeat,
  TriangleAlert,
  BedDouble,
  SendHorizontal,
  Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type ActionProps = {
  icon: React.ReactNode;
  label: string;
  accent: string;
  onClick: () => void;
};

function Action({ icon, label, accent, onClick }: ActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition group"
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        {icon}
      </div>

      <span className="text-[11px] text-white/70 group-hover:text-white transition">
        {label}
      </span>
    </button>
  );
}

export default function QuickActionsSection() {
  const router = useRouter();

  return (
    <div className="w-full space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-widest text-white/50">
          Quick Actions
        </h2>
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-4 sm:grid-cols-8 gap-3"
      >
        <Action
          icon={<ArrowDownLeft size={16} />}
          label="Deposit"
          accent="#10b981"
          onClick={() => router.push('/dashboard/deposit')}
        />

        <Action
          icon={<ArrowUpRight size={16} />}
          label="Withdraw"
          accent="#f43f5e"
          onClick={() => router.push('/dashboard/withdraw')}
        />

        <Action
          icon={<TrendingUp size={16} />}
          label="Invest"
          accent="#6366f1"
          onClick={() => router.push('/dashboard/my-investment')}
        />

        <Action
          icon={<Repeat size={16} />}
          label="Swap"
          accent="#f59e0b"
          onClick={() => router.push('/dashboard/swap')}
        />

        <Action
          icon={<TriangleAlert size={16} />}
          label="FBI"
          accent="#a78bfa"
          onClick={() => router.push('/dashboard/fbi')}
        />

        <Action
          icon={<BedDouble size={16} />}
          label="Medbed"
          accent="#a78bfa"
          onClick={() => router.push('/dashboard/medbed')}
        />

        <Action
          icon={<SendHorizontal size={16} />}
          label="Transfer"
          accent="#38bdf8"
          onClick={() => router.push('/dashboard/transfer-money')}
        />

        <Action
          icon={<Wallet size={16} />}
          label="Cards"
          accent="#6366f1"
          onClick={() => router.push('/dashboard/cards')}
        />
      </motion.div>
    </div>
  );
}