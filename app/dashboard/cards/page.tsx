"use client";
import { useEffect, useState } from "react";
import {
  CreditCard, Plus, Eye, EyeOff, Copy, Check, Zap, Shield, TrendingUp,
  Loader, ChevronRight, ArrowUpRight, Lock, Wifi, MoreHorizontal, AlertCircle,
  CheckCircle2, Clock, XCircle, Send
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Card = {
  _id: string;
  cardNumber: string;
  cardHolder: string;
  cardType: "VIRTUAL" | "PHYSICAL";
  tierLevel: "BASIC" | "SILVER" | "GOLD" | "PLATINUM";
  validThru: string;
  cvv: string;
  balance: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailySpent: number;
  monthlySpent: number;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";
  requestStatus: "DRAFT" | "PAYMENT_PENDING" | "PAYMENT_RECEIVED" | "ADMIN_APPROVED" | "ADMIN_REJECTED";
  paymentAmount: number;
  paymentCurrency: string;
  usdtAddress: string;
  transactionHash: string;
  transactionHashVerified: boolean;
  paymentVerificationStatus: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
};

/* ─── Tier config ────────────────────────────────────────────── */
const TIERS: Record<string, any> = {
  BASIC: { label: "Basic", daily: "$5K", monthly: "$50K", fee: "Free", feeNum: 0, accent: "#888a96", accentDim: "rgba(136,138,150,0.12)", cardBg: "linear-gradient(135deg,#1a1a24 0%,#13131c 100%)", cardLine: "rgba(136,138,150,0.25)", rank: 0 },
  SILVER: { label: "Silver", daily: "$10K", monthly: "$100K", fee: "$5", feeNum: 5, accent: "#b0b8c8", accentDim: "rgba(176,184,200,0.12)", cardBg: "linear-gradient(135deg,#1c1e26 0%,#14151f 100%)", cardLine: "rgba(176,184,200,0.3)", rank: 1 },
  GOLD: { label: "Gold", daily: "$25K", monthly: "$250K", fee: "$15", feeNum: 15, accent: "#c9a84c", accentDim: "rgba(201,168,76,0.12)", cardBg: "linear-gradient(135deg,#1e1a0e 0%,#141108 100%)", cardLine: "rgba(201,168,76,0.35)", rank: 2 },
  PLATINUM: { label: "Platinum", daily: "$50K", monthly: "$500K", fee: "$30", feeNum: 30, accent: "#818cf8", accentDim: "rgba(129,140,248,0.12)", cardBg: "linear-gradient(135deg,#0f0e1a 0%,#0a0914 100%)", cardLine: "rgba(129,140,248,0.35)", rank: 3 },
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#10b981",
  INACTIVE: "#6b7280",
  BLOCKED: "#f43f5e",
  PENDING: "#f59e0b",
};

const REQUEST_STATUS_INFO: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "#6b7280", icon: <Clock size={16} /> },
  PAYMENT_PENDING: { label: "Awaiting Payment", color: "#f59e0b", icon: <AlertCircle size={16} /> },
  PAYMENT_RECEIVED: { label: "Payment Received - Awaiting Admin", color: "#3b82f6", icon: <Clock size={16} /> },
  ADMIN_APPROVED: { label: "Approved", color: "#10b981", icon: <CheckCircle2 size={16} /> },
  ADMIN_REJECTED: { label: "Rejected", color: "#f43f5e", icon: <XCircle size={16} /> },
};

/* ─── Helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function maskNumber(num: string) {
  const clean = num.replace(/\s/g, "");
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

/* ─── Card Visual ────────────────────────────────────────────── */
function CardFace({ card }: { card: Card }) {
  const t = TIERS[card.tierLevel];
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1.586",
        borderRadius: 18,
        background: t.cardBg,
        border: `1px solid ${t.cardLine}`,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 24px 48px rgba(0,0,0,0.5)`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, opacity: 0.4, pointerEvents: "none" }} />
      
      <div style={{
        position: "absolute", bottom: -30, right: -30, width: 140, height: 140,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Card Tier</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.accent }}>{t.label}</div>
        </div>
        <div style={{ width: 32, height: 24, borderRadius: 5, background: "linear-gradient(135deg, #c9a84c33, #c9a84c18)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={12} color="#c9a84c" />
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.18em", color: "rgba(255,255,255,0.85)", fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}>
          {maskNumber(card.cardNumber)}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>Card Holder</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{card.cardHolder}</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{card.validThru}</div>
        </div>
        <Wifi size={16} style={{ color: `${t.accent}80` }} />
      </div>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status, requestStatus }: { status: string; requestStatus: string }) {
  const info = REQUEST_STATUS_INFO[requestStatus] || REQUEST_STATUS_INFO.DRAFT;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, background: `${info.color}20`, color: info.color }}>
      {info.icon}
      {info.label}
    </div>
  );
}

/* ─── Modal Shell ────────────────────────────────────────────── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.75)",
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, borderRadius: 20, padding: 28,
          background: "#0c0c14", border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.7)",
          position: "relative", maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [revealNumber, setRevealNumber] = useState(false);
  const [revealCVV, setRevealCVV] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedCVV, setCopiedCVV] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"BASIC" | "SILVER" | "GOLD" | "PLATINUM">("BASIC");
  const [selectedType, setSelectedType] = useState<"VIRTUAL" | "PHYSICAL">("VIRTUAL");
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [submittingTx, setSubmittingTx] = useState(false);
  const [txHashError, setTxHashError] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setCards(d.cards || []);
      }
    } catch {
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 1: Create Card Draft ───────────────────────────────── */
  const handleCreateCardDraft = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierLevel: selectedTier, cardType: selectedType }),
      });

      if (res.ok) {
        const d = await res.json();
        setCards([d.card, ...cards]);
        toast.success("Card draft created! Proceed to payment.");
        setShowCardForm(false);
        // Automatically show payment flow for the new card
        setSelectedCard(d.card);
        setShowPaymentFlow(true);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create card");
      }
    } catch {
      toast.error("Error creating card");
    } finally {
      setProcessing(false);
    }
  };

  /* ─── Step 2: Request Payment Details ───────────────────────────── */
  const handleGeneratePaymentRequest = async (card: Card) => {
    if (!card) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/cards/payment-request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card._id }),
      });

      if (res.ok) {
        const d = await res.json();
        // Update card with payment details
        const updated = { ...card, ...d.paymentDetails, usdtAddress: d.paymentDetails.paymentAddress };
        setSelectedCard(updated);
        setCards(cards.map(c => c._id === card._id ? updated : c));
        toast.success("Payment request generated");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to generate payment request");
      }
    } catch {
      toast.error("Error generating payment request");
    } finally {
      setProcessing(false);
    }
  };

  /* ─── Step 3: Submit Transaction Hash ───────────────────────────── */
  const validateTxHash = (hash: string) => {
    const cleanHash = hash.trim();
    if (!cleanHash) {
      setTxHashError("");
      return false;
    }
    
    let hashToValidate = cleanHash;
    if (!hashToValidate.startsWith('0x')) {
      hashToValidate = '0x' + hashToValidate;
    }
    
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(hashToValidate)) {
      const length = hashToValidate.length;
      if (length < 66) {
        setTxHashError(`Hash too short (${length - 2}/64 hex characters)`);
      } else if (length > 66) {
        setTxHashError(`Hash too long (${length - 2}/64 hex characters)`);
      } else {
        setTxHashError("Invalid characters in hash (only 0-9 and a-f allowed)");
      }
      return false;
    }
    
    setTxHashError("");
    return true;
  };

  const handleSubmitTransaction = async (card: Card) => {
    const cleanHash = txHash.trim();
    if (!cleanHash) {
      toast.error("Please enter transaction hash");
      return;
    }

    if (!validateTxHash(cleanHash)) {
      toast.error(txHashError || "Invalid transaction hash format");
      return;
    }

    setSubmittingTx(true);
    try {
      const res = await fetch("/api/cards/submit-transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card._id, transactionHash: cleanHash }),
      });

      if (res.ok) {
        const d = await res.json();
        const updated = { ...card, ...d.card, requestStatus: "PAYMENT_RECEIVED" };
        setSelectedCard(updated);
        setCards(cards.map(c => c._id === card._id ? updated : c));
        setTxHash("");
        setTxHashError("");
        toast.success("Transaction submitted! Awaiting Confirmation.");
        setShowPaymentFlow(false);
      } else {
        const err = await res.json();
        const errorMsg = err.message || "Failed to submit transaction";
        setTxHashError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = "Error submitting transaction";
      setTxHashError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmittingTx(false);
    }
  };

  /* ─── Copy Utilities ────────────────────────────────────────────── */
  const copyText = async (text: string, type: "card" | "cvv" | "address") => {
    await navigator.clipboard.writeText(text);
    if (type === "card") {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } else if (type === "cvv") {
      setCopiedCVV(true);
      setTimeout(() => setCopiedCVV(false), 2000);
    }
    toast.success("Copied!");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader size={22} style={{ color: "#6366f1", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080810", padding: "40px 24px 80px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>My Cards</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>Manage your virtual and physical cards</p>
          </div>
          <button
            onClick={() => setShowCardForm(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            <Plus size={18} />
            New Card
          </button>
        </div>

        {/* ─── Cards Grid ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
          {cards.map(card => (
            <motion.div
              key={card._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: 20, background: "#0c0c14",
                border: "1px solid rgba(255,255,255,0.08)", padding: 20,
                cursor: "pointer", transition: "all 0.3s",
              }}
              onClick={() => {
                setSelectedCard(card);
                setShowDetails(true);
              }}
            >
              <CardFace card={card} />
              <div style={{ marginTop: 16 }}>
                <StatusBadge status={card.status} requestStatus={card.requestStatus} />
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                <span>{TIERS[card.tierLevel].label}</span>
                <span>•</span>
                <span>{card.cardType}</span>
              </div>
              {["DRAFT", "PAYMENT_PENDING"].includes(card.requestStatus) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(card);
                    setShowPaymentFlow(true);
                  }}
                  style={{
                    width: "100%", marginTop: 12, padding: "10px 16px", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                    color: "#6366f1", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Continue Application
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            borderRadius: 20, border: "2px dashed rgba(255,255,255,0.1)",
          }}>
            <CreditCard size={48} style={{ color: "rgba(255,255,255,0.2)", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>No cards yet</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Create your first card to get started</p>
            <button
              onClick={() => setShowCardForm(true)}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}
            >
              Create Card
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODAL: CREATE CARD
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCardForm && (
          <Modal onClose={() => setShowCardForm(false)}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Apply for Card</h2>

            {/* Tier Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Card Tier</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 12 }}>
                {["BASIC", "SILVER", "GOLD", "PLATINUM"].map(tier => {
                  const t = TIERS[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier as any)}
                      style={{
                        padding: 16, borderRadius: 12, border: selectedTier === tier ? "2px solid" + t.accent : "1px solid rgba(255,255,255,0.08)",
                        background: selectedTier === tier ? t.accentDim : "rgba(255,255,255,0.02)",
                        color: "#fff", cursor: "pointer", transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Fee: {t.fee}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Daily: {t.daily}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Type Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Card Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                {["VIRTUAL", "PHYSICAL"].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as any)}
                    style={{
                      padding: 16, borderRadius: 12, border: selectedType === type ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                      background: selectedType === type ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                      color: "#fff", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => setShowCardForm(false)}
                style={{
                  padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCardDraft}
                disabled={processing}
                style={{
                  padding: "12px 20px", borderRadius: 10, border: "none",
                  background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer",
                  opacity: processing ? 0.5 : 1,
                }}
              >
                {processing ? "Creating..." : "Create Card"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          MODAL: PAYMENT FLOW
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPaymentFlow && selectedCard && (
          <Modal onClose={() => setShowPaymentFlow(false)}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Complete Your Application</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Follow these steps to activate your card</p>

            {selectedCard.requestStatus === "DRAFT" && (
              <>
                <div style={{ padding: 16, borderRadius: 12, background: "#6366f120", border: "1px solid #6366f1", marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", marginBottom: 8 }}>Step 1: Generate Payment Request</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>Click the button below to generate your payment address</p>
                </div>
                <button
                  onClick={() => handleGeneratePaymentRequest(selectedCard)}
                  disabled={processing}
                  style={{
                    width: "100%", padding: "12px 20px", borderRadius: 10, border: "none",
                    background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer",
                    opacity: processing ? 0.5 : 1,
                  }}
                >
                  {processing ? "Generating..." : "Generate Payment Request"}
                </button>
              </>
            )}

            {selectedCard.requestStatus === "PAYMENT_PENDING" && (
              <>
                <div style={{ padding: 16, borderRadius: 12, background: "#f59e0b20", border: "1px solid #f59e0b", marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 8 }}>Payment Address</div>
                  <div style={{
                    padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                    fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#fff",
                    marginBottom: 8,
                  }}>
                    {selectedCard.usdtAddress}
                  </div>
                  <button
                    onClick={() => copyText(selectedCard.usdtAddress, "address")}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent", color: "#6366f1", fontWeight: 600, fontSize: 12, cursor: "pointer",
                    }}
                  >
                    <Copy size={14} style={{ display: "inline", marginRight: 6 }} />
                    Copy Address
                  </button>
                </div>

                <div style={{ padding: 16, borderRadius: 12, background: "#10b98120", border: "1px solid #10b981", marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>Payment Amount</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>${selectedCard.paymentAmount} USDT</div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 8 }}>Transaction Hash</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => {
                      setTxHash(e.target.value);
                      validateTxHash(e.target.value);
                    }}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10, 
                      border: txHashError ? "1.5px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                      background: txHashError ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)", 
                      color: "#fff", fontSize: 13, fontFamily: "monospace",
                    }}
                  />
                  <p style={{ fontSize: 11, color: txHashError ? "#ef4444" : "rgba(255,255,255,0.4)", marginTop: 6 }}>
                    {txHashError || "Paste your blockchain transaction hash"}
                  </p>
                </div>

                <button
                  onClick={() => handleSubmitTransaction(selectedCard)}
                  disabled={submittingTx || !txHash.trim() || txHashError !== ""}
                  style={{
                    width: "100%", padding: "12px 20px", borderRadius: 10, border: "none",
                    background: "#10b981", color: "#fff", fontWeight: 600, cursor: submittingTx || !txHash.trim() || txHashError !== "" ? "not-allowed" : "pointer",
                    opacity: submittingTx || !txHash.trim() || txHashError !== "" ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Send size={16} />
                  {submittingTx ? "Submitting..." : "Submit Transaction"}
                </button>
              </>
            )}

            {selectedCard.requestStatus === "PAYMENT_RECEIVED" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Clock size={48} style={{ color: "#f59e0b", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Awaiting Admin Verification</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Your transaction has been received. Our team will verify it shortly.</p>
                <button
                  onClick={() => setShowPaymentFlow(false)}
                  style={{
                    padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          MODAL: CARD DETAILS
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDetails && selectedCard && (
          <Modal onClose={() => setShowDetails(false)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0 }}>Card Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)",
                  cursor: "pointer", fontSize: 20, border: "none",
                }}
              >
                ×
              </button>
            </div>

            <CardFace card={selectedCard} />

            <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Card Number</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: "monospace", color: "#fff", fontSize: 14 }}>
                    {revealNumber ? selectedCard.cardNumber : maskNumber(selectedCard.cardNumber)}
                  </span>
                  <button onClick={() => setRevealNumber(!revealNumber)} style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer" }}>
                    {revealNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyText(selectedCard.cardNumber, "card")}
                    style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer" }}
                  >
                    {copiedCard ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>CVV</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <span style={{ fontFamily: "monospace", color: "#fff", fontSize: 14 }}>
                    {revealCVV ? selectedCard.cvv : "••••"}
                  </span>
                  <button onClick={() => setRevealCVV(!revealCVV)} style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer" }}>
                    {revealCVV ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyText(selectedCard.cvv, "cvv")}
                    style={{ border: "none", background: "none", color: "#6366f1", cursor: "pointer" }}
                  >
                    {copiedCVV ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {selectedCard.transactionHash && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Transaction Hash</label>
                  <div style={{
                    padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                    fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#fff",
                    marginTop: 8,
                  }}>
                    {selectedCard.transactionHash}
                  </div>
                </div>
              )}
            </div>

            <StatusBadge status={selectedCard.status} requestStatus={selectedCard.requestStatus} />

            <button
              onClick={() => setShowDetails(false)}
              style={{
                width: "100%", marginTop: 24, padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "#fff", fontWeight: 600, cursor: "pointer",
              }}
            >
              Close
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
