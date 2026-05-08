"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, X, Loader } from "lucide-react";
import { toast } from "sonner";

interface Investment {
  _id: string;
  amount: number;
  startDate: string;
  planName: string;
  assetSymbol: string;
  sharesDeducted?: number;
  expectedAnnualReturn?: number;
}

interface WithdrawalBreakdown {
  originalInvestment: number;
  currentMarketValue: number;
  sharesReturned: number;
  withdrawalPrice: number;
  gains: number;
  gainPercentage: number;
  withdrawalFeePercentage: number;
  withdrawalFee: number;
  netProceeds: number;
  holdingPeriod: string;
}

export default function WithdrawalModal({ 
  investment, 
  onClose, 
  onSuccess 
}: { 
  investment: Investment; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [withdrawing, setWithdrawing] = useState(false);
  const [breakdownData, setBreakdownData] = useState<WithdrawalBreakdown | null>(null);
  const [assetData, setAssetData] = useState<any>(null);
  const [loadingAsset, setLoadingAsset] = useState(true);

  // Fetch asset details on mount
  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setLoadingAsset(true);
        const response = await fetch('/api/investment', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        const asset = data.assets?.find((a: any) => a.symbol === investment.assetSymbol);
        if (asset) {
          setAssetData(asset);
        }
      } catch (err) {
        console.error('Failed to fetch asset data:', err);
      } finally {
        setLoadingAsset(false);
      }
    };

    fetchAssetData();
  }, [investment.assetSymbol]);

  const handleReview = async () => {
    try {
      setWithdrawing(true);
      const response = await fetch("/api/investment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "withdraw",
          investmentId: investment._id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setBreakdownData(data.breakdown);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Unable to process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };
  

    const handleConfirmWithdrawal = async () => {
      try {
        setWithdrawing(true);
        const response = await fetch("/api/investment", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "withdraw",
            investmentId: investment._id,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setStep(3);
        setTimeout(() => {
          toast.success("Withdrawal completed successfully!");
          onSuccess();
        }, 2000);
      } catch (err: any) {
        toast.error(err.message || "Withdrawal failed");
        setWithdrawing(false);
      }
    };

  const holdingPeriodDays = Math.floor((Date.now() - new Date(investment.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const canWithdraw = holdingPeriodDays >= 1;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-2xl sm:max-w-2xl max-h-[94vh] overflow-auto p-4 sm:p-0"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/6 flex justify-between items-center bg-gradient-to-r from-black/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-accent">Withdrawal Request</h2>
            <p className="text-muted text-sm mt-1">{investment?.planName} Plan</p>
          </div>
          <button onClick={onClose} aria-label="Close withdrawal modal" className="text-muted hover:text-accent transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 min-h-[420px] sm:min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Review */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-semibold text-white mb-6">Review Investment Details</h3>

                <div className="space-y-3 mb-8">
                  {/* Investment Info */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/6">
                    <p className="text-muted text-sm">Invested Amount</p>
                    <p className="text-white font-bold text-xl">${investment?.amount?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  </div>

                  {/* Asset Info - with live data */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/6">
                      <p className="text-muted text-sm">Asset</p>
                      <p className="text-white font-semibold">{investment?.assetSymbol}</p>
                      {assetData && !loadingAsset && (
                        <p className="text-xs text-muted mt-1">{assetData.name}</p>
                      )}
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-white/6">
                      <p className="text-muted text-sm">Current Price</p>
                      {loadingAsset ? (
                        <Loader className="w-4 h-4 animate-spin text-accent mt-1" />
                      ) : (
                        <p className="text-accent font-semibold">${(assetData?.livePrice || 0).toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  {/* Shares Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/6">
                      <p className="text-muted text-sm">Shares Invested</p>
                      <p className="text-white font-semibold">{investment?.sharesDeducted?.toFixed(8)}</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-white/6">
                      <p className="text-muted text-sm">Est. Current Value</p>
                      {loadingAsset ? (
                        <Loader className="w-4 h-4 animate-spin text-accent mt-1" />
                      ) : (
                        <p className="text-accent font-semibold">
                          ${((investment?.sharesDeducted || 0) * (assetData?.livePrice || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-sm">Start Date</p>
                      <p className="text-white font-semibold">{new Date(investment?.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-sm">Holding Period</p>
                      <p className={`font-semibold ${holdingPeriodDays >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {holdingPeriodDays} day{holdingPeriodDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Withdrawal Eligibility */}
                  {!canWithdraw && (
                    <div className="p-4 rounded-lg bg-yellow-500/8 border border-yellow-500/20 flex items-start gap-3">
                      <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-yellow-400 text-sm">Minimum Hold Period Not Met</p>
                        <p className="text-yellow-300/70 text-xs">
                          This investment must be held for at least 24 hours. You can withdraw on {new Date(new Date(investment.startDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {canWithdraw && (
                    <div className="p-4 rounded-lg bg-green-500/8 border border-green-500/20 flex items-start gap-3">
                      <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-green-400 text-sm">Eligible for Withdrawal</p>
                        <p className="text-green-300/70 text-xs">
                          You can proceed with the withdrawal. A 0.5% fee will be applied.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-6">
                  Click "Review Breakdown" to see your current market value, gains/losses, and net proceeds.
                </p>
              </motion.div>
            )}

            {/* Step 2: Breakdown */}
            {step === 2 && breakdownData && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-semibold text-white mb-6">Withdrawal Breakdown</h3>

                <div className="space-y-4">
                  {/* Original Investment */}
                  <div className="bg-black/10 p-4 rounded-lg border border-white/6">
                    <p className="text-muted text-sm flex justify-between">
                      <span>Original Investment</span>
                      <span className="text-white font-semibold">${breakdownData.originalInvestment?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>

                  {/* Current Market Value */}
                  <div className="bg-black/10 p-4 rounded-lg border border-white/6">
                    <p className="text-muted text-sm flex justify-between items-center mb-2">
                      <span>Current Market Value</span>
                      <span className="text-accent font-semibold">${breakdownData.currentMarketValue?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {breakdownData.sharesReturned.toFixed(8)} shares @ ${breakdownData.withdrawalPrice?.toFixed(2)}/share
                    </p>
                  </div>

                  {/* Gains/Losses */}
                  <div className={`p-4 rounded-lg border-2 flex justify-between items-center ${
                    breakdownData.gains >= 0
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-center gap-2">
                      {breakdownData.gains >= 0 ? (
                        <>
                          <TrendingUp className="text-green-400" size={20} />
                          <div>
                            <p className="text-green-400 font-semibold">Gain</p>
                            <p className="text-xs text-green-300/70">{parseFloat(breakdownData.gainPercentage.toString())}% return</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="text-red-400" size={20} />
                          <div>
                            <p className="text-red-400 font-semibold">Loss</p>
                            <p className="text-xs text-red-300/70">{parseFloat(breakdownData.gainPercentage.toString())}% loss</p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className={`font-bold text-xl ${breakdownData.gains >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${Math.abs(breakdownData.gains).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-700 pt-4">
                    {/* Withdrawal Fee */}
                    <div className="bg-black/10 p-4 rounded-lg border border-white/6 mb-3">
                      <p className="text-muted text-sm flex justify-between">
                        <span>Withdrawal Fee (0.5%)</span>
                        <span className="text-red-400">-${breakdownData.withdrawalFee?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                      </p>
                    </div>

                    {/* Net Proceeds */}
                    <div className="bg-gradient-to-r from-amber-500/12 to-amber-600/12 p-4 rounded-lg border border-amber-500/30">
                      <p className="text-muted text-sm mb-2">Net Proceeds (After Fees)</p>
                      <p className="text-accent font-bold text-2xl">
                        ${breakdownData.netProceeds?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        Will be credited to your USDT account
                      </p>
                    </div>
                  </div>

                  {/* Holding Period Info */}
                  <div className="p-4 rounded-lg bg-black/8 border border-white/6 flex items-start gap-3">
                    <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-accent text-sm">Holding Period</p>
                      <p className="text-muted text-xs">Investment held for {breakdownData.holdingPeriod}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Withdrawal Completed!</h3>
                <p className="text-slate-400 mb-6">Your investment has been withdrawn and proceeds have been credited to your USDT account.</p>
                <div className="bg-amber-500/20 p-4 rounded-lg border border-amber-500/30 inline-block">
                  <p className="text-amber-400 font-semibold text-lg">
                    ${breakdownData?.netProceeds?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-400">Net Proceeds</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 3 && (
          <div className="border-t border-slate-800 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between bg-slate-900/50">
            <button
              onClick={() => (step === 2 ? setStep(1) : onClose)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-white hover:bg-slate-800 transition w-full sm:w-auto justify-center"
            >
              <ChevronLeft size={18} /> {step === 2 ? "Back" : "Cancel"}
            </button>

            {step === 1 ? (
              <motion.button
                onClick={handleReview}
                disabled={withdrawing || !canWithdraw}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 btn-accent font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto justify-center"
                aria-label="Review withdrawal breakdown"
              >
                {withdrawing ? "Processing..." : "Review Breakdown"}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleConfirmWithdrawal}
                disabled={withdrawing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition w-full sm:w-auto justify-center"
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
