'use client';

import { motion } from 'framer-motion';
import React from 'react';

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  delta?: number;
  accent?: string;
};

export default function KPICard({
  label,
  value,
  sub,
  icon,
  delta,
  accent = '#6366f1',
}: Props) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="dashboard-card p-4 relative overflow-hidden"
      style={{
        borderColor: `${accent}33`,
      }}
    >
      {/* glow background */}
      <div
        className="absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: accent }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>

        {icon && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: `${accent}22`,
              color: accent,
              border: `1px solid ${accent}44`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="text-lg font-bold text-white mb-1">
        {value}
      </div>

      <div className="flex items-center justify-between">
        {sub && (
          <span className="text-[11px] text-white/40">{sub}</span>
        )}

        {typeof delta === 'number' && (
          <span
            className={`text-[11px] font-semibold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {delta.toFixed(2)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}