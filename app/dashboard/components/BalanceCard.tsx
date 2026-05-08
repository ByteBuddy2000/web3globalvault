"use client";

import {
  Wallet,
  CheckCircle2,
  XCircle,
  Copy,
  TrendingUp,
  Send,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import LoadingSkeleton from "./LoadingSkeleton";

type BalanceCardProps = {
  userData: any;
  copiedAcct: boolean;
  onCopyAccount: () => void;
  onTopUp: () => void;
  onHistory: () => void;
};

export default function BalanceCard({
  userData,
  copiedAcct,
  onCopyAccount,
  onTopUp,
  onHistory,
}: BalanceCardProps) {
  const [sparkline, setSparkline] = useState<number[]>([]);
  const [showBalance, setShowBalance] = useState(true);

  // Use SWR to fetch full assets list (so we can compute total from livePrice like investments page)
  const fetcher = async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch assets");
    }
    return res.json();
  };

  const { data, error, isLoading } = useSWR("/api/assets", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
    dedupingInterval: 5000,
  });

  const loadingBalance = isLoading;
  const totalBalance =
    data && Array.isArray(data.assets)
      ? data.assets.reduce((sum: number, a: any) => {
          const qty = Number(a.quantity ?? 0);
          const price = Number(a.livePrice ?? a.price ?? 0);
          return sum + qty * price;
        }, 0)
      : null;

  // Fake sparkline values (simulate daily trend)
  useEffect(() => {
    const values = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 50) + 50
    );
    setSparkline(values);
  }, []);

  return (
    <div className="card relative overflow-hidden rounded-3xl p-3 sm:p-8 flex flex-col gap-4 sm:gap-6 mb-6">
      {/* Subtle accent glow */}
      <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(212,175,55,0.03), transparent 25%)' }} />

      {/* Header: Icon + Balance */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-black/40 flex items-center justify-center shadow-lg ring-4 ring-yellow-200/8 relative">
            <Wallet className="w-7 h-7 sm:w-10 sm:h-10 text-accent" />
            {/* <div className="absolute -bottom-2 -right-2">
              {userData?.kycVerified ? (
                <CheckCircle2 className="w-7 h-7 text-red-400 bg-black rounded-full border border-white/6 shadow" />
              ) : (
                // <XCircle className="w-7 h-7 text-green-400 bg-black rounded-full border border-white/6 shadow" />
              )}
            </div> */}
          </div>
          <div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
                Portfolio Balance
              </h2>
              <button
                type="button"
                onClick={() => setShowBalance((prev) => !prev)}
                className="inline-flex items-center gap-2 text-xs text-muted hover:text-white transition"
              >
                {showBalance ? (
                  <>
                    <EyeOff className="w-4 h-4" /> Hide balance
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Show balance
                  </>
                )}
              </button>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl sm:text-5xl font-extrabold text-accent tracking-tight break-words">
                {loadingBalance ? (
                  <span className="inline-block align-middle w-40 h-8">
                    <LoadingSkeleton className="w-full h-8 rounded-md" />
                  </span>
                ) : !showBalance ? (
                  "****.**"
                ) : totalBalance !== null ? (
                  `$${totalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                ) : (
                  "--"
                )}
              </span>
              <span className="text-xs text-muted mb-1">USD</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium mt-1">
              <TrendingUp className="w-4 h-4" />
              +4.3% Today
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col items-end gap-2">
          <svg viewBox="0 0 120 40" className="w-24 h-10 sm:w-32 sm:h-12">
            <polyline
              fill="none"
              stroke="#D4AF37"
              strokeWidth="3"
              strokeLinecap="round"
              points={sparkline
                .map((v, i) => `${i * 10},${40 - (v / 100) * 40}`)
                .join(" ")}
            />
          </svg>
          <span className="text-xs text-muted">Updated just now</span>
        </div>
      </div>

      {/* Account info */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/6 pt-4">
        <div className="flex flex-col max-w-full">
          <span className="text-xs text-slate-400">Account Number</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm text-accent">
              {userData?.accountNumber || "--"}
            </span>
            <button
              type="button"
              onClick={onCopyAccount}
              className="px-2 py-1 btn-accent rounded-md text-xs font-semibold flex items-center gap-1 transition"
            >
              <Copy className="w-4 h-4" />
              {copiedAcct ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTopUp}
            className="flex items-center gap-2 px-3 py-2 btn-accent rounded-lg font-semibold text-sm"
          >
            <Send className="w-4 h-4" /> Top Up
          </button>
          <button
            type="button"
            onClick={onHistory}
            className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/6 text-white rounded-lg font-semibold shadow transition text-sm"
          >
            <DollarSign className="w-4 h-4" /> History
          </button>
        </div>
      </div>
    </div>
  );
}
