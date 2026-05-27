'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type TransactionType = 'deposit' | 'withdrawal';

interface Transaction {
  id: number;
  username: string;
  country: string;
  amount: number;
  type: TransactionType;
  coin: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    username: 'Michael',
    country: 'Nigeria',
    amount: 2500,
    type: 'deposit',
    coin: 'BTC',
  },
  {
    id: 2,
    username: 'Sarah',
    country: 'United Kingdom',
    amount: 1200,
    type: 'withdrawal',
    coin: 'ETH',
  },
  {
    id: 3,
    username: 'Daniel',
    country: 'Canada',
    amount: 850,
    type: 'deposit',
    coin: 'USDT',
  },
  {
    id: 4,
    username: 'Jessica',
    country: 'Germany',
    amount: 4300,
    type: 'withdrawal',
    coin: 'SOL',
  },
];

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

  return (
    <div
      className="fixed bottom-5 right-5 z-[999999] pointer-events-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: 120 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 120 }}
          transition={{ duration: 0.45 }}
          className="w-[320px] rounded-2xl border border-white/10 bg-[#111318]/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            {/* ICON */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
                transaction.type === 'deposit'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {transaction.type === 'deposit' ? '↓' : '↑'}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                Live Transaction
              </p>

              <h3 className="mt-1 text-sm font-bold text-white">
                {transaction.username} from {transaction.country}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                just made a{' '}
                <span
                  className={`font-bold ${
                    transaction.type === 'deposit'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {transaction.type}
                </span>
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-extrabold text-white">
                  ${transaction.amount.toLocaleString()}
                </span>

                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-yellow-400">
                  {transaction.coin}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}