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
  // Crypto Transactions
  {
    id: 1,
    username: 'Michael',
    country: 'Nigeria',
    amount: 2500,
    type: 'deposit',
    assetType: 'crypto',
    asset: 'BTC',
  },
  {
    id: 2,
    username: 'Sarah',
    country: 'United Kingdom',
    amount: 1200,
    type: 'withdrawal',
    assetType: 'crypto',
    asset: 'ETH',
  },
  {
    id: 3,
    username: 'Daniel',
    country: 'Canada',
    amount: 850,
    type: 'deposit',
    assetType: 'crypto',
    asset: 'USDT',
  },
  {
    id: 4,
    username: 'Jessica',
    country: 'Germany',
    amount: 4300,
    type: 'withdrawal',
    assetType: 'crypto',
    asset: 'SOL',
  },
  {
    id: 5,
    username: 'David',
    country: 'Australia',
    amount: 6700,
    type: 'deposit',
    assetType: 'crypto',
    asset: 'BTC',
  },
  {
    id: 6,
    username: 'Sophia',
    country: 'France',
    amount: 980,
    type: 'withdrawal',
    assetType: 'crypto',
    asset: 'ETH',
  },

  // Stock Transactions
  {
    id: 7,
    username: 'James',
    country: 'United States',
    amount: 15200,
    type: 'deposit',
    assetType: 'stock',
    asset: 'AAPL',
  },
  {
    id: 8,
    username: 'Emma',
    country: 'Switzerland',
    amount: 9200,
    type: 'withdrawal',
    assetType: 'stock',
    asset: 'TSLA',
  },
  {
    id: 9,
    username: 'Noah',
    country: 'Singapore',
    amount: 4300,
    type: 'deposit',
    assetType: 'stock',
    asset: 'NVDA',
  },
  {
    id: 10,
    username: 'Olivia',
    country: 'South Africa',
    amount: 7400,
    type: 'withdrawal',
    assetType: 'stock',
    asset: 'META',
  },
  {
    id: 11,
    username: 'Ethan',
    country: 'Japan',
    amount: 12800,
    type: 'deposit',
    assetType: 'stock',
    asset: 'AMZN',
  },
  {
    id: 12,
    username: 'Mia',
    country: 'Netherlands',
    amount: 5600,
    type: 'withdrawal',
    assetType: 'stock',
    asset: 'GOOGL',
  },
];

const ASSET_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  SOL: '◎',
  AAPL: '🍎',
  TSLA: '🚗',
  NVDA: '🟢',
  META: '∞',
  AMZN: '📦',
  GOOGL: '🔍',
};

export default function LiveTransactionPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === mockTransactions.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const transaction = mockTransactions[currentIndex];

  const isDeposit = transaction.type === 'deposit';
  const isCrypto = transaction.assetType === 'crypto';

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-999999 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: 120, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 120, scale: 0.95 }}
          transition={{ duration: 0.45 }}
          className="w-70 sm:w-[320px] md:w-85 rounded-2xl border border-white/10 bg-[#111318]/95 p-3 sm:p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            {/* TRANSACTION ICON */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold border ${
                isDeposit
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {isDeposit ? '↓' : '↑'}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Live Transaction
                </p>

                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-widest] ${
                    isCrypto
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {isCrypto ? 'CRYPTO' : 'STOCK'}
                </span>
              </div>

              <h3 className="mt-1 text-sm font-bold text-white">
                {transaction.username} from {transaction.country}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                just made a{' '}
                <span
                  className={`font-bold ${
                    isDeposit ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {transaction.type}
                </span>
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-extrabold text-white">
                  ${transaction.amount.toLocaleString()}
                </span>

                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold tracking-[0.08em] ${
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