"use client";
import { useEffect, useState } from "react";
import {
  CreditCard, Plus, Eye, EyeOff, Copy, Check, Zap,
  Shield, TrendingUp, Loader, ChevronRight, ArrowUpRight,
  Lock, Wifi, MoreHorizontal
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
};

/* ─── Tier config ────────────────────────────────────────────── */
const TIERS: Record<string, {
  label: string; daily: string; monthly: string; fee: string; feeNum: number;
  accent: string; accentDim: string; cardBg: string; cardLine: string; rank: number;
}> = {
  BASIC:    { label: "Basic",    daily: "$5K",   monthly: "$50K",   fee: "Free",   feeNum: 0,  accent: "#888a96",  accentDim: "rgba(136,138,150,0.12)", cardBg: "linear-gradient(135deg,#1a1a24 0%,#13131c 100%)", cardLine: "rgba(136,138,150,0.25)", rank: 0 },
  SILVER:   { label: "Silver",   daily: "$10K",  monthly: "$100K",  fee: "$5/mo",  feeNum: 5,  accent: "#b0b8c8",  accentDim: "rgba(176,184,200,0.12)", cardBg: "linear-gradient(135deg,#1c1e26 0%,#14151f 100%)", cardLine: "rgba(176,184,200,0.3)",  rank: 1 },
  GOLD:     { label: "Gold",     daily: "$25K",  monthly: "$250K",  fee: "$15/mo", feeNum: 15, accent: "#c9a84c",  accentDim: "rgba(201,168,76,0.12)",  cardBg: "linear-gradient(135deg,#1e1a0e 0%,#141108 100%)", cardLine: "rgba(201,168,76,0.35)",  rank: 2 },
  PLATINUM: { label: "Platinum", daily: "$50K",  monthly: "$500K",  fee: "$30/mo", feeNum: 30, accent: "#818cf8",  accentDim: "rgba(129,140,248,0.12)", cardBg: "linear-gradient(135deg,#0f0e1a 0%,#0a0914 100%)", cardLine: "rgba(129,140,248,0.35)", rank: 3 },
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#10b981", INACTIVE: "#6b7280", BLOCKED: "#f43f5e", PENDING: "#f59e0b",
};

/* ─── Helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
function maskNumber(num: string) {
  const clean = num.replace(/\s/g, "");
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}
function chunkNumber(num: string) {
  const clean = num.replace(/\s/g, "");
  return clean.match(/.{1,4}/g)?.join("  ") ?? num;
}

/* ─── Physical card visual ───────────────────────────────────── */
function CardFace({
  card, reveal = false,
}: { card: Card; reveal?: boolean }) {
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
        boxShadow: `0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Subtle noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4, pointerEvents: "none",
      }} />

      {/* Glint line */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg, transparent, ${t.accent}40, transparent)`,
      }} />

      {/* Accent orb */}
      <div style={{
        position: "absolute", bottom: -30, right: -30, width: 140, height: 140,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${t.accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Row 1: type + chip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: `${t.accent}99`, textTransform: "uppercase", marginBottom: 3 }}>
            {card.cardType}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: t.accent, textTransform: "uppercase" }}>
            {t.label}
          </div>
        </div>
        {/* EMV chip */}
        <div style={{
          width: 32, height: 24, borderRadius: 5,
          background: "linear-gradient(135deg, #c9a84c33, #c9a84c18)",
          border: "1px solid rgba(201,168,76,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 18, height: 14, borderRadius: 2, border: "1px solid rgba(201,168,76,0.4)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, padding: 2 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: "rgba(201,168,76,0.3)", borderRadius: 1 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: card number */}
      <div style={{ position: "relative" }}>
        <div style={{
          fontSize: 15, fontWeight: 600, letterSpacing: "0.18em", color: "rgba(255,255,255,0.85)",
          fontFamily: "monospace", fontVariantNumeric: "tabular-nums",
        }}>
          {reveal ? chunkNumber(card.cardNumber) : maskNumber(card.cardNumber)}
        </div>
      </div>

      {/* Row 3: holder + expiry + wifi */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase" }}>
            Card Holder
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>
            {card.cardHolder}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase" }}>
              Expires
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", fontFamily: "monospace" }}>
              {card.validThru}
            </div>
          </div>
          <Wifi size={16} style={{ color: `${t.accent}80`, marginBottom: 2 }} />
        </div>
      </div>

      {/* Status dot */}
      <div style={{
        position: "absolute", top: 18, right: 70,
        width: 6, height: 6, borderRadius: "50%",
        background: STATUS_COLOR[card.status],
        boxShadow: `0 0 6px ${STATUS_COLOR[card.status]}`,
      }} />
    </div>
  );
}

/* ─── Limit bar ──────────────────────────────────────────────── */
function LimitBar({ label, spent, limit, accent }: { label: string; spent: number; limit: number; accent: string }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const remaining = limit - spent;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
          ${fmt(remaining)} left
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: accent, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>${fmt(spent)} spent</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>${fmt(limit)} limit</span>
      </div>
    </div>
  );
}

/* ─── Modal shell ────────────────────────────────────────────── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)",
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "min(420px, 90vw)", borderRadius: 20, padding: "clamp(16px, 5vw, 28px)",
          background: "#0c0c14",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ title, sub, onClose }: { title: string; sub?: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</p>}
      </div>
      <button
        onClick={onClose}
        style={{
          width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)",
          cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
          outline: "none",
        }}
      >×</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function CardsPage() {
  const [cards, setCards]                   = useState<Card[]>([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [selectedCard, setSelectedCard]     = useState<Card | null>(null);
  const [showDetails, setShowDetails]       = useState(false);
  const [revealNumber, setRevealNumber]     = useState(false);
  const [revealCVV, setRevealCVV]           = useState(false);
  const [copiedCard, setCopiedCard]         = useState(false);
  const [copiedCVV, setCopiedCVV]           = useState(false);
  const [selectedTier, setSelectedTier]     = useState<"BASIC"|"SILVER"|"GOLD"|"PLATINUM">("BASIC");
  const [selectedType, setSelectedType]     = useState<"VIRTUAL"|"PHYSICAL">("VIRTUAL");
  const [showPayment, setShowPayment]       = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [deleteConfirm, setDeleteConfirm]   = useState<Card | null>(null);
  const [blockConfirm, setBlockConfirm]     = useState<Card | null>(null);
  const [processing, setProcessing]         = useState(false);

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/cards", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setCards(d.cards || []); }
    } catch { toast.error("Failed to load cards"); }
    finally { setLoading(false); }
  };

  const handlePaymentConfirm = async () => {
    setPaymentProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch("/api/cards", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierLevel: selectedTier, cardType: selectedType }),
      });
      if (res.ok) {
        const d = await res.json();
        setCards([d.card, ...cards]);
        toast.success("Card created successfully!");
        setShowPayment(false);
        setShowForm(false);
      } else { toast.error("Failed to create card"); }
    } catch { toast.error("Error creating card"); }
    finally { setPaymentProcessing(false); }
  };

  const copyText = async (text: string, type: "card" | "cvv") => {
    await navigator.clipboard.writeText(text);
    if (type === "card") { setCopiedCard(true); setTimeout(() => setCopiedCard(false), 2000); }
    else { setCopiedCVV(true); setTimeout(() => setCopiedCVV(false), 2000); }
    toast.success("Copied!");
  };

  const handleDeleteCard = async (card: Card) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/cards/${card._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCards(cards.filter(c => c._id !== card._id));
        toast.success("Card deleted successfully");
        setDeleteConfirm(null);
      } else {
        toast.error("Failed to delete card");
      }
    } catch {
      toast.error("Error deleting card");
    } finally {
      setProcessing(false);
    }
  };

  const handleBlockCard = async (card: Card) => {
    setProcessing(true);
    try {
      const newStatus = card.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
      const res = await fetch(`/api/cards/${card._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedCard = { ...card, status: newStatus as any };
        setCards(cards.map(c => c._id === card._id ? updatedCard : c));
        if (selectedCard?._id === card._id) setSelectedCard(updatedCard);
        toast.success(newStatus === "BLOCKED" ? "Card blocked" : "Card unblocked");
        setBlockConfirm(null);
      } else {
        toast.error("Failed to update card");
      }
    } catch {
      toast.error("Error updating card");
    } finally {
      setProcessing(false);
    }
  };

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader size={22} style={{ color: "#6366f1", animation: "spin 1s linear infinite" }} />
    </div>
  );

  /* ── Main ──────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#080810", padding: "40px 24px 80px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-3px); }
        .tier-btn { transition: all 0.18s ease; }
        .tier-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .action-btn { transition: all 0.18s ease; }
        .action-btn:hover { opacity: 0.85; transform: scale(0.98); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── PAGE HEADER ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CreditCard size={15} style={{ color: "#6366f1" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                Cards
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>
              Your Cards
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
              Virtual &amp; physical cards · {cards.length} active
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 11, cursor: "pointer", outline: "none",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Plus size={14} /> Apply for Card
          </motion.button>
        </motion.div>

        {/* ── TIER OVERVIEW ROW ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 36 }}
        >
          {Object.entries(TIERS).map(([key, t], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{
                padding: "14px 16px", borderRadius: 13,
                background: "rgba(255,255,255,0.025)",
                border: `1px solid rgba(255,255,255,0.06)`,
                borderTop: `1px solid ${t.cardLine}`,
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, width: 50, height: 50,
                background: `radial-gradient(circle at top right, ${t.accent}18, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: t.accent, textTransform: "uppercase", marginBottom: 8 }}>
                {t.label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 2, fontVariantNumeric: "tabular-nums" }}>
                {t.daily} <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)", fontSize: 10 }}>daily</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums" }}>
                {t.monthly} <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.3)", fontSize: 10 }}>monthly</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: t.fee === "Free" ? "#10b981" : t.accent }}>
                {t.fee}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CARDS GRID ───────────────────────────────────────── */}
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              padding: "64px 24px", borderRadius: 18,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CreditCard size={22} style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>No cards yet</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>Apply for your first card to get started</p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
            {cards.map((card, idx) => {
              const t = TIERS[card.tierLevel];
              return (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="card-hover"
                  onClick={() => { setSelectedCard(card); setShowDetails(true); setRevealNumber(false); setRevealCVV(false); }}
                  style={{
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card visual */}
                  <div style={{ padding: "16px 16px 12px" }}>
                    <CardFace card={card} reveal={false} />
                  </div>

                  {/* Info strip */}
                  <div style={{
                    padding: "14px 20px 18px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: STATUS_COLOR[card.status],
                          boxShadow: `0 0 6px ${STATUS_COLOR[card.status]}80`,
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[card.status], letterSpacing: "0.06em" }}>
                          {card.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: t.accent,
                          background: t.accentDim, border: `1px solid ${t.cardLine}`,
                          padding: "2px 7px", borderRadius: 4, textTransform: "uppercase",
                        }}>
                          {t.label}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                          color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 4,
                          textTransform: "uppercase",
                        }}>
                          {card.cardType}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <LimitBar label="Daily" spent={card.dailySpent} limit={card.dailyLimit} accent={t.accent} />
                      <LimitBar label="Monthly" spent={card.monthlySpent} limit={card.monthlyLimit} accent={t.accent} />
                    </div>

                    <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 3 }}>
                          Balance
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#10b981", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                          ${fmt(card.balance)}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedCard(card); setShowDetails(true); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "7px 12px", borderRadius: 8, cursor: "pointer", outline: "none",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                          color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Details <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL: APPLY FOR CARD
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <ModalHeader title="Apply for Card" sub="Choose your card type and tier" onClose={() => setShowForm(false)} />

            {/* Card type */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Card Type
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["VIRTUAL", "PHYSICAL"] as const).map(type => (
                  <button
                    key={type}
                    className="tier-btn"
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                      background: selectedType === type ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedType === type ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
                      color: selectedType === type ? "#818cf8" : "rgba(255,255,255,0.4)",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Tier
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(Object.entries(TIERS) as any[]).map(([key, t]: [string, typeof TIERS["BASIC"]]) => (
                  <button
                    key={key}
                    className="tier-btn"
                    onClick={() => setSelectedTier(key as any)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer", outline: "none",
                      background: selectedTier === key ? t.accentDim : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedTier === key ? t.cardLine : "rgba(255,255,255,0.06)"}`,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: selectedTier === key ? t.accent : "rgba(255,255,255,0.55)" }}>
                        {t.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.daily} daily</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.fee === "Free" ? "#10b981" : t.accent }}>
                        {t.fee}
                      </span>
                      {selectedTier === key && <Check size={12} style={{ color: t.accent }} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowForm(false); setShowPayment(true); }}
                style={{
                  flex: 2, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                  color: "#818cf8", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <ArrowUpRight size={13} /> Continue to Payment
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          MODAL: PAYMENT
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPayment && (
          <Modal onClose={() => !paymentProcessing && setShowPayment(false)}>
            <ModalHeader title="Payment" sub="Complete payment to activate your card" onClose={() => !paymentProcessing && setShowPayment(false)} />

            {/* Summary */}
            <div style={{
              padding: "16px", borderRadius: 12, marginBottom: 20,
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { label: "Tier", value: TIERS[selectedTier].label },
                { label: "Type", value: selectedType },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Amount Due</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                  {TIERS[selectedTier].feeNum === 0 ? "Free" : `$${TIERS[selectedTier].feeNum}`}
                </span>
              </div>
            </div>

            {/* Payment methods */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Payment Method
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Wallet Balance", "Credit Card", "Bank Transfer"].map((method, i) => (
                  <label
                    key={method}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                      background: i === 0 ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${i === 0 ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <input type="radio" name="payment" defaultChecked={i === 0} style={{ accentColor: "#10b981" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowPayment(false)} disabled={paymentProcessing}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  opacity: paymentProcessing ? 0.4 : 1,
                }}
              >
                Back
              </button>
              <button
                onClick={handlePaymentConfirm} disabled={paymentProcessing}
                style={{
                  flex: 2, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: paymentProcessing ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {paymentProcessing
                  ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
                  : <><Zap size={13} /> Confirm Payment</>}
              </button>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 14 }}>
              Card will be created after payment confirmation
            </p>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          MODAL: CARD DETAILS
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDetails && selectedCard && (() => {
          const t = TIERS[selectedCard.tierLevel];
          return (
            <Modal onClose={() => setShowDetails(false)}>
              <ModalHeader title="Card Details" onClose={() => setShowDetails(false)} />

              {/* Card visual */}
              <div style={{ marginBottom: 20 }}>
                <CardFace card={selectedCard} reveal={revealNumber} />
              </div>

              {/* Sensitive data */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                {/* Card number */}
                <div style={{
                  padding: "12px 14px", borderRadius: 11,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 7 }}>Card Number</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
                      {revealNumber ? chunkNumber(selectedCard.cardNumber) : "•••• •••• •••• " + selectedCard.cardNumber.slice(-4)}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setRevealNumber(!revealNumber)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 2, outline: "none" }}>
                        {revealNumber ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => copyText(selectedCard.cardNumber, "card")} style={{ background: "none", border: "none", cursor: "pointer", color: copiedCard ? "#10b981" : "rgba(255,255,255,0.35)", padding: 2, outline: "none" }}>
                        {copiedCard ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CVV */}
                <div style={{
                  padding: "12px 14px", borderRadius: 11,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 7 }}>CVV</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em" }}>
                      {revealCVV ? selectedCard.cvv : "•••"}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setRevealCVV(!revealCVV)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 2, outline: "none" }}>
                        {revealCVV ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => copyText(selectedCard.cvv, "cvv")} style={{ background: "none", border: "none", cursor: "pointer", color: copiedCVV ? "#10b981" : "rgba(255,255,255,0.35)", padding: 2, outline: "none" }}>
                        {copiedCVV ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                {[
                  { label: "Expires", value: selectedCard.validThru, mono: true },
                  { label: "Tier", value: t.label, color: t.accent },
                  { label: "Status", value: selectedCard.status, color: STATUS_COLOR[selectedCard.status] },
                ].map(({ label, value, mono, color }) => (
                  <div key={label} style={{ padding: "11px 12px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: color || "rgba(255,255,255,0.75)", fontFamily: mono ? "monospace" : "inherit" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div style={{
                padding: "14px 16px", borderRadius: 11, marginBottom: 16,
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <LimitBar label="Daily Limit" spent={selectedCard.dailySpent} limit={selectedCard.dailyLimit} accent={t.accent} />
                  <LimitBar label="Monthly Limit" spent={selectedCard.monthlySpent} limit={selectedCard.monthlyLimit} accent={t.accent} />
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "14px 0 12px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Balance</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                    ${fmt(selectedCard.balance)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => setBlockConfirm(selectedCard)}
                  style={{
                    padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                    background: selectedCard.status === "BLOCKED" ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
                    border: selectedCard.status === "BLOCKED" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                    color: selectedCard.status === "BLOCKED" ? "#10b981" : "#f43f5e",
                    fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Lock size={12} /> {selectedCard.status === "BLOCKED" ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={() => setDeleteConfirm(selectedCard)}
                  style={{
                    padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                    background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "#f43f5e", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Delete Card
                </button>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Close
              </button>
            </Modal>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          MODAL: DELETE CONFIRMATION
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirm && (
          <Modal onClose={() => !processing && setDeleteConfirm(null)}>
            <ModalHeader title="Delete Card" sub="This action cannot be undone" onClose={() => !processing && setDeleteConfirm(null)} />
            
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                Are you sure you want to delete this {deleteConfirm.tierLevel} card?
              </p>
              <div style={{
                padding: 12, borderRadius: 10,
                background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)",
              }}>
                <p style={{ fontSize: 11, color: "#f87171", marginBottom: 4 }}>Card ending in {deleteConfirm.cardNumber.slice(-4)}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>This will permanently remove the card from your account</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={processing}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  opacity: processing ? 0.5 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteCard(deleteConfirm)}
                disabled={processing}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: processing ? "rgba(244, 63, 94, 0.5)" : "#f43f5e", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  opacity: processing ? 0.5 : 1,
                }}
              >
                {processing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          MODAL: BLOCK/UNBLOCK CONFIRMATION
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {blockConfirm && (
          <Modal onClose={() => !processing && setBlockConfirm(null)}>
            <ModalHeader
              title={blockConfirm.status === "BLOCKED" ? "Unblock Card" : "Block Card"}
              sub={blockConfirm.status === "BLOCKED" ? "Card will be reactivated" : "Card will be temporarily disabled"}
              onClose={() => !processing && setBlockConfirm(null)}
            />
            
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                {blockConfirm.status === "BLOCKED"
                  ? "Unblock this card to resume using it for transactions."
                  : "Blocking this card will prevent it from being used for transactions."}
              </p>
              <div style={{
                padding: 12, borderRadius: 10,
                background: blockConfirm.status === "BLOCKED"
                  ? "rgba(16, 185, 129, 0.08)"
                  : "rgba(251, 146, 60, 0.08)",
                border: blockConfirm.status === "BLOCKED"
                  ? "1px solid rgba(16, 185, 129, 0.2)"
                  : "1px solid rgba(251, 146, 60, 0.2)",
              }}>
                <p style={{ fontSize: 11, color: blockConfirm.status === "BLOCKED" ? "#86efac" : "#fed7aa", marginBottom: 4 }}>
                  Card ending in {blockConfirm.cardNumber.slice(-4)}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  Status: <strong>{blockConfirm.status}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setBlockConfirm(null)}
                disabled={processing}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  opacity: processing ? 0.5 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => handleBlockCard(blockConfirm)}
                disabled={processing}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", outline: "none",
                  background: blockConfirm.status === "BLOCKED"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(251, 146, 60, 0.12)",
                  border: blockConfirm.status === "BLOCKED"
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid rgba(251, 146, 60, 0.3)",
                  color: processing
                    ? blockConfirm.status === "BLOCKED"
                      ? "rgba(16, 185, 129, 0.5)"
                      : "rgba(251, 146, 60, 0.5)"
                    : blockConfirm.status === "BLOCKED"
                    ? "#10b981"
                    : "#fb923c",
                  fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  opacity: processing ? 0.5 : 1,
                }}
              >
                {processing
                  ? (blockConfirm.status === "BLOCKED" ? "Unblocking..." : "Blocking...")
                  : (blockConfirm.status === "BLOCKED" ? "Unblock" : "Block")}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}