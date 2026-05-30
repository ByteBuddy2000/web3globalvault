'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type TransactionType = 'deposit' | 'withdrawal';
type AssetCategory = 'crypto' | 'stock';

interface Transaction {
  id: number;
  username: string;
  country: string;
  amount: number;
  type: TransactionType;
  assetType: AssetCategory;
  asset: string;
}

const mockTransactions: Transaction[] = [
  { id: 1, username: 'Michael', country: 'Switzerland', amount: 2500, type: 'deposit', assetType: 'crypto', asset: 'BTC' },
  { id: 2, username: 'Sarah', country: 'United Kingdom', amount: 1200, type: 'withdrawal', assetType: 'crypto', asset: 'ETH' },
  { id: 3, username: 'Daniel', country: 'Canada', amount: 850, type: 'deposit', assetType: 'crypto', asset: 'USDT' },
  { id: 4, username: 'Jessica', country: 'Germany', amount: 4300, type: 'withdrawal', assetType: 'crypto', asset: 'SOL' },
  { id: 5, username: 'David', country: 'Australia', amount: 6700, type: 'deposit', assetType: 'crypto', asset: 'BTC' },
  { id: 6, username: 'Sophia', country: 'France', amount: 980, type: 'withdrawal', assetType: 'crypto', asset: 'ETH' },
  { id: 7, username: 'James', country: 'United States', amount: 15200, type: 'deposit', assetType: 'stock', asset: 'AAPL' },
  { id: 8, username: 'Emma', country: 'Switzerland', amount: 9200, type: 'withdrawal', assetType: 'stock', asset: 'TSLA' },
  { id: 9, username: 'Noah', country: 'Singapore', amount: 4300, type: 'deposit', assetType: 'stock', asset: 'NVDA' },
  { id: 10, username: 'Olivia', country: 'South Africa', amount: 7400, type: 'withdrawal', assetType: 'stock', asset: 'META' },
  { id: 11, username: 'Ethan', country: 'Japan', amount: 12800, type: 'deposit', assetType: 'stock', asset: 'AMZN' },
  { id: 12, username: 'Mia', country: 'Netherlands', amount: 5600, type: 'withdrawal', assetType: 'stock', asset: 'GOOGL' },
];

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', SOL: '◎',
  AAPL: '🍎', TSLA: '🚗', NVDA: '🟢', META: '∞', AMZN: '📦', GOOGL: '🔍',
};

export default function LiveTransactionPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === mockTransactions.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const transaction = mockTransactions[currentIndex];
  const isDeposit = transaction.type === 'deposit';
  const isCrypto = transaction.assetType === 'crypto';

  return (
    <div className="fixed bottom-3 left-3 z-999999 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.35 }}
          className="w-[200px] rounded-xl border border-white/10 bg-[#111318]/95 px-3 py-2 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            {/* Icon */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold border ${
                isDeposit
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {isDeposit ? '↓' : '↑'}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-[9px] font-semibold text-white leading-tight">
                  {transaction.username}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                    isCrypto
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {isCrypto ? 'CRYPTO' : 'STOCK'}
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={`text-xs font-extrabold ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                  {isDeposit ? '+' : '-'}${transaction.amount.toLocaleString()}
                </span>
                <span
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                    isCrypto
                      ? 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                      : 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
                  }`}
                >
                  <span>{ASSET_ICONS[transaction.asset] || '•'}</span>
                  {transaction.asset}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}