"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  TrendingUp, X, Gem, Coins, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

type Plan = { minAmount: number; durationWeeks: number; expectedReturn: number };
const PLANS: Record<string, Plan> = {
  Gold: { minAmount: 10000, durationWeeks: 8, expectedReturn: 5 },
  Silver: { minAmount: 5000, durationWeeks: 14, expectedReturn: 8 },
  Diamond: { minAmount: 20000, durationWeeks: 23, expectedReturn: 12 },
};

type Asset = { _id: string; name?: string; symbol: string; quantity: number; livePrice?: number };

type ConfirmationData = {
  plan: string; asset: string; amount: number; shares: number;
  assetPrice: number; assetName?: string; duration: number;
  expectedReturn: number; projectedReturns: number;
};

const PLAN_META: Record<string, { icon: React.ElementType; accent: string; label: string }> = {
  Gold: { icon: Coins, accent: "#f59e0b", label: "Steady Growth" },
  Silver: { icon: BarChart3, accent: "#94a3b8", label: "Balanced Risk" },
  Diamond: { icon: Gem, accent: "#60a5fa", label: "Max Returns" },
};

const STEPS = ["Plan", "Asset", "Amount", "Review"];

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] text-white/35 tracking-widest uppercase font-mono">{label}</span>
      <span className={`text-xs font-bold font-mono ${accent ? "text-amber-400" : "text-white"}`}>{value}</span>
    </div>
  );
}

export default function InvestmentWizard({
  assets, onClose, onSuccess,
}: {
  assets: Asset[]; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  const selectedPlanData = selectedPlan ? PLANS[selectedPlan] : null;
  const selectedAssetData = selectedAsset ? assets.find(a => a.symbol === selectedAsset) ?? null : null;
  const assetPrice = selectedAssetData?.livePrice ?? 0;
  const investAmount = parseFloat(amount) || 0;
  const requiredShares = assetPrice > 0 ? Number((investAmount / assetPrice).toFixed(8)) : 0;

  const amountError = useMemo(() => {
    if (!amount) return null;
    if (investAmount <= 0) return "Amount must be greater than 0";
    if (selectedPlanData && investAmount < selectedPlanData.minAmount)
      return `Minimum is $${selectedPlanData.minAmount.toLocaleString()}`;
    if (!selectedAssetData) return "Select an asset first";
    if ((selectedAssetData.quantity ?? 0) < requiredShares)
      return `Insufficient — have ${selectedAssetData.quantity.toFixed(4)} ${selectedAssetData.symbol}`;
    return null;
  }, [amount, investAmount, selectedAssetData, selectedPlanData, requiredShares]);

  const handleNext = () => {
    if (step === 1 && !selectedPlan) { toast.error("Select a plan"); return; }
    if (step === 2 && !selectedAsset) { toast.error("Select an asset"); return; }
    if (step === 3) {
      if (amountError) { toast.error(amountError); return; }
      if (!investAmount) { toast.error("Enter an amount"); return; }
      if (!selectedPlan || !selectedPlanData || !selectedAsset || !selectedAssetData) return;
      const projectedReturns = Number(
        (investAmount * (1 + selectedPlanData.expectedReturn / 100) ** selectedPlanData.durationWeeks).toFixed(2)
      );
      setConfirmationData({
        plan: selectedPlan, asset: selectedAsset, amount: investAmount,
        shares: requiredShares, assetPrice, assetName: selectedAssetData.name,
        duration: selectedPlanData.durationWeeks, expectedReturn: selectedPlanData.expectedReturn,
        projectedReturns,
      });
      setStep(4); return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 4) { setConfirmationData(null); setStep(3); }
    else setStep(s => s - 1);
  };

  const handleConfirm = async () => {
    try {
      setInvesting(true);
      const res = await fetch("/api/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planName: selectedPlan, amount: investAmount, assetSymbol: selectedAsset }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Investment failed"); setInvesting(false); return; }
      setStep(5);
      setTimeout(() => { toast.success("Investment created!"); onSuccess(); }, 2000);
    } catch {
      toast.error("Network error. Please try again.");
      setInvesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full sm:max-w-sm flex flex-col"
        style={{
          background: "linear-gradient(160deg, #13151c 0%, #0d0f14 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          maxHeight: "88vh",
        }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-7 h-1 bg-white/10 rounded-full mx-auto mt-2.5 flex-shrink-0" />

        {/* ── Header ── */}
        <div className="px-4 pt-3 pb-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.22)" }}>
                <TrendingUp size={11} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-[11px] font-bold text-white tracking-widest font-mono">INVESTMENT WIZARD</h2>
                {step < 5 && (
                  <p className="text-[9px] text-white/25 font-mono tracking-widest">STEP {step} OF 4</p>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <X size={11} />
            </button>
          </div>

          {/* Progress bars */}
          {step < 5 && (
            <div className="flex gap-1">
              {STEPS.map((label, i) => {
                const idx = i + 1;
                const active = step === idx;
                const done = step > idx;
                return (
                  <div key={label} className="flex flex-col items-center gap-0.5 flex-1">
                    <div className="h-[2px] w-full rounded-full transition-all duration-300"
                      style={{
                        background: done ? "#f59e0b" : active ? "rgba(251,191,36,0.45)" : "rgba(255,255,255,0.08)",
                      }} />
                    <span className={`text-[8px] font-mono tracking-widest ${active ? "text-amber-400" : done ? "text-white/25" : "text-white/12"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Plan ── */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }} className="flex flex-col gap-2">
                {Object.entries(PLANS).map(([name, details]) => {
                  const meta = PLAN_META[name];
                  const Icon = meta.icon;
                  const selected = selectedPlan === name;
                  return (
                    <button key={name} onClick={() => setSelectedPlan(name)}
                      className="w-full text-left rounded-xl p-3 transition-all"
                      style={{
                        background: selected ? `${meta.accent}12` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? meta.accent + "45" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${meta.accent}15`, border: `1px solid ${meta.accent}25` }}>
                            <Icon size={13} style={{ color: meta.accent }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white font-mono">{name}</span>
                              <span className="text-[8px] px-1 py-0.5 rounded font-mono"
                                style={{ background: `${meta.accent}12`, color: meta.accent }}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/25 font-mono">
                              Min ${details.minAmount.toLocaleString()} · {details.durationWeeks}wk
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-black font-mono" style={{ color: meta.accent }}>
                          {details.expectedReturn}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* ── Step 2: Asset ── */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }} className="flex flex-col gap-1.5">
                {assets.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <AlertCircle size={22} className="text-white/20" />
                    <p className="text-xs text-white/25 font-mono">No assets in portfolio</p>
                  </div>
                ) : assets.map((asset, idx) => {
                  const selected = selectedAsset === asset.symbol;
                  const total = asset.quantity * (asset.livePrice || 0);
                  return (
                    <motion.button key={asset._id} onClick={() => setSelectedAsset(asset.symbol)}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="w-full text-left rounded-xl p-3 transition-all"
                      style={{
                        background: selected ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black font-mono text-amber-400 flex-shrink-0"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.18)" }}>
                            {asset.symbol[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">{asset.symbol}</p>
                            <p className="text-[10px] text-white/25 font-mono">{asset.quantity.toFixed(4)} units</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white font-mono">${fmt(total)}</p>
                          <p className="text-[10px] text-white/25 font-mono">${(asset.livePrice || 0).toFixed(2)} ea</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* ── Step 3: Amount ── */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }} className="flex flex-col gap-3">

                {/* Context chips */}
                <div className="flex gap-1.5">
                  {[
                    { label: "Plan", value: selectedPlan ?? "" },
                    { label: "Asset", value: selectedAsset ?? "" },
                    { label: "Price", value: `$${assetPrice.toFixed(2)}` },
                  ].map(chip => (
                    <div key={chip.label} className="flex-1 rounded-lg p-2 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-[8px] text-white/25 font-mono uppercase tracking-widest">{chip.label}</p>
                      <p className="text-[10px] font-bold text-white font-mono mt-0.5 truncate">{chip.value}</p>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 font-mono text-base font-bold">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder={`${selectedPlanData?.minAmount ?? 0}`}
                      className="w-full pl-7 pr-3 py-3 text-lg font-black font-mono text-white placeholder-white/12 rounded-xl outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${amountError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                      }}
                      min={selectedPlanData?.minAmount}
                      step="100"
                    />
                  </div>
                  {amountError ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <AlertCircle size={10} className="text-red-400 flex-shrink-0" />
                      <p className="text-[10px] text-red-400 font-mono">{amountError}</p>
                    </div>
                  ) : selectedPlanData && (
                    <p className="text-[9px] text-white/20 font-mono mt-1 ml-0.5">
                      Min ${selectedPlanData.minAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Quick amounts */}
                {selectedPlanData && (
                  <div className="flex gap-1.5">
                    {[1, 2, 5].map(mult => {
                      const val = selectedPlanData.minAmount * mult;
                      return (
                        <button key={mult} onClick={() => setAmount(String(val))}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold font-mono text-white/35 hover:text-amber-400 transition-colors"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          ${(val / 1000).toFixed(0)}k
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Live preview */}
                {investAmount > 0 && assetPrice > 0 && !amountError && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)" }}>
                    <Row label="Shares" value={requiredShares.toFixed(6)} />
                    <Row label="At Price" value={`$${assetPrice.toFixed(2)}`} />
                    {selectedPlanData && (
                      <Row label="Est. Return"
                        value={`$${fmt(investAmount * (1 + selectedPlanData.expectedReturn / 100) ** selectedPlanData.durationWeeks)}`}
                        accent />
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Step 4: Confirm ── */}
            {step === 4 && confirmationData && (
              <motion.div key="s4"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }} className="flex flex-col gap-2.5">

                {/* Hero */}
                <div className="rounded-xl p-3.5 text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(251,191,36,0.09) 0%, rgba(251,191,36,0.03) 100%)",
                    border: "1px solid rgba(251,191,36,0.18)",
                  }}>
                  <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-0.5">Investing</p>
                  <p className="text-3xl font-black text-amber-400 font-mono">${fmt(confirmationData.amount)}</p>
                  <p className="text-[10px] text-white/25 font-mono mt-0.5">
                    {confirmationData.plan} Plan · {confirmationData.asset}
                  </p>
                </div>

                {/* Details */}
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Row label="Shares" value={confirmationData.shares.toFixed(6)} />
                  <Row label="Price/Share" value={`$${confirmationData.assetPrice.toFixed(2)}`} />
                  <Row label="Duration" value={`${confirmationData.duration}wk`} />
                  <Row label="Expected Return" value={`${confirmationData.expectedReturn}%`} />
                </div>

                {/* Projected */}
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.18)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/25 font-mono uppercase tracking-widest">Projected Value</p>
                      <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                        ${fmt(confirmationData.projectedReturns)}
                      </p>
                    </div>
                    <TrendingUp size={16} className="text-emerald-400/40" />
                  </div>
                </div>

                {/* Lock note */}
                <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                  style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
                  <span className="text-[10px]">⏳</span>
                  <p className="text-[10px] text-white/30 font-mono">
                    Locked {confirmationData.duration}wk · early withdrawal unavailable
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step 5: Success ── */}
            {step === 5 && (
              <motion.div key="s5"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 gap-3">
                <motion.div
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.25)" }}>
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <h3 className="text-base font-black text-white font-mono">Investment Active</h3>
                  <p className="text-[11px] text-white/25 font-mono mt-1">Your position has been opened.</p>
                </div>
                <div className="rounded-xl px-6 py-3 text-center"
                  style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)" }}>
                  <p className="text-xl font-black text-amber-400 font-mono">${fmt(confirmationData?.amount ?? 0)}</p>
                  <p className="text-[10px] text-white/25 font-mono mt-0.5">{confirmationData?.plan} Plan</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        {step !== 5 && (
          <div className="flex-shrink-0 px-4 py-3 flex gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => step === 1 ? onClose() : handleBack()}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold font-mono text-white/35 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ChevronLeft size={13} /> {step === 1 ? "Cancel" : "Back"}
            </button>

            <motion.button
              onClick={step === 4 ? handleConfirm : handleNext}
              disabled={investing}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black font-mono transition-all disabled:opacity-40"
              style={{
                background: step === 4
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: step === 4
                  ? "0 0 16px rgba(16,185,129,0.2)"
                  : "0 0 16px rgba(245,158,11,0.2)",
                color: "#000",
              }}
            >
              {investing ? (
                <span className="flex items-center gap-1.5">
                  <motion.div animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black" />
                  Processing…
                </span>
              ) : (
                <>
                  {step === 4 ? "Confirm Investment" : "Continue"}
                  <ChevronRight size={13} />
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}